import { defaultShouldDehydrateQuery, QueryClient } from '@tanstack/react-query'
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
	// Always use relative path for client-side fetching
	// Server-side fetching is handled directly via the Whop SDK
	// When embedded in iframe, window.location.origin is our app domain, so relative URLs work
	return path
}

export const whopExperienceQuery = (experienceId: string) => ({
	queryKey: ['experience', experienceId],
	queryFn: async () => {
		const response = await fetch(getApiUrl(`/api/experience/${experienceId}`))
		if (!response.ok) throw new Error('Failed to fetch whop experience')
		const result = (await response.json()) as WhopExperience
		return result
	},
})

export const whopUserQuery = (experienceId: string) => ({
	queryKey: ['user', experienceId],
	queryFn: async () => {
		const response = await fetch(getApiUrl(`/api/experience/${experienceId}/user`))
		if (!response.ok) throw new Error('Failed to fetch whop user')
		return response.json() as Promise<{ user: WhopUser; access: WhopAccess }>
	},
})

export const receiptsQuery = () => ({
	queryKey: ['receipts'],
	queryFn: async () => {
		const response = await fetch(getApiUrl('/api/receipts'))
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
