/**
 * Business logic for GitHub Gist operations
 * Orchestrates data operations and enforces business rules
 */

import { fetchPublicGists, fetchGist, fetchUserGists } from '../data/gist-data';
import type { Gist, GistFilters } from '../types/gist.types';
import { AppError, ErrorCode, transformApiError } from '../utils/errors';

class GistServiceImpl {
  private _cache = new Map<string, Gist>();
  private _cacheExpiry = new Map<string, number>();
  private _config = {
    baseUrl: 'https://api.github.com',
    cacheTimeout: 5 * 60 * 1000, // 5 minutes
  };

  /**
   * Lists public gists with optional filtering
   * @param filters - Optional filters for gist search
   * @returns Promise resolving to array of gists
   */
  async listPublicGists(filters?: GistFilters): Promise<Gist[]> {
    try {
      const params = this._buildUrlParams(filters);
      const rawGists = await fetchPublicGists(params);
      
      return rawGists.map((rawGist: any) => this.formatGistData(rawGist));
    } catch (error) {
      console.error('Error listing public gists:', error);
      throw transformApiError(error);
    }
  }

  /**
   * Gets a specific gist by ID with caching
   * @param id - Gist ID
   * @returns Promise resolving to gist data
   */
  async getGist(id: string): Promise<Gist> {
    if (!this.validateGistId(id)) {
      throw new AppError('Invalid gist ID format', ErrorCode.VALIDATION_ERROR);
    }

    // Check cache first
    const cached = this._getFromCache(id);
    if (cached) {
      return cached;
    }

    try {
      const rawGist = await fetchGist(id);
      const formattedGist = this.formatGistData(rawGist);
      
      // Cache the result
      this._setCache(id, formattedGist);
      
      return formattedGist;
    } catch (error) {
      console.error('Error getting gist:', error);
      throw transformApiError(error);
    }
  }

  /**
   * Searches gists for a specific user
   * @param username - GitHub username
   * @param filters - Optional filters for gist search
   * @returns Promise resolving to array of user's gists
   */
  async searchUserGists(username: string, filters?: GistFilters): Promise<Gist[]> {
    if (!username || username.trim().length === 0) {
      throw new AppError('Username is required', ErrorCode.VALIDATION_ERROR);
    }

    try {
      const params = this._buildUrlParams(filters);
      const rawGists = await fetchUserGists(username.trim(), params);
      
      return rawGists.map((rawGist: any) => this.formatGistData(rawGist));
    } catch (error) {
      console.error('Error searching user gists:', error);
      throw transformApiError(error);
    }
  }

  /**
   * Validates gist ID format
   * @param id - Gist ID to validate
   * @returns True if valid
   */
  validateGistId(id: string): boolean {
    return typeof id === 'string' && id.length > 0 && /^[a-f0-9]+$/i.test(id);
  }

  /**
   * Formats raw gist data from API into typed format
   * @param rawGist - Raw gist data from API
   * @returns Formatted gist object
   */
  formatGistData(rawGist: any): Gist {
    return {
      id: rawGist.id,
      url: rawGist.url,
      html_url: rawGist.html_url,
      description: rawGist.description,
      public: rawGist.public,
      created_at: rawGist.created_at,
      updated_at: rawGist.updated_at,
      files: rawGist.files || {},
      owner: {
        login: rawGist.owner?.login || 'unknown',
        id: rawGist.owner?.id || 0,
        avatar_url: rawGist.owner?.avatar_url || '',
        html_url: rawGist.owner?.html_url || '',
      },
    };
  }

  /**
   * Extracts content from a specific file in a gist
   * @param gist - Gist object
   * @param filename - Name of file to extract
   * @returns File content or null if not found
   */
  extractFileContent(gist: Gist, filename: string): string | null {
    const file = gist.files[filename];
    return file?.content || null;
  }

  private _buildUrlParams(filters?: GistFilters): URLSearchParams | undefined {
    if (!filters) return undefined;

    const params = new URLSearchParams();
    
    if (filters.since) params.append('since', filters.since);
    if (filters.per_page) params.append('per_page', filters.per_page.toString());
    if (filters.page) params.append('page', filters.page.toString());
    
    return params.toString() ? params : undefined;
  }

  private _getFromCache(id: string): Gist | null {
    const expiry = this._cacheExpiry.get(id);
    if (!expiry || Date.now() > expiry) {
      this._cache.delete(id);
      this._cacheExpiry.delete(id);
      return null;
    }
    
    return this._cache.get(id) || null;
  }

  private _setCache(id: string, gist: Gist): void {
    this._cache.set(id, gist);
    this._cacheExpiry.set(id, Date.now() + this._config.cacheTimeout);
  }
}

export const gistService = new GistServiceImpl();
