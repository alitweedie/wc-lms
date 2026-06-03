const URL = process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
const KEY = "wc_lms_state";

export async function GET() {
  const res = await fetch(`${URL}/get/${KEY}`, {
    headers: { Authorization: `Bearer ${TOKEN}` },
    cache: "no-store",
  });
  const data = await res.json();
  return Response.json(data.result ? JSON.parse(data.result) : null);
}

export async function POST(req) {
  const body = await req.text();
  await fetch(`${URL}/set/${KEY}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  return Response.json({ ok: true });
}
