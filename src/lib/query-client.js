import { QueryClient } from '@tanstack/react-query';


export const queryClientInstance = new QueryClient({
	defaultOptions: {
		queries: {
			refetchOnWindowFocus: false,
			retry: 1,
		},
		mutations: {
			// Never auto-retry mutations — would cause duplicate side effects
			// (double Stripe charges, duplicate entity writes, etc.).
			retry: 0,
		},
	},
});