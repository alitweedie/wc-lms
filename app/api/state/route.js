const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
const KEY = "wc_lms_state";

const headers = { Authorization: `Bearer ${UPSTASH_TOKEN}` };

export async function GET() {
  try {
    const res = await fetch(`${UPSTASH_URL}/get/${KEY}`, {
      headers,
      cache: "no-store",
    });
    const { result } = await res.json();
    // result is a JSON string — parse it back to an object
    return Response.json(result ? JSON.parse(result) : null);
  } catch (e) {
    console.error("GET error:", e);
    return Response.json(null);
  }
}

export async function POST(req) {
  try {
    const text = await req.text();
    // POST body becomes the value — Upstash appends it to SET /key
    await fetch(`${UPSTASH_URL}/set/${KEY}`, {
      method: "POST",
      headers: { ...headers, "Content-Type": "text/plain" },
      body: text,
    });
    return Response.json({ ok: true });
  } catch (e) {
    console.error("POST error:", e);
    return Response.json({ ok: false });
  }
}
