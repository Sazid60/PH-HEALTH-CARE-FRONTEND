import { getCookie } from "@/services/auth/tokenHandler";

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BASE_API_URL || 'http://localhost:5000/api/v1';

export const serverFetchHelper = async (endpoint: string, options: RequestInit): Promise<Response> => {
    const { headers, ...restOptions } = options;

    const accessToken = await getCookie('accessToken');


    const response = await fetch(`${BACKEND_API_URL}${endpoint}`, {
        // we will change the headers here for automatically accessing token  
        headers: {
            ...headers,
            // ...(accessToken?{ 'Authorization': `Bearer ${accessToken}` } : {})
            // ...(accessToken ? { 'Authorization': accessToken } : {}) // our backend do not support Authorization 


            // there another problem arose here. as its gonna run in server action we can not access the token from cookie and we have to manually do it.
            
            Cookie : accessToken ? `accessToken=${accessToken}` : ''
        },
        ...restOptions
    })

    return response

}
// how we will add the methods? we are creating a helper function


export const serverFetch = {
    get: async (endpoint: string, options: RequestInit = {}): Promise<Response> => serverFetchHelper(endpoint, { ...options, method: "GET" }),

    post: async (endpoint: string, options: RequestInit = {}): Promise<Response> => serverFetchHelper(endpoint, { ...options, method: "POST" }),

    put: async (endpoint: string, options: RequestInit = {}): Promise<Response> => serverFetchHelper(endpoint, { ...options, method: "PUT" }),

    patch: async (endpoint: string, options: RequestInit = {}): Promise<Response> => serverFetchHelper(endpoint, { ...options, method: "PATCH" }),

    delete: async (endpoint: string, options: RequestInit = {}): Promise<Response> => serverFetchHelper(endpoint, { ...options, method: "DELETE" }),

}

/**
 *                             
 * serverFetch.get("/auth/me")
 * serverFetch.post("/auth/login", { body: JSON.stringify({}) })
 */