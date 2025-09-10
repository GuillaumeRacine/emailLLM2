import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export function useLabels() {
  const { data, error, isLoading, mutate } = useSWR('/api/gmail/labels', fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 5 * 60 * 1000, // 5 minutes
    refreshInterval: 0, // Don't auto-refresh
  })

  return {
    labels: data || [],
    isLoading,
    isError: error,
    refresh: mutate
  }
}

export function useFilters() {
  const { data, error, isLoading, mutate } = useSWR('/api/gmail/filters', fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 5 * 60 * 1000, // 5 minutes
    refreshInterval: 0,
  })

  return {
    filters: data || [],
    isLoading,
    isError: error,
    refresh: mutate
  }
}

export function useMessages(query = '', maxResults = 20) {
  const { data, error, isLoading, mutate } = useSWR(
    `/api/gmail/messages?q=${encodeURIComponent(query)}&maxResults=${maxResults}`,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 2 * 60 * 1000, // 2 minutes for emails
      refreshInterval: 0,
    }
  )

  return {
    messages: data || [],
    isLoading,
    isError: error,
    refresh: mutate
  }
}

export function useAIContext() {
  const { data, error, isLoading, mutate } = useSWR('/api/ai/context', fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 10 * 60 * 1000, // 10 minutes
    refreshInterval: 0,
  })

  return {
    context: data?.context || '',
    instructions: data?.instructions || '',
    rules: data?.rules || [],
    isLoading,
    isError: error,
    refresh: mutate
  }
}