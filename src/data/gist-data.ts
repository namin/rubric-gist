/**
 * Direct API calls to GitHub Gist API
 * Returns raw data or throws raw errors
 */

import { httpClient } from '../lib/http-client';

const API_BASE_URL = 'https://api.github.com';

/**
 * Fetches public gists from GitHub API
 * @param params - URL search parameters for filtering
 * @returns Raw API response
 */
export async function fetchPublicGists(params?: URLSearchParams): Promise<any> {
  const url = params 
    ? `${API_BASE_URL}/gists/public?${params.toString()}`
    : `${API_BASE_URL}/gists/public`;
    
  const response = await httpClient.get(url);
  
  if (!response.ok) {
    const error = new Error(`Failed to fetch public gists: ${response.status}`);
    (error as any).status = response.status;
    throw error;
  }
  
  return response.json();
}

/**
 * Fetches a specific gist by ID from GitHub API
 * @param id - Gist ID
 * @returns Raw API response
 */
export async function fetchGist(id: string): Promise<any> {
  const url = `${API_BASE_URL}/gists/${id}`;
  
  const response = await httpClient.get(url);
  
  if (!response.ok) {
    const error = new Error(`Failed to fetch gist: ${response.status}`);
    (error as any).status = response.status;
    throw error;
  }
  
  return response.json();
}

/**
 * Fetches gists for a specific user from GitHub API
 * @param username - GitHub username
 * @param params - URL search parameters for filtering
 * @returns Raw API response
 */
export async function fetchUserGists(username: string, params?: URLSearchParams): Promise<any> {
  const url = params
    ? `${API_BASE_URL}/users/${username}/gists?${params.toString()}`
    : `${API_BASE_URL}/users/${username}/gists`;
    
  const response = await httpClient.get(url);
  
  if (!response.ok) {
    const error = new Error(`Failed to fetch user gists: ${response.status}`);
    (error as any).status = response.status;
    throw error;
  }
  
  return response.json();
}
