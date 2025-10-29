import { NextRequest, NextResponse } from "next/server"
import { whop } from "~/lib/whop"
import { env } from "~/env"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const experienceId = searchParams.get("experienceId")

    if (!experienceId) {
      return NextResponse.json({ error: "Missing experienceId" }, { status: 400 })
    }

    // Get company ID from experience
    const experience = await whop.experiences.getExperience({ experienceId })
    const companyId = experience.company.id

    // Fetch products using Whop REST API directly
    // Using the REST API endpoint since SDK method structure is uncertain
    const response = await fetch(
      `https://api.whop.com/api/v2/products?company_id=${companyId}`,
      {
        headers: {
          Authorization: `Bearer ${env.WHOP_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    )

    if (!response.ok) {
      throw new Error(`Whop API error: ${response.status}`)
    }

    const data = await response.json()
    
    // Handle different response structures
    const products = data?.data || data?.products || data || []
    
    return NextResponse.json({ 
      products: (Array.isArray(products) ? products : []).map((p: any) => ({
        id: p.id || p.prod_id || p.productId || "",
        title: p.title || p.name || p.productTitle || "Unnamed Product"
      }))
    })
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json(
      { error: "Failed to fetch products", products: [] },
      { status: 500 }
    )
  }
}


