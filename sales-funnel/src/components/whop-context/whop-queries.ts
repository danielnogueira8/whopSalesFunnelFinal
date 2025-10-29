import { defaultShouldDehydrateQuery, QueryClient } from '@tanstack/react-query'
import { env } from '~/env'
import type { WhopAccess, WhopExperience, WhopUser } from '~/lib/whop'

export const serverQueryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 60 * 1000, // 1 minute
			retry: 1,
		},
		dehydrate: {
			shouldDehydrateQuery: defaultShouldDehydrateQuery,
		},
	},
})

export function getApiUrl(path: string): string {
	// Build absolute URL for client-side fetching
	// This ensures requests work when embedded on whop.com in production
	// Server-side fetching is handled directly via the Whop SDK
	
	let baseUrl: string
	
	if (typeof window !== 'undefined') {
		// Client-side: Check if we're in an iframe on whop.com
		const isInWhopIframe = window.location.origin.includes('whop.com')
		
		if (isInWhopIframe) {
			// When embedded in iframe on whop.com, use the env variable (Vercel URL)
			baseUrl = env.NEXT_PUBLIC_VERCEL_URL.replace(/\/$/, '')
		} else {
			// When accessing directly (localhost or direct Vercel access), use current origin
			baseUrl = window.location.origin
		}
	} else {
		// Server-side: use env variable
		baseUrl = env.NEXT_PUBLIC_VERCEL_URL.replace(/\/$/, '')
	}
	
	// Ensure baseUrl is valid
	if (!baseUrl || baseUrl === 'http://localhost:3000') {
		// Fallback: if env not set, try to infer from window
		if (typeof window !== 'undefined') {
			baseUrl = window.location.origin
		} else {
			baseUrl = 'http://localhost:3000'
		}
	}
	
	const normalized = path.startsWith('/') ? path : `/${path}`
	return `${baseUrl}${normalized}`
}

export const whopExperienceQuery = (experienceId: string) => ({
	queryKey: ['experience', experienceId],
	queryFn: async () => {
		const url = getApiUrl(`/api/experience/${experienceId}`)
		const response = await fetch(url, {
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json',
			},
		})
		if (!response.ok) {
			const errorText = await response.text()
			console.error('Failed to fetch whop experience:', response.status, response.statusText, errorText, 'URL:', url)
			throw new Error(`Failed to fetch whop experience: ${response.status} ${response.statusText}`)
		}
		const result = (await response.json()) as WhopExperience
		return result
	},
})

export const whopUserQuery = (experienceId: string) => ({
	queryKey: ['user', experienceId],
	queryFn: async () => {
		const url = getApiUrl(`/api/experience/${experienceId}/user`)
		const response = await fetch(url, {
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json',
			},
		})
		if (!response.ok) {
			const errorText = await response.text()
			console.error('Failed to fetch whop user:', response.status, response.statusText, errorText, 'URL:', url)
			throw new Error(`Failed to fetch whop user: ${response.status} ${response.statusText}`)
		}
		return response.json() as Promise<{ user: WhopUser; access: WhopAccess }>
	},
})

export const receiptsQuery = () => ({
	queryKey: ['receipts'],
	queryFn: async () => {
		const response = await fetch(getApiUrl('/api/receipts'), {
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json',
			},
		})
		if (!response.ok) throw new Error('Failed to fetch receipts')
		return response.json() as Promise<{
			accessPasses: Array<{
				id: string
				type: 'one-time' | 'subscription'
				receipts: Array<{
					amountPaid: number
					paidAt: string
					subscriptionStatus?: string | null
					membershipId?: string | null
					member?: {
						id: string
					} | null
				}>
			}>
		}>
	},
})
