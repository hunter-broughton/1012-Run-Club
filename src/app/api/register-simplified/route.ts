// Minimal placeholder API route to satisfy TypeScript/module requirements
export async function POST() {
  return new Response(null, { status: 204 });
}

export async function GET() {
  return new Response("OK", { status: 200 });
}