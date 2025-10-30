import { verifyUserToken, type VerifyUserTokenOptions } from "@whop/api"
import { whop } from "~/lib/whop"

type ProductOut = { id: string; title: string }

function normalizeProducts(input: any): ProductOut[] {
  if (!input) {
    console.log("[normalizeProducts] input is null/undefined")
    return []
  }

  const arr =
    (Array.isArray(input?.data) ? input.data : undefined) ||
    input?.data?.accessPasses ||
    input?.data?.plans ||
    input?.data?.data ||
    input?.products?.nodes ||
    input?.products ||
    input?.accessPasses ||
    input?.plans ||
    (Array.isArray(input) ? input : undefined) ||
    []

  if (!Array.isArray(arr)) {
    console.log("[normalizeProducts] Could not extract array, input structure:", JSON.stringify(input, null, 2).substring(0, 300))
    return []
  }
  
  console.log("[normalizeProducts] Extracted array with", arr.length, "items, sample:", arr[0] ? JSON.stringify(arr[0], null, 2).substring(0, 200) : "none")
  
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
    console.log("[fetchAllCompanyProducts] Experience response keys:", Object.keys(experience || {}))
    if (experience?.products) {
      console.log("[fetchAllCompanyProducts] experience.products:", JSON.stringify(experience.products, null, 2).substring(0, 500))
    }
    if (experience?.data?.products) {
      console.log("[fetchAllCompanyProducts] experience.data.products:", JSON.stringify(experience.data.products, null, 2).substring(0, 500))
    }
  } catch (e: any) {
    console.error("[fetchAllCompanyProducts] getExperience failed:", e?.message || e)
  }

  // 3) Try company-level lists in order
  if (companyId) {
    try {
      const scopedCompany = scoped.withCompany(companyId)
      const r1 = await scopedCompany.companies.listAccessPasses({ companyId })
      console.log("[fetchAllCompanyProducts] listAccessPasses raw response:", JSON.stringify(r1, null, 2).substring(0, 1000))
      const out1 = normalizeProducts(r1)
      console.log("[fetchAllCompanyProducts] listAccessPasses normalized returned", out1.length, "items")
      if (out1.length > 0) return out1
    } catch (e: any) {
      console.error("[fetchAllCompanyProducts] listAccessPasses failed:", e?.message || e)
    }

    // Fallback: list plans (products may be represented as plans)
    try {
      const scopedCompany = scoped.withCompany(companyId)
      const r2 = await scopedCompany.companies.listPlans({ companyId })
      console.log("[fetchAllCompanyProducts] listPlans raw response:", JSON.stringify(r2, null, 2).substring(0, 1000))
      const out2 = normalizeProducts(r2)
      console.log("[fetchAllCompanyProducts] listPlans normalized returned", out2.length, "items")
      if (out2.length > 0) return out2
    } catch (e: any) {
      console.error("[fetchAllCompanyProducts] listPlans failed:", e?.message || e)
    }

    // Also try without scoping - maybe it needs companyId in params but not scoped
    try {
      const r3 = await scoped.companies.listAccessPasses({ companyId })
      console.log("[fetchAllCompanyProducts] listAccessPasses (unscoped) raw response:", JSON.stringify(r3, null, 2).substring(0, 1000))
      const out3 = normalizeProducts(r3)
      console.log("[fetchAllCompanyProducts] listAccessPasses (unscoped) normalized returned", out3.length, "items")
      if (out3.length > 0) return out3
    } catch (e: any) {
      console.error("[fetchAllCompanyProducts] listAccessPasses (unscoped) failed:", e?.message || e)
    }

    try {
      const r4 = await scoped.companies.listPlans({ companyId })
      console.log("[fetchAllCompanyProducts] listPlans (unscoped) raw response:", JSON.stringify(r4, null, 2).substring(0, 1000))
      const out4 = normalizeProducts(r4)
      console.log("[fetchAllCompanyProducts] listPlans (unscoped) normalized returned", out4.length, "items")
      if (out4.length > 0) return out4
    } catch (e: any) {
      console.error("[fetchAllCompanyProducts] listPlans (unscoped) failed:", e?.message || e)
    }
  }

  // 4) Last resort: use experience.products if present
  const outExp = normalizeProducts(experience?.products || experience?.data?.products)
  console.log("[fetchAllCompanyProducts] experience.products fallback returned", outExp.length, "items")
  return outExp
}


