'use client'

import {
  DehydratedState,
  HydrationBoundary,
  QueryClient,
  QueryClientProvider,
  useQuery,
} from '@tanstack/react-query'
import { type ReactNode, useState, useEffect } from 'react'
import { WhopContext } from './whop-context'
import { whopExperienceQuery, whopUserQuery } from './whop-queries'
import { Loading } from '~/components/loading'

interface WhopProviderProps {
  children: ReactNode
  experienceId: string
  state: DehydratedState
}

export function WhopProvider({ children, experienceId, state }: WhopProviderProps) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: Infinity, // Never refetch automatically
            gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
            retry: false, // Don't retry automatically
            refetchOnWindowFocus: false, // Don't refetch on window focus
            refetchOnReconnect: false, // Don't refetch on reconnect
          },
        },
      }),
  )

  return (
    <QueryClientProvider client={client}>
      <HydrationBoundary state={state}>
        <WhopProviderInner experienceId={experienceId}>{children}</WhopProviderInner>
      </HydrationBoundary>
    </QueryClientProvider>
  )
}

interface WhopProviderInnerProps {
  children: ReactNode
  experienceId: string
}

function WhopProviderInner({ children, experienceId }: WhopProviderInnerProps) {
  const { data: experience } = useQuery(whopExperienceQuery(experienceId))
  const {
    data,
  } = useQuery(whopUserQuery(experienceId))

  // Wait for both queries to be ready
  if (!experience || !data) {
    return <Loading />
  }

  const { user, access } = data

  return (
    <WhopContext.Provider value={{ experience, user, access }}>{children}</WhopContext.Provider>
  )
}
