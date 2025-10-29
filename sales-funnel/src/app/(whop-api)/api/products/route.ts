import { NextResponse } from "next/server"

// TODO: Replace with Whop products fetch using prod_id
export async function GET() {
  // Placeholder empty list to avoid UI break; integrate Whop fetch later
  return NextResponse.json({ products: [] })
}


