/**
 * Container component that orchestrates gist selection and display
 * Manages UI state and coordinates child components
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { List, Grid, X, AlertCircle } from 'lucide-react';
import clsx from 'clsx';
import { useGistStore } from '../stores/gist-store';
import { GistList } from './GistList';
import { GistDetail } from './GistDetail';
import { GistSearch } from './GistSearch';
import type { Gist, GistFilters } from '../types/gist.types';
import styles from '../styles/GistContainer.module.css';

export default function GistContainer() {
  const {
    gists,
    selectedGist,
    isLoading,
    error,
    fetchPublicGists,
    fetchGist,
    searchUserGists,
    setSelectedGist,
    setFilters,
    clearError,
  } = useGistStore();

  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [selectedFile, setSelectedFile] = useState<string | undefined>();
  const abortControllerRef = useRef<AbortController | null>(null);

  // Load initial public gists
  useEffect(() => {
    fetchPublicGists();
    
    // Cleanup function to cancel any pending requests
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchPublicGists]);

  const handleGistSelect = useCallback(async (gist: Gist) => {
    setSelectedGist(gist);
    setSelectedFile(undefined);
    
    // Fetch full gist details if not already loaded
    if (!gist.files || Object.keys(gist.files).length === 0 || !Object.values(gist.files)[0].content) {
      await fetchGist(gist.id);
    }
  }, [setSelectedGist, fetchGist]);

  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      await fetchPublicGists();
    }
    // For now, just fetch public gists - could implement search API later
  }, [fetchPublicGists]);

  const handleUserSearch = useCallback(async (username: string) => {
    await searchUserGists(username);
  }, [searchUserGists]);

  const handleFilterChange = useCallback((filters: GistFilters) => {
    setFilters(filters);
    // Re-fetch with new filters
    fetchPublicGists();
  }, [setFilters, fetchPublicGists]);

  const handleCloseDetail = useCallback(() => {
    setSelectedGist(null);
    setSelectedFile(undefined);
  }, [setSelectedGist]);

  const handleFileSelect = useCallback((filename: string) => {
    setSelectedFile(filename);
  }, []);

  const handleDismissError = useCallback(() => {
    clearError();
  }, [clearError]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>GitHub Gist Explorer</h1>
        
        <GistSearch
          onSearch={handleSearch}
          onUserSearch={handleUserSearch}
          onFilterChange={handleFilterChange}
          isLoading={isLoading}
          placeholder="Search gists or enter username..."
        />

        {error && (
          <div className={styles.errorBanner} role="alert" aria-live="polite">
            <div className={styles.errorMessage}>
              <AlertCircle size={16} aria-hidden="true" />
              {error}
            </div>
            <button
              onClick={handleDismissError}
              className={styles.dismissButton}
              aria-label="Dismiss error"
            >
              <X size={16} aria-hidden="true" />
            </button>
          </div>
        )}
      </div>

      <div className={styles.controls}>
        <div className={styles.viewToggle} role="group" aria-label="View mode">
          <button
            className={clsx(styles.viewButton, viewMode === 'list' && styles.active)}
            onClick={() => setViewMode('list')}
            aria-pressed={viewMode === 'list'}
            aria-label="List view"
          >
            <List size={16} aria-hidden="true" />
            List
          </button>
          <button
            className={clsx(styles.viewButton, viewMode === 'grid' && styles.active)}
            onClick={() => setViewMode('grid')}
            aria-pressed={viewMode === 'grid'}
            aria-label="Grid view"
          >
            <Grid size={16} aria-hidden="true" />
            Grid
          </button>
        </div>
      </div>

      <div 
        className={clsx(
          styles.content,
          selectedGist ? styles.twoColumn : styles.oneColumn
        )}
      >
        <div className={styles.listSection}>
          <GistList
            gists={gists}
            onGistSelect={handleGistSelect}
            isLoading={isLoading}
            viewMode={viewMode}
          />
        </div>

        {selectedGist && (
          <div className={styles.detailSection}>
            <GistDetail
              gist={selectedGist}
              onClose={handleCloseDetail}
              onFileSelect={handleFileSelect}
              selectedFile={selectedFile}
              isLoading={isLoading}
            />
          </div>
        )}
      </div>
    </div>
  );
}
