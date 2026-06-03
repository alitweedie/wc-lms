import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

const KEY = "wc_lms_state";

export async function GET() {
  try {
    const data = await redis.get(KEY);
    return Response.json(data || null);
  } catch (e) {
    console.error("GET error:", e);
    return Response.json(null);
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    await redis.set(KEY, body);
    return Response.json({ ok: true });
  } catch (e) {
    console.error("POST error:", e);
    return Response.json({ ok: false });
  }
}
