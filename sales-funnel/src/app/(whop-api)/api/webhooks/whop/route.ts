import { NextResponse } from "next/server"
import crypto from "node:crypto"
import { db } from "~/db"
import { and, eq } from "drizzle-orm"
import { webhookEvents, jobs, sequenceTriggers, sequences, sequenceRuns } from "~/db/schema"

function timingSafeEqual(a: string, b: string) {
  const A = Buffer.from(a)
  const B = Buffer.from(b)
  if (A.length !== B.length) return false
  return crypto.timingSafeEqual(A, B)
}

async function startSequencesByTrigger(type: string, userId: string, productId?: string) {
  // Find sequences with matching immutable trigger
  let rows = await db.select().from(sequenceTriggers).where(eq(sequenceTriggers.type, type as any))
  if (productId) {
    rows = rows.filter((r: any) => !r.productId || r.productId === productId)
  } else {
    rows = rows.filter((r: any) => !r.productId)
  }
  for (const trig of rows) {
    await db.insert(sequenceRuns).values({ sequenceId: trig.sequenceId, userId })
  }
}

export async function POST(req: Request) {
  const rawBody = await req.text()

  // Verify signature if provided
  const secret = process.env.WHOP_WEBHOOK_SECRET
  const sigHeader = req.headers.get("whop-signature") || req.headers.get("Whop-Signature")
  if (secret && sigHeader) {
    const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex")
    if (!timingSafeEqual(expected, sigHeader)) {
      return NextResponse.json({ error: "invalid signature" }, { status: 400 })
    }
  }

  const payload = JSON.parse(rawBody)
  const type = payload?.type || payload?.event || "unknown"

  await db.insert(webhookEvents).values({ type, payload })

  const userId = payload?.user_id || payload?.user?.id || payload?.customer_id
  const productId = payload?.prod_id || payload?.product?.id || payload?.plan?.product_id

  // Cart abandonment: enqueue a check in 60 minutes when checkout starts/pending
  if ((type === "entry_created" || type === "payment_pending") && userId && productId) {
    await db.insert(jobs).values({
      type: "check_abandonment",
      key: `${userId}:${productId}`,
      runAt: new Date(Date.now() + 60 * 60 * 1000),
      data: { userId, productId },
    })
  }

  // Welcome
  if (type === "membership_activated" && userId) {
    await startSequencesByTrigger("welcome_join", userId, productId)
  }

  // Win-back
  if (type === "membership_deactivated" && userId) {
    await startSequencesByTrigger("win_back_cancel", userId)
  }

  // Purchase success (product purchase / upsell) + cancel cart abandonment
  if (type === "payment_succeeded" && userId) {
    await startSequencesByTrigger("product_purchase", userId, productId)
    await startSequencesByTrigger("upsell_purchase", userId, productId)
    if (productId) {
      // Cancel abandonment job if exists
      await db
        .update(jobs)
        .set({ status: "canceled" })
        .where(and(eq(jobs.type, "check_abandonment"), eq(jobs.key, `${userId}:${productId}`)))
    }
  }

  return NextResponse.json({ ok: true })
}


