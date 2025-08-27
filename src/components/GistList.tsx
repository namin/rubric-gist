/**
 * Pure presentation component for displaying list of gists
 * Props-only, no stores or external state
 */

import React, { memo } from 'react';
import { Clock, Eye, EyeOff } from 'lucide-react';
import clsx from 'clsx';
import type { Gist } from '../types/gist.types';
import { formatRelativeTime } from '../utils/format';
import styles from '../styles/GistList.module.css';

interface GistListProps {
  gists: Gist[];
  onGistSelect?: (gist: Gist) => void;
  isLoading?: boolean;
  className?: string;
  viewMode?: 'list' | 'grid';
}

export const GistList = memo<GistListProps>(({
  gists,
  onGistSelect,
  isLoading = false,
  className,
  viewMode = 'list',
}) => {
  const handleGistClick = (gist: Gist) => {
    onGistSelect?.(gist);
  };

  const handleGistKeyDown = (event: React.KeyboardEvent, gist: Gist) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onGistSelect?.(gist);
    }
  };

  if (isLoading) {
    return (
      <div className={clsx(styles.container, className)}>
        <div className={styles.loading} role="status" aria-label="Loading gists">
          <div>Loading gists...</div>
        </div>
      </div>
    );
  }

  if (gists.length === 0) {
    return (
      <div className={clsx(styles.container, className)}>
        <div className={styles.empty} role="status">
          No gists found. Try searching for a specific user or check back later.
        </div>
      </div>
    );
  }

  return (
    <div className={clsx(styles.container, className)}>
      <div 
        className={clsx(
          styles.list,
          viewMode === 'grid' ? styles.gridView : styles.listView
        )}
        role="list"
        aria-label={`${gists.length} gists`}
      >
        {gists.map((gist) => (
          <div
            key={gist.id}
            className={styles.gistCard}
            role="listitem"
            tabIndex={0}
            onClick={() => handleGistClick(gist)}
            onKeyDown={(e) => handleGistKeyDown(e, gist)}
            aria-label={`Gist by ${gist.owner.login}: ${gist.description || 'No description'}`}
          >
            <div className={styles.gistHeader}>
              <img
                src={gist.owner.avatar_url}
                alt={`${gist.owner.login}'s avatar`}
                className={styles.avatar}
                loading="lazy"
              />
              <a
                href={gist.owner.html_url}
                className={styles.owner}
                onClick={(e) => e.stopPropagation()}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`View ${gist.owner.login}'s GitHub profile`}
              >
                {gist.owner.login}
              </a>
            </div>

            <div className={styles.description}>
              {gist.description ? (
                <span>{gist.description}</span>
              ) : (
                <span className={styles.noDescription}>No description</span>
              )}
            </div>

            <div className={styles.files} aria-label="Files in this gist">
              {Object.keys(gist.files).slice(0, 3).map((filename) => (
                <span key={filename} className={styles.fileChip}>
                  {filename}
                </span>
              ))}
              {Object.keys(gist.files).length > 3 && (
                <span className={styles.fileChip}>
                  +{Object.keys(gist.files).length - 3} more
                </span>
              )}
            </div>

            <div className={styles.meta}>
              <div className={styles.date}>
                <Clock size={14} aria-hidden="true" />
                <span>{formatRelativeTime(gist.updated_at)}</span>
              </div>
              <div className={styles.visibility}>
                {gist.public ? (
                  <>
                    <Eye size={14} aria-hidden="true" />
                    <span>Public</span>
                  </>
                ) : (
                  <>
                    <EyeOff size={14} aria-hidden="true" />
                    <span>Private</span>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

GistList.displayName = 'GistList';
