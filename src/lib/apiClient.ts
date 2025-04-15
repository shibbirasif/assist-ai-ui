const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

type RequestOptions = {
    method?: HttpMethod;
    body?: Record<string, any>;
    headers?: Record<string, string>;
}

export const apiClient = async <T = any>(endPoint: string, options: RequestOptions = {}): Promise<T> => {
    const { method = 'GET', body, headers } = options;

    const fetchOptions: RequestInit = {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...headers,
        },
    };

    if (body) {
        fetchOptions.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_BASE_URL}${endPoint}`, fetchOptions);

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return response.json();
}