import { verifyUserToken, type VerifyUserTokenOptions } from "@whop/api"
import { whop } from "~/lib/whop"

type ProductOut = { id: string; title: string }

function normalizeProducts(input: any): ProductOut[] {
  if (!input) return []

  // Handle GraphQL connection structure: { accessPasses: { nodes: [...] } }
  let arr: any[] = []
  
  if (input?.accessPasses?.nodes && Array.isArray(input.accessPasses.nodes)) {
    // Extract AccessPass objects directly
    arr = input.accessPasses.nodes
  } else if (input?.plans?.nodes && Array.isArray(input.plans.nodes)) {
    // Extract Plan objects, then get their accessPass if available
    arr = input.plans.nodes.map((plan: any) => plan?.accessPass || plan).filter(Boolean)
  } else if (Array.isArray(input?.data)) {
    arr = input.data
  } else if (input?.data?.accessPasses?.nodes && Array.isArray(input.data.accessPasses.nodes)) {
    arr = input.data.accessPasses.nodes
  } else if (input?.data?.plans?.nodes && Array.isArray(input.data.plans.nodes)) {
    arr = input.data.plans.nodes.map((plan: any) => plan?.accessPass || plan).filter(Boolean)
  } else if (input?.data?.accessPasses && Array.isArray(input.data.accessPasses)) {
    arr = input.data.accessPasses
  } else if (input?.data?.plans && Array.isArray(input.data.plans)) {
    arr = input.data.plans.map((plan: any) => plan?.accessPass || plan).filter(Boolean)
  } else if (input?.data?.data && Array.isArray(input.data.data)) {
    arr = input.data.data
  } else if (input?.products?.nodes && Array.isArray(input.products.nodes)) {
    arr = input.products.nodes
  } else if (input?.products && Array.isArray(input.products)) {
    arr = input.products
  } else if (input?.accessPasses && Array.isArray(input.accessPasses)) {
    arr = input.accessPasses
  } else if (input?.plans && Array.isArray(input.plans)) {
    arr = input.plans.map((plan: any) => plan?.accessPass || plan).filter(Boolean)
  } else if (Array.isArray(input)) {
    arr = input
  }

  if (!Array.isArray(arr) || arr.length === 0) {
    return []
  }
  
  return arr.map((p: any) => ({
    id: p?.id || p?.productId || p?.prod_id || p?.access_pass_id || "",
    title: p?.title || p?.name || p?.productTitle || p?.displayName || "Unnamed Product",
  }))
}

export async function fetchAllCompanyProducts({
  experienceId,
  headers,
  devToken,
}: {
  experienceId: string
  headers: Headers
  devToken?: string | null
}): Promise<ProductOut[]> {
  // 1) Verify user from Whop iframe headers; fall back to dev token if provided
  let scoped = whop
  let verifiedUserId: string | undefined
  try {
    const verified = await verifyUserToken(headers as unknown as VerifyUserTokenOptions)
    if (verified?.userId) {
      verifiedUserId = verified.userId
      scoped = scoped.withUser(verified.userId)
    }
  } catch {}

  if (!verifiedUserId && devToken) {
    try {
      const h = new Headers()
      h.set("x-whop-user-token", devToken)
      const verifiedDev = await verifyUserToken(h as unknown as VerifyUserTokenOptions)
      if (verifiedDev?.userId) {
        verifiedUserId = verifiedDev.userId
        scoped = scoped.withUser(verifiedDev.userId)
      }
    } catch {}
  }

  // 2) Resolve companyId from experience
  let companyId = ""
  let experience: any
  try {
    experience = await scoped.experiences.getExperience({ experienceId })
    companyId = experience?.company?.id || ""
    console.log("[fetchAllCompanyProducts] Got companyId:", companyId)
  } catch (e: any) {
    console.error("[fetchAllCompanyProducts] getExperience failed:", e?.message || e)
  }

  // 3) Try company-level lists in order
  if (companyId) {
    try {
      const scopedCompany = scoped.withCompany(companyId)
      const r1 = await scopedCompany.companies.listAccessPasses({ companyId })
      const out1 = normalizeProducts(r1)
      console.log("[fetchAllCompanyProducts] listAccessPasses returned", out1.length, "items")
      if (out1.length > 0) return out1
    } catch (e: any) {
      console.error("[fetchAllCompanyProducts] listAccessPasses failed:", e?.message || e)
    }

    // Fallback: list plans (products may be represented as plans)
    try {
      const scopedCompany = scoped.withCompany(companyId)
      const r2 = await scopedCompany.companies.listPlans({ companyId })
      const out2 = normalizeProducts(r2)
      console.log("[fetchAllCompanyProducts] listPlans returned", out2.length, "items")
      if (out2.length > 0) return out2
    } catch (e: any) {
      console.error("[fetchAllCompanyProducts] listPlans failed:", e?.message || e)
    }
  }

  // 4) Last resort: use experience.products if present
  const outExp = normalizeProducts(experience?.products || experience?.data?.products)
  console.log("[fetchAllCompanyProducts] experience.products fallback returned", outExp.length, "items")
  return outExp
}


