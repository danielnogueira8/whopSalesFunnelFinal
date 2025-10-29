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

    // Approach 1: Try to get products directly from experience using REST API with expand parameter
    // According to Whop docs: GET /v2/experiences/{id}?expand=[products]
    try {
      console.log('[Products API] Trying to fetch experience with products using expand parameter')
      const experienceResponse = await fetch(
        `https://api.whop.com/api/v2/experiences/${experienceId}?expand=[products]`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${env.WHOP_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      )

      if (experienceResponse.ok) {
        const experienceData = await experienceResponse.json()
        console.log('[Products API] Experience data structure:', Object.keys(experienceData))
        
        // Try to extract products from the experience response
        const experienceProducts = 
          experienceData?.products || 
          experienceData?.data?.products ||
          []
        
        if (Array.isArray(experienceProducts) && experienceProducts.length > 0) {
          console.log(`[Products API] Successfully fetched ${experienceProducts.length} products from experience`)
          return formatProductsResponse(experienceProducts)
        } else {
          console.log('[Products API] Experience response does not contain products array or array is empty')
        }
      } else {
        console.log(`[Products API] Experience expand request failed with status: ${experienceResponse.status}`)
      }
    } catch (experienceError: any) {
      console.error('[Products API] Failed to fetch experience with products:', experienceError)
    }

    // Approach 2: Get company ID from experience and fetch all company products
    const experience = await whop.experiences.getExperience({ experienceId })
    
    if (!experience?.company?.id) {
      console.error('[Products API] Experience or company ID not found:', experience)
      return NextResponse.json(
        { error: "Failed to get company ID from experience", products: [] },
        { status: 500 }
      )
    }
    
    const companyId = experience.company.id
    
    console.log(`[Products API] Fetching products for companyId: ${companyId}`)

    // Try multiple approaches to fetch products
    
    // Approach 3: Try SDK method if available
    let products: any[] = []
    let errorMessage = ""
    
    try {
      // Check if whop.products exists and try listProducts
      if ('products' in whop && typeof (whop as any).products === 'object') {
        console.log('[Products API] Trying SDK method: whop.products.listProducts')
        const sdkResult = await (whop as any).products.listProducts?.({ companyId })
        console.log('[Products API] SDK result:', JSON.stringify(sdkResult, null, 2))
        
        if (sdkResult) {
          products = sdkResult?.data || sdkResult?.products || sdkResult?.nodes || (Array.isArray(sdkResult) ? sdkResult : [])
          if (products.length > 0 || sdkResult) {
            console.log('[Products API] Successfully fetched via SDK')
            return formatProductsResponse(products)
          }
        }
      }
    } catch (sdkError: any) {
      console.error('[Products API] SDK method failed:', sdkError)
      errorMessage += `SDK: ${sdkError.message || sdkError}. `
    }

    // Approach 4: Try REST API endpoint variations to list all company products
    // Based on Whop API docs: https://docs.whop.com/api-reference/products/list-products
    const endpointsToTry = [
      `https://api.whop.com/api/v2/products?company_id=${companyId}`,
      `https://api.whop.com/api/v2/products?companyId=${companyId}`,
    ]

    for (const endpoint of endpointsToTry) {
      try {
        console.log(`[Products API] Trying REST endpoint: ${endpoint}`)
        
        const response = await fetch(endpoint, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${env.WHOP_API_KEY}`,
            'Content-Type': 'application/json',
          },
        })

        const status = response.status
        const responseText = await response.text()
        
        console.log(`[Products API] Response status: ${status}`)
        console.log(`[Products API] Response body:`, responseText.substring(0, 500))

        if (!response.ok) {
          errorMessage += `Endpoint ${endpoint}: ${status} - ${responseText.substring(0, 200)}. `
          continue
        }

        let data
        try {
          data = JSON.parse(responseText)
        } catch (parseError) {
          console.error('[Products API] Failed to parse JSON:', parseError)
          errorMessage += `Failed to parse JSON. `
          continue
        }

        console.log('[Products API] Parsed data structure:', Object.keys(data))

        // Try different response structures
        products = 
          data?.data?.data || // Nested data
          data?.data || // Direct data field
          data?.products?.nodes || // GraphQL-style with nodes
          data?.products || // Direct products field
          (Array.isArray(data?.data) ? data.data : null) || // Array in data
          (Array.isArray(data) ? data : null) || // Direct array
          []

        if (Array.isArray(products) && products.length >= 0) {
          console.log(`[Products API] Successfully fetched ${products.length} products via REST API`)
          return formatProductsResponse(products)
        } else {
          console.log('[Products API] No products found in expected structure, trying alternative parsing')
        }
      } catch (restError: any) {
        console.error(`[Products API] REST endpoint ${endpoint} failed:`, restError)
        errorMessage += `REST ${endpoint}: ${restError.message || restError}. `
      }
    }

    // If we get here, none of the approaches worked
    // Return empty products array instead of error - this allows the UI to still work
    console.error('[Products API] All approaches failed. Errors:', errorMessage)
    console.error('[Products API] Returning empty products array - UI will show "No products found"')
    return NextResponse.json(
      { 
        products: [] 
      },
      { status: 200 }
    )
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


