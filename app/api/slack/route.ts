// app/api/slack/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();

  const target: string = body.target ?? "dev";
  const webhookUrl =
    target === "daily"
      ? process.env.SLACK_WEBHOOK_DAILY
      : process.env.SLACK_WEBHOOK_BASERATE_DEV;

  if (!webhookUrl) {
    const which = target === "daily" ? "SLACK_WEBHOOK_DAILY" : "SLACK_WEBHOOK_BASERATE_DEV";
    return NextResponse.json(
      { error: `Webhook URL not configured (${which})` },
      { status: 500 },
    );
  }

  const slackResponse = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
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
