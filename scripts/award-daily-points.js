// @ts-check
require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");
const WIN_CONDITIONS = require("./win-conditions.js");

const NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const NEXT_PUBLIC_SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const OPENROUTER_API_KEY = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;

if (!NEXT_PUBLIC_SUPABASE_URL || !NEXT_PUBLIC_SUPABASE_ANON_KEY || !OPENROUTER_API_KEY) {
  console.error(
    "Missing required environment variables: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, NEXT_PUBLIC_OPENROUTER_API_KEY"
  );
  process.exit(1);
}

const supabase = createClient(NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY);

const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

function stripMarkdownFences(text) {
  return text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "").trim();
}

async function findActiveUserIds() {
  // Get user IDs from DoneItems created today via DoneItems -> Lists -> Uploads
  const { data: doneItemLists, error: doneErr } = await supabase
    .from("DoneItems")
    .select("list_id")
    .gte("created_at", `${today}T00:00:00.000Z`)
    .lt("created_at", `${today}T23:59:59.999Z`);

  if (doneErr) {
    console.error("Error querying DoneItems:", doneErr.message);
    return [];
  }

  const listIds = [...new Set((doneItemLists || []).map((r) => r.list_id))];

  let userIdsFromDoneItems = [];
  if (listIds.length > 0) {
    const { data: lists, error: listsErr } = await supabase
      .from("Lists")
      .select("upload_id")
      .in("id", listIds);

    if (listsErr) {
      console.error("Error querying Lists for upload_ids:", listsErr.message);
    } else {
      const uploadIds = [...new Set((lists || []).map((r) => r.upload_id))];
      if (uploadIds.length > 0) {
        const { data: uploads, error: uploadsErr } = await supabase
          .from("Uploads")
          .select("user_id")
          .in("id", uploadIds);

        if (uploadsErr) {
          console.error("Error querying Uploads:", uploadsErr.message);
        } else {
          userIdsFromDoneItems = (uploads || []).map((r) => r.user_id);
        }
      }
    }
  }

  // Also get user IDs from Lists completed today
  const { data: completedLists, error: completedErr } = await supabase
    .from("Lists")
    .select("upload_id")
    .eq("completed_at", today);

  let userIdsFromLists = [];
  if (completedErr) {
    console.error("Error querying Lists completed today:", completedErr.message);
  } else {
    const uploadIds = [...new Set((completedLists || []).map((r) => r.upload_id))];
    if (uploadIds.length > 0) {
      const { data: uploads, error: uploadsErr } = await supabase
        .from("Uploads")
        .select("user_id")
        .in("id", uploadIds);

      if (uploadsErr) {
        console.error("Error querying Uploads from completed lists:", uploadsErr.message);
      } else {
        userIdsFromLists = (uploads || []).map((r) => r.user_id);
      }
    }
  }

  return [...new Set([...userIdsFromDoneItems, ...userIdsFromLists])];
}

async function isAlreadyAwarded(userId) {
  const { data, error } = await supabase
    .from("StatLedger")
    .select("id")
    .eq("user_id", userId)
    .like("reason", `daily-award:${today}:%`)
    .limit(1);

  if (error) {
    console.error(`Error checking idempotency for user ${userId}:`, error.message);
    return false;
  }
  return data && data.length > 0;
}

async function fetchUserActivity(userId) {
  // Get all Lists for this user completed today or created today via Uploads
  const { data: uploads } = await supabase
    .from("Uploads")
    .select("id")
    .eq("user_id", userId);

  const uploadIds = (uploads || []).map((u) => u.id);
  if (uploadIds.length === 0) return { items: [], categories: [] };

  const { data: lists } = await supabase
    .from("Lists")
    .select("id")
    .in("upload_id", uploadIds);

  const todayListIds = (lists || []).map((l) => l.id);
  if (todayListIds.length === 0) return { items: [], categories: [] };

  const { data: doneItems, error: itemsErr } = await supabase
    .from("DoneItems")
    .select("text, category, created_at")
    .in("list_id", todayListIds)
    .gte("created_at", `${today}T00:00:00.000Z`)
    .lt("created_at", `${today}T23:59:59.999Z`);

  if (itemsErr) {
    console.error(`Error fetching DoneItems for user ${userId}:`, itemsErr.message);
    return { items: [], categories: [] };
  }

  const items = (doneItems || []).map((i) => ({ text: i.text, category: i.category || null }));
  const categories = [...new Set(items.map((i) => i.category).filter(Boolean))];

  return { items, categories };
}

async function callOpenRouter(activitySummary, conditionsForPrompt) {
  const systemMessage = `You are evaluating a user's daily task activity against a list of win conditions.
Return ONLY a valid JSON array of the conditions that were met. Each element must have exactly two fields:
- "name": the exact condition name from the provided list (do not invent new names)
- "amount": a single integer representing how many points to award, appropriate to the level of activity

Return no preamble, no markdown fences, no explanation — only the raw JSON array.
If no conditions were met, return an empty array: []`;

  const userMessage = `User activity for today (${today}):
Total tasks completed: ${activitySummary.items.length}
Categories used: ${activitySummary.categories.length > 0 ? activitySummary.categories.join(", ") : "none recorded"}
Tasks:
${activitySummary.items.map((i, idx) => `${idx + 1}. ${i.text}${i.category ? ` [${i.category}]` : ""}`).join("\n")}

Win conditions to evaluate:
${conditionsForPrompt.map((c) => `- name: "${c.name}"\n  description: ${c.description}`).join("\n")}

Return only the conditions that were met as a JSON array with "name" and "amount" fields.`;

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
    },
    body: JSON.stringify({
      model: "anthropic/claude-haiku-4-5",
      max_tokens: 1000,
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: userMessage },
      ],
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`OpenRouter error: ${response.status} — ${errText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

async function processUser(userId) {
  const activity = await fetchUserActivity(userId);

  if (activity.items.length === 0) {
    console.log(`User ${userId}: no items found for today, skipping.`);
    return null;
  }

  const conditionsForPrompt = WIN_CONDITIONS.map((c) => ({
    name: c.name,
    description: c.description,
  }));

  let rawContent;
  try {
    rawContent = await callOpenRouter(activity, conditionsForPrompt);
  } catch (err) {
    console.error(`User ${userId}: OpenRouter call failed — ${err.message}`);
    return null;
  }

  let aiAwards;
  try {
    const cleaned = stripMarkdownFences(rawContent);
    aiAwards = JSON.parse(cleaned);
    if (!Array.isArray(aiAwards)) throw new Error("Response is not an array");
  } catch (err) {
    console.error(`User ${userId}: Failed to parse AI response — ${err.message}`);
    console.error("Raw content was:", rawContent);
    return null;
  }

  const validatedAwards = [];
  for (const award of aiAwards) {
    const condition = WIN_CONDITIONS.find((c) => c.name === award.name);
    if (!condition) {
      console.warn(`User ${userId}: AI returned unknown condition "${award.name}" — discarding.`);
      continue;
    }
    const clampedAmount = Math.max(
      condition.min_amount,
      Math.min(condition.max_amount, Math.round(award.amount))
    );
    validatedAwards.push({
      user_id: userId,
      stat_type: condition.stat_type,
      amount: clampedAmount,
      reason: `daily-award:${today}:${condition.name}`,
      conditionName: condition.name,
    });
  }

  if (validatedAwards.length === 0) {
    console.log(`User ${userId}: no conditions met today.`);
    return { awarded: [] };
  }

  const ledgerRows = validatedAwards.map(({ conditionName: _drop, ...row }) => row);
  const { error: insertErr } = await supabase.from("StatLedger").insert(ledgerRows);

  if (insertErr) {
    console.error(`User ${userId}: StatLedger insert failed — ${insertErr.message}`);
    return null;
  }

  // Update UserStats
  const { data: statsRow, error: statsErr } = await supabase
    .from("UserStats")
    .select("user_id, acorns, wonder, magic")
    .eq("user_id", userId)
    .maybeSingle();

  if (statsErr) {
    console.error(`User ${userId}: Failed to read UserStats — ${statsErr.message}`);
    return { awarded: validatedAwards };
  }

  const totals = { acorns: 0, wonder: 0, magic: 0 };
  for (const award of validatedAwards) {
    totals[award.stat_type] = (totals[award.stat_type] || 0) + award.amount;
  }

  if (!statsRow) {
    const { error: insertStatsErr } = await supabase.from("UserStats").insert({
      user_id: userId,
      level: 1,
      acorns: totals.acorns,
      wonder: totals.wonder,
      magic: totals.magic,
    });
    if (insertStatsErr) {
      console.error(`User ${userId}: Failed to insert UserStats — ${insertStatsErr.message}`);
    }
  } else {
    const updates = {};
    if (totals.acorns) updates.acorns = statsRow.acorns + totals.acorns;
    if (totals.wonder) updates.wonder = statsRow.wonder + totals.wonder;
    if (totals.magic) updates.magic = statsRow.magic + totals.magic;

    if (Object.keys(updates).length > 0) {
      const { error: updateErr } = await supabase
        .from("UserStats")
        .update(updates)
        .eq("user_id", userId);
      if (updateErr) {
        console.error(`User ${userId}: Failed to update UserStats — ${updateErr.message}`);
      }
    }
  }

  return { awarded: validatedAwards, totals };
}

async function main() {
  console.log(`\n=== Daily Points Award — ${today} ===\n`);

  const activeUserIds = await findActiveUserIds();
  if (activeUserIds.length === 0) {
    console.log("No active users found for today. Exiting.");
    return;
  }

  console.log(`Found ${activeUserIds.length} active user(s) for today.\n`);

  let totalProcessed = 0;
  let totalSkipped = 0;
  let totalAwards = 0;

  for (const userId of activeUserIds) {
    const alreadyDone = await isAlreadyAwarded(userId);
    if (alreadyDone) {
      console.log(`User ${userId}: already awarded today — skipping.`);
      totalSkipped++;
      continue;
    }

    const result = await processUser(userId);
    if (!result) {
      console.log(`User ${userId}: processing failed — see errors above.`);
      continue;
    }

    totalProcessed++;
    totalAwards += result.awarded.length;

    if (result.awarded.length === 0) continue;

    const wonderTotal = result.awarded
      .filter((a) => a.stat_type === "wonder")
      .reduce((sum, a) => sum + a.amount, 0);
    const magicTotal = result.awarded
      .filter((a) => a.stat_type === "magic")
      .reduce((sum, a) => sum + a.amount, 0);
    const acornsTotal = result.awarded
      .filter((a) => a.stat_type === "acorns")
      .reduce((sum, a) => sum + a.amount, 0);

    const parts = [];
    if (wonderTotal) parts.push(`wonder +${wonderTotal}`);
    if (magicTotal) parts.push(`magic +${magicTotal}`);
    if (acornsTotal) parts.push(`acorns +${acornsTotal}`);

    const conditionNames = result.awarded.map((a) => a.conditionName || a.reason.split(":")[2]).join(", ");
    console.log(
      `User ${userId}: awarded ${result.awarded.length} condition(s) [${conditionNames}] — ${parts.join(", ")}`
    );
  }

  console.log(
    `\n=== Summary: ${totalProcessed} processed, ${totalSkipped} skipped, ${totalAwards} total awards written ===`
  );
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
