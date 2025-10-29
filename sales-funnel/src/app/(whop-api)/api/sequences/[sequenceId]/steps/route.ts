import { NextResponse } from "next/server"

// Minimal placeholder persistence endpoint
// Accepts `{ steps: any[], updatedAt?: string }` and echoes back.

export async function POST(_req: Request, { params }: { params: Promise<{ sequenceId: string }> }) {
  try {
    const body = await _req.json()
    const { steps } = body ?? {}
    if (!Array.isArray(steps)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
    }
    const { sequenceId } = await params
    // TODO: persist to DB (steps JSON)
    return NextResponse.json({ ok: true, sequenceId, steps, updatedAt: new Date().toISOString() })
  } catch (e) {
    return NextResponse.json({ error: "Failed to save" }, { status: 500 })
  }
}


