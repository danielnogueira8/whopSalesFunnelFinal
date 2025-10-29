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
	// When embedded in iframe on whop.com, always use the env variable
	// When accessing directly (localhost), use window.location.origin
	const baseUrl = 
		typeof window !== 'undefined' && 
		!window.location.origin.includes('whop.com') &&
		window.location.origin.startsWith('http')
			? window.location.origin
			: env.NEXT_PUBLIC_VERCEL_URL.replace(/\/$/, '')
	const normalized = path.startsWith('/') ? path : `/${path}`
	return `${baseUrl}${normalized}`
}

export const whopExperienceQuery = (experienceId: string) => ({
	queryKey: ['experience', experienceId],
	queryFn: async () => {
		const response = await fetch(getApiUrl(`/api/experience/${experienceId}`), {
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json',
			},
		})
		if (!response.ok) throw new Error('Failed to fetch whop experience')
		const result = (await response.json()) as WhopExperience
		return result
	},
})

export const whopUserQuery = (experienceId: string) => ({
	queryKey: ['user', experienceId],
	queryFn: async () => {
		const response = await fetch(getApiUrl(`/api/experience/${experienceId}/user`), {
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json',
			},
		})
		if (!response.ok) throw new Error('Failed to fetch whop user')
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
