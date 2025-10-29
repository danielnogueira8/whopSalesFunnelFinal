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
    // 1) Try to list access passes for the experience directly (some SDKs require explicit pagination args)
    try {
      const fromExperience = await whop.experiences.listAccessPassesForExperience({ experienceId, limit: 100 }) as any
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
      const experience = await whop.experiences.getExperience({ experienceId }) as any
      companyId = experience?.company?.id || ""
      // Some responses include accessPasses directly on experience
      const expPasses = (experience?.accessPasses || experience?.data?.accessPasses) as any[] | undefined
      if (Array.isArray(expPasses) && expPasses.length > 0) {
        return formatProductsResponse(expPasses)
      }
      // Some older fields may be named products
      const expProducts = (experience?.products || experience?.data?.products) as any[] | undefined
      if (Array.isArray(expProducts) && expProducts.length > 0) {
        return formatProductsResponse(expProducts)
      }
    } catch (e: any) {
      console.error('[Products API] getExperience failed:', e?.message || e)
    }

    if (!companyId) {
      return NextResponse.json({ products: [] }, { status: 200 })
    }

    // 2a) Try company access passes
    try {
      const fromCompany = await whop.companies.listAccessPasses({ companyId, limit: 100 }) as any
      const items = (fromCompany?.data || fromCompany?.accessPasses || (Array.isArray(fromCompany) ? fromCompany : [])) as any[]
      if (Array.isArray(items) && items.length >= 0) {
        return formatProductsResponse(items)
      }
    } catch (e: any) {
      console.error('[Products API] companies.listAccessPasses failed:', e?.message || e)
    }

    // 2b) Last resort: list plans (if your UX treats plans as selectable products)
    try {
      const plansRes = await whop.companies.listPlans({ companyId, limit: 100 }) as any
      const items = (plansRes?.data || plansRes?.plans || (Array.isArray(plansRes) ? plansRes : [])) as any[]
      if (Array.isArray(items) && items.length >= 0) {
        return formatProductsResponse(items)
      }
    } catch (e: any) {
      console.error('[Products API] companies.listPlans failed:', e?.message || e)
    }

    // 3) Try scoping with withCompany helper (some SDK setups require it)
    try {
      const scoped = whop.withCompany(companyId)
      const alt = await scoped.companies.listAccessPasses({ companyId, limit: 100 }) as any
      const items = (alt?.data || alt?.accessPasses || (Array.isArray(alt) ? alt : [])) as any[]
      if (Array.isArray(items) && items.length >= 0) {
        return formatProductsResponse(items)
      }
    } catch (e: any) {
      console.error('[Products API] withCompany.companies.listAccessPasses failed:', e?.message || e)
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


