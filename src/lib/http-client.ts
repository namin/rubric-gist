/**
 * HTTP client configuration for API calls
 * Third-party integration setup
 */

export type RequestConfig = {
  headers?: Record<string, string>;
  timeout?: number;
  signal?: AbortSignal;
};

const BASE_CONFIG = {
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  },
};

/**
 * HTTP client instance with configured methods
 */
export const httpClient = {
  async get(url: string, config?: RequestConfig): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config?.timeout || BASE_CONFIG.timeout);
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: { ...BASE_CONFIG.headers, ...config?.headers },
        signal: config?.signal || controller.signal,
      });
      
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  },

  async post(url: string, data?: any, config?: RequestConfig): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config?.timeout || BASE_CONFIG.timeout);
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { ...BASE_CONFIG.headers, ...config?.headers },
        body: data ? JSON.stringify(data) : undefined,
        signal: config?.signal || controller.signal,
      });
      
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  },

  async put(url: string, data?: any, config?: RequestConfig): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config?.timeout || BASE_CONFIG.timeout);
    
    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: { ...BASE_CONFIG.headers, ...config?.headers },
        body: data ? JSON.stringify(data) : undefined,
        signal: config?.signal || controller.signal,
      });
      
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  },

  async delete(url: string, config?: RequestConfig): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config?.timeout || BASE_CONFIG.timeout);
    
    try {
      const response = await fetch(url, {
        method: 'DELETE',
        headers: { ...BASE_CONFIG.headers, ...config?.headers },
        signal: config?.signal || controller.signal,
      });
      
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  },
};

/**
 * Parses JSON response from HTTP request
 * @param response - Fetch Response object
 * @returns Parsed JSON data
 */
export async function parseJsonResponse(response: Response): Promise<any> {
  if (!response.ok) {
    await handleHttpError(response);
  }
  
  const text = await response.text();
  if (!text) return null;
  
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

/**
 * Handles HTTP errors by throwing appropriate errors
 * @param response - Fetch Response object
 * @throws Error with appropriate message
 */
export async function handleHttpError(response: Response): Promise<never> {
  let errorMessage = `HTTP ${response.status}`;
  
  try {
    const errorBody = await response.text();
    if (errorBody) {
      const parsed = JSON.parse(errorBody);
      errorMessage = parsed.message || errorMessage;
    }
  } catch {
    // Ignore parsing errors, use default message
  }
  
  const error = new Error(errorMessage);
  (error as any).status = response.status;
  (error as any).response = response;
  
  throw error;
}
