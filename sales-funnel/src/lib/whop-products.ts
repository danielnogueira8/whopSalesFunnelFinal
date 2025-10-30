import { verifyUserToken, type VerifyUserTokenOptions } from "@whop/api"
import { whop } from "~/lib/whop"

type ProductOut = { id: string; title: string }

function normalizeProducts(input: any): ProductOut[] {
  const arr =
    (Array.isArray(input?.data) ? input.data : undefined) ||
    input?.data?.data ||
    input?.products?.nodes ||
    input?.products ||
    input?.accessPasses ||
    (Array.isArray(input) ? input : undefined) ||
    []

  if (!Array.isArray(arr)) return []
  return arr.map((p: any) => ({
    id: p?.id || p?.productId || p?.prod_id || "",
    title: p?.title || p?.name || p?.productTitle || "Unnamed Product",
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
  try {
    const verified = await verifyUserToken(headers as unknown as VerifyUserTokenOptions)
    if (verified?.userId) scoped = scoped.withUser(verified.userId)
  } catch {}

  if ((scoped as any) === whop && devToken) {
    try {
      const h = new Headers()
      h.set("x-whop-user-token", devToken)
      const verifiedDev = await verifyUserToken(h as unknown as VerifyUserTokenOptions)
      if (verifiedDev?.userId) scoped = scoped.withUser(verifiedDev.userId)
    } catch {}
  }

  // 2) Resolve companyId from experience
  let companyId = ""
  let experience: any
  try {
    experience = await scoped.experiences.getExperience({ experienceId })
    companyId = experience?.company?.id || ""
  } catch {}

  // 3) Try company-level lists in order
  if (companyId) {
    try {
      const r1 = await scoped.withCompany(companyId).companies.listAccessPasses({ companyId })
      const out1 = normalizeProducts(r1)
      if (out1.length > 0) return out1
    } catch {}

    try {
      const productsApi = (scoped as any).withCompany(companyId).products
      if (productsApi?.listProducts) {
        const r2 = await productsApi.listProducts({ companyId })
        const out2 = normalizeProducts(r2)
        if (out2.length > 0) return out2
      }
    } catch {}

    try {
      const r3 = await scoped.withCompany(companyId).payments.listProductsForCompany({ companyId })
      const out3 = normalizeProducts(r3)
      if (out3.length > 0) return out3
    } catch {}
  }

  // 4) Last resort: use experience.products if present
  const outExp = normalizeProducts(experience?.products || experience?.data?.products)
  return outExp
}


