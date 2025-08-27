/**
 * Pure presentation component for gist search interface
 * Props-only, no stores or external state
 */

import { memo, useState, FormEvent } from 'react';
import { Search, ChevronDown, ChevronUp } from 'lucide-react';
import clsx from 'clsx';
import type { GistFilters } from '../types/gist.types';
import styles from '../styles/GistSearch.module.css';

interface GistSearchProps {
  onSearch?: (query: string) => void;
  onUserSearch?: (username: string) => void;
  onFilterChange?: (filters: GistFilters) => void;
  isLoading?: boolean;
  className?: string;
}

export const GistSearch = memo<GistSearchProps>(({
  onSearch,
  onUserSearch,
  onFilterChange,
  isLoading = false,
  className,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [username, setUsername] = useState('');
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    
    if (username.trim()) {
      onUserSearch?.(username.trim());
    } else {
      onSearch?.(searchQuery.trim());
    }
  };

  const handlePublicGistsClick = () => {
    setSearchQuery('');
    setUsername('');
    onSearch?.('');
  };

  const handleFilterChange = (newFilters: Partial<GistFilters>) => {
    onFilterChange?.(newFilters as GistFilters);
  };

  return (
    <div className={clsx(styles.container, className)}>
      <form onSubmit={handleSubmit} className={styles.searchForm}>
        <div className={styles.inputGroup}>
          <label htmlFor="username-input" className={styles.label}>
            GitHub Username (optional)
          </label>
          <input
            id="username-input"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter username to search user's gists"
            className={styles.input}
            aria-describedby="username-help"
          />
          <div id="username-help" className="sr-only">
            Leave empty to search all public gists
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={styles.searchButton}
          aria-label={username ? `Search ${username}'s gists` : 'Search public gists'}
        >
          <Search size={16} aria-hidden="true" />
          {isLoading ? 'Searching...' : 'Search'}
        </button>
      </form>

      <div className={styles.quickActions}>
        <button
          type="button"
          onClick={handlePublicGistsClick}
          className={styles.quickButton}
          disabled={isLoading}
        >
          Show Public Gists
        </button>
        
        <button
          type="button"
          onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
          className={styles.advancedToggle}
          aria-expanded={isAdvancedOpen}
          aria-controls="advanced-options"
        >
          Advanced Options
          {isAdvancedOpen ? (
            <ChevronUp size={16} aria-hidden="true" />
          ) : (
            <ChevronDown size={16} aria-hidden="true" />
          )}
        </button>
      </div>

      {isAdvancedOpen && (
        <div id="advanced-options" className={styles.advancedOptions}>
          <div className={styles.inputGroup}>
            <label htmlFor="per-page-input" className={styles.label}>
              Results per page
            </label>
            <select
              id="per-page-input"
              className={styles.input}
              onChange={(e) => handleFilterChange({ per_page: parseInt(e.target.value) })}
              defaultValue="30"
            >
              <option value="10">10</option>
              <option value="30">30</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="since-input" className={styles.label}>
              Updated since
            </label>
            <input
              id="since-input"
              type="datetime-local"
              className={styles.input}
              onChange={(e) => handleFilterChange({ since: e.target.value })}
              aria-describedby="since-help"
            />
            <div id="since-help" className="sr-only">
              Show only gists updated after this date and time
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

GistSearch.displayName = 'GistSearch';
