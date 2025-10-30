import { NextRequest, NextResponse } from "next/server"
import { whop } from "~/lib/whop"
import { env } from "~/env"
import { verifyUserToken } from "@whop/api"
import { fetchAllCompanyProducts } from "~/lib/whop-products"

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
    const devToken = searchParams.get("whop-dev-user-token") || req.headers.get("whop-dev-user-token") || req.headers.get("x-whop-user-token") || undefined
    const list = await fetchAllCompanyProducts({ experienceId, headers: req.headers, devToken })
    return NextResponse.json({ products: list })
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


