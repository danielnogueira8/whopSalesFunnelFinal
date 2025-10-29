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

    // Preferred approach: Use Whop GraphQL SDK methods (works inside Whop iframe or with privileged App API key)
    // 1) Try to list access passes for the experience directly
    try {
      const fromExperience = await whop.experiences.listAccessPassesForExperience({ experienceId }) as any
      const items = (fromExperience?.data || fromExperience?.accessPasses || (Array.isArray(fromExperience) ? fromExperience : [])) as any[]
      if (Array.isArray(items) && items.length >= 0) {
        return formatProductsResponse(items)
      }
    } catch (e: any) {
      console.error('[Products API] experiences.listAccessPassesForExperience failed:', e?.message || e)
    }

    // 2) Fallback: get companyId from experience, then list company access passes or plans
    let companyId = ""
    try {
      const experience = await whop.experiences.getExperience({ experienceId })
      companyId = experience?.company?.id || ""
    } catch (e: any) {
      console.error('[Products API] getExperience failed:', e?.message || e)
    }

    if (!companyId) {
      return NextResponse.json({ products: [] }, { status: 200 })
    }

    // 2a) Try company access passes
    try {
      const fromCompany = await whop.companies.listAccessPasses({ companyId }) as any
      const items = (fromCompany?.data || fromCompany?.accessPasses || (Array.isArray(fromCompany) ? fromCompany : [])) as any[]
      if (Array.isArray(items) && items.length >= 0) {
        return formatProductsResponse(items)
      }
    } catch (e: any) {
      console.error('[Products API] companies.listAccessPasses failed:', e?.message || e)
    }

    // 2b) Last resort: list plans (if your UX treats plans as selectable products)
    try {
      const plansRes = await whop.companies.listPlans({ companyId }) as any
      const items = (plansRes?.data || plansRes?.plans || (Array.isArray(plansRes) ? plansRes : [])) as any[]
      if (Array.isArray(items) && items.length >= 0) {
        return formatProductsResponse(items)
      }
    } catch (e: any) {
      console.error('[Products API] companies.listPlans failed:', e?.message || e)
    }

    // If everything fails, return empty list so UI shows "No products found"
    return NextResponse.json({ products: [] }, { status: 200 })
  } catch (error: any) {
    console.error("[Products API] Unexpected error:", error)
    // Return empty array instead of error to prevent 500 and allow UI to work
    return NextResponse.json(
      { 
        products: [] 
      },
      { status: 200 }
    )
  }
}

function formatProductsResponse(products: any[]) {
  return NextResponse.json({ 
    products: products.map((p: any) => ({
      id: p.id || p.prod_id || p.productId || p.prodId || "",
      title: p.title || p.name || p.productTitle || "Unnamed Product"
    }))
  })
}


