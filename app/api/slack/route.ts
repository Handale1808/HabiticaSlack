// app/api/slack/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();

  const webhookUrl: unknown = body.webhookUrl;
  const blocks: unknown = body.blocks;

  if (!webhookUrl || typeof webhookUrl !== "string") {
    return NextResponse.json(
      { error: "Missing or invalid webhookUrl in request body" },
      { status: 400 },
    );
  }

  const slackResponse = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ blocks }),
  });

  const text = await slackResponse.text();
  console.log("slack response:", slackResponse.status, text);

  if (!slackResponse.ok) {
    return NextResponse.json(
      { error: `Slack error: ${slackResponse.status} — ${text}` },
      { status: slackResponse.status },
    );
  }

  return NextResponse.json({ ok: true });
}
