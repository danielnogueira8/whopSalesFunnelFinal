import { NextResponse } from "next/server"
import { db } from "~/db"
import { and, eq, lt } from "drizzle-orm"
import { jobs } from "~/db/schema"

export async function POST() {
  const now = new Date()
  const due = await db.select().from(jobs).where(and(eq(jobs.status, "pending"), lt(jobs.runAt, now)))

  // Minimal processor: mark complete; downstream sequence start logic to be added
  for (const job of due) {
    await db.update(jobs).set({ status: "completed" }).where(eq(jobs.id, job.id))
  }

  return NextResponse.json({ processed: due.length })
}


