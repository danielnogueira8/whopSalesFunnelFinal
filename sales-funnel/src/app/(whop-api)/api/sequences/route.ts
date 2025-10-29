import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "~/db";
import { sequences } from "~/db/schema";
import { whop } from "~/lib/whop";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const experienceId = searchParams.get("experienceId");

    if (!experienceId) {
      return NextResponse.json({ error: "Missing experienceId" }, { status: 400 });
    }

    // Get company ID from Whop API
    const experience = await whop.experiences.getExperience({
      experienceId,
    });

    // Fetch sequences for this company
    const allSequences = await db
      .select()
      .from(sequences)
      .where(eq(sequences.companyId, experience.company.id));

    return NextResponse.json({ sequences: allSequences });
  } catch (error) {
    console.error("Error fetching sequences:", error);
    return NextResponse.json(
      { error: "Failed to fetch sequences" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, category, experienceId } = body;

    if (!name || !category || !experienceId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Get company ID from Whop API
    const experience = await whop.experiences.getExperience({
      experienceId,
    });

    // Create new sequence
    const [newSequence] = await db
      .insert(sequences)
      .values({
        name,
        category,
        companyId: experience.company.id,
        status: "draft",
      })
      .returning();

    return NextResponse.json({ sequence: newSequence });
  } catch (error) {
    console.error("Error creating sequence:", error);
    return NextResponse.json(
      { error: "Failed to create sequence" },
      { status: 500 },
    );
  }
}

