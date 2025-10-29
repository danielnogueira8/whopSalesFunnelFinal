import { NextRequest, NextResponse } from "next/server"
import { whop } from "~/lib/whop"
import { env } from "~/env"
import { verifyUserToken } from "@whop/api"

// Ensure Node.js runtime so Whop headers are preserved and verifiable
export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const experienceId = searchParams.get("experienceId")
    const debug = searchParams.get("debug") === "1"

    if (!experienceId) {
      return NextResponse.json({ error: "Missing experienceId" }, { status: 400 })
    }

    // Preferred approach: Use Whop GraphQL SDK methods (works inside Whop iframe or with privileged App API key)
    // Try to scope with the real iframe user if available
    let scopedByUser = whop
    let verifiedUserId: string | undefined
    try {
      const verified = await verifyUserToken(req.headers as any)
      if (verified?.userId) {
        verifiedUserId = verified.userId
        scopedByUser = scopedByUser.withUser(verified.userId)
      }
    } catch {}

    // Dev fallback: allow token via query (?whop-dev-user-token=...) or header
    if (!verifiedUserId) {
      try {
        const devToken = searchParams.get("whop-dev-user-token") || req.headers.get("whop-dev-user-token") || req.headers.get("x-whop-user-token")
        if (devToken) {
          const h = new Headers()
          h.set("x-whop-user-token", devToken)
          const verifiedDev = await verifyUserToken(h as any)
          if (verifiedDev?.userId) {
            verifiedUserId = verifiedDev.userId
            scopedByUser = scopedByUser.withUser(verifiedDev.userId)
          }
        }
      } catch {}
    }

    if (debug) {
      const headersPreview: Record<string, string | string[]> = {}
      for (const [k, v] of (req.headers as any)) {
        if (String(k).toLowerCase().startsWith("authorization")) continue
        headersPreview[k] = v
      }
      return NextResponse.json({
        debug: true,
        host: req.headers.get("host"),
        xForwardedHost: req.headers.get("x-forwarded-host"),
        referer: req.headers.get("referer"),
        verifiedUserId: verifiedUserId ?? null,
        experienceId,
        headers: Object.keys(headersPreview),
      })
    }
    // 1) Try to list access passes for the experience directly (some SDKs require explicit pagination args)
    try {
      const fromExperience = await scopedByUser.experiences.listAccessPassesForExperience({ experienceId }) as any
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
      const experience = await scopedByUser.experiences.getExperience({ experienceId }) as any
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
      const fromCompany = await scopedByUser.withCompany(companyId).companies.listAccessPasses({ companyId }) as any
      const items = (fromCompany?.data || fromCompany?.accessPasses || (Array.isArray(fromCompany) ? fromCompany : [])) as any[]
      if (Array.isArray(items) && items.length >= 0) {
        return formatProductsResponse(items)
      }
    } catch (e: any) {
      console.error('[Products API] companies.listAccessPasses failed:', e?.message || e)
    }

    // 2b) Last resort: list plans (if your UX treats plans as selectable products)
    try {
      const plansRes = await scopedByUser.withCompany(companyId).companies.listPlans({ companyId }) as any
      const items = (plansRes?.data || plansRes?.plans || (Array.isArray(plansRes) ? plansRes : [])) as any[]
      if (Array.isArray(items) && items.length >= 0) {
        return formatProductsResponse(items)
      }
    } catch (e: any) {
      console.error('[Products API] companies.listPlans failed:', e?.message || e)
    }

    // 3) Try scoping with withCompany and withUser (some SDK setups require both)
    try {
      const scoped = scopedByUser.withCompany(companyId).withUser(env.NEXT_PUBLIC_WHOP_AGENT_USER_ID)
      const alt = await scoped.companies.listAccessPasses({ companyId }) as any
      const items = (alt?.data || alt?.accessPasses || (Array.isArray(alt) ? alt : [])) as any[]
      if (Array.isArray(items) && items.length >= 0) {
        return formatProductsResponse(items)
      }
    } catch (e: any) {
      console.error('[Products API] withCompany+withUser companies.listAccessPasses failed:', e?.message || e)
    }

    // 4) As a final attempt, try scoped plans
    try {
      const scoped = scopedByUser.withCompany(companyId).withUser(env.NEXT_PUBLIC_WHOP_AGENT_USER_ID)
      const plansRes = await scoped.companies.listPlans({ companyId }) as any
      const items = (plansRes?.data || plansRes?.plans || (Array.isArray(plansRes) ? plansRes : [])) as any[]
      if (Array.isArray(items) && items.length >= 0) {
        return formatProductsResponse(items)
      }
    } catch (e: any) {
      console.error('[Products API] withCompany+withUser companies.listPlans failed:', e?.message || e)
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


