import { NextResponse } from "next/server"
import { db } from "~/db"
import { eq } from "drizzle-orm"
import { sequenceTriggers } from "~/db/schema"

export async function GET(_req: Request, { params }: { params: { sequenceId: string } }) {
  const rows = await db.select().from(sequenceTriggers).where(eq(sequenceTriggers.sequenceId, params.sequenceId))
  return NextResponse.json({ trigger: rows[0] ?? null })
}

export async function PUT(req: Request, { params }: { params: { sequenceId: string } }) {
  const body = await req.json()
  const { type, productId, delayMinutes } = body ?? {}
  if (!type) return NextResponse.json({ error: "Missing type" }, { status: 400 })
  const existing = await db.select().from(sequenceTriggers).where(eq(sequenceTriggers.sequenceId, params.sequenceId))
  if (existing[0]) {
    await db
      .update(sequenceTriggers)
      .set({ type, productId, delayMinutes })
      .where(eq(sequenceTriggers.id, existing[0].id))
  } else {
    await db.insert(sequenceTriggers).values({ sequenceId: params.sequenceId, type, productId, delayMinutes })
  }
  return NextResponse.json({ ok: true })
}


