import { NextResponse } from "next/server"

// Minimal placeholder persistence endpoint
// Accepts `{ steps: any[], updatedAt?: string }` and echoes back.

export async function POST(_req: Request, { params }: { params: { sequenceId: string } }) {
  try {
    const body = await _req.json()
    const { steps } = body ?? {}
    if (!Array.isArray(steps)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
    }
    // TODO: persist to DB (steps JSON)
    return NextResponse.json({ ok: true, sequenceId: params.sequenceId, steps, updatedAt: new Date().toISOString() })
  } catch (e) {
    return NextResponse.json({ error: "Failed to save" }, { status: 500 })
  }
}


