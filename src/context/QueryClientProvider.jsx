import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            // retry: 1, 

            // How long the data is considered fresh, 
            // During this time, React Query won't refetch even if component remounts
            staleTime: 5 * 60 * 1000, // 5 minutes of freshness

            // How long unused data stays in memory after all components unmount
            // It's like a "memory cleanup timer"
            // Keep this data in memory for 30 minutes after nobody needs it
            cacheTime: 30 * 60 * 1000, // 30 minutes of cache
        },
    },
});

const CustomQueryClientProvider = ({ children }) => {
    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
};

export default CustomQueryClientProvider;