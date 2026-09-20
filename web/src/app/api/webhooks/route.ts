import { NextResponse } from "next/server";
import { enqueueWebhook } from "@/lib/queues/enqueue";
import { env } from "@/lib/env";
import { verifyShopifyWebhook } from "@/lib/shopify/webhook";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const rawBody = Buffer.from(await request.arrayBuffer());
  const hmac = request.headers.get("x-shopify-hmac-sha256");
  const shop = request.headers.get("x-shopify-shop-domain");
  const topic = request.headers.get("x-shopify-topic");
  const webhookId = request.headers.get("x-shopify-webhook-id");

  if (!shop || !topic) {
    return NextResponse.json({ error: "Missing shop or topic" }, { status: 400 });
  }

  const valid = verifyShopifyWebhook(rawBody, hmac, env("SHOPIFY_API_SECRET"));
  if (!valid) {
    return NextResponse.json({ error: "Invalid hmac" }, { status: 401 });
  }

  let payload: unknown = {};
  if (rawBody.length > 0) {
    payload = JSON.parse(rawBody.toString("utf8"));
  }

  await enqueueWebhook({
    topic,
    shop,
    payload,
    webhookId,
  });

  return NextResponse.json({ ok: true });
}
