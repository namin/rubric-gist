/**
 * Pure presentation component for displaying detailed gist view
 * Props-only, no stores or external state
 */

import React, { memo, useState } from 'react';
import { X, Clock, Eye, EyeOff, FileText, Maximize2, Minimize2 } from 'lucide-react';
import { Highlight, themes } from 'prism-react-renderer';
import clsx from 'clsx';
import type { Gist } from '../types/gist.types';
import { formatRelativeTime, formatFileSize, formatLanguage } from '../utils/format';
import styles from '../styles/GistDetail.module.css';

interface GistDetailProps {
  gist: Gist | null;
  onClose?: () => void;
  onFileSelect?: (filename: string) => void;
  selectedFile?: string;
  isLoading?: boolean;
  className?: string;
}

export const GistDetail = memo<GistDetailProps>(({
  gist,
  onClose,
  onFileSelect,
  selectedFile,
  isLoading = false,
  className,
}) => {
  const [isCodeExpanded, setIsCodeExpanded] = useState(false);

  if (isLoading) {
    return (
      <div className={clsx(styles.container, className)}>
        <div className={styles.loading} role="status" aria-label="Loading gist details">
          Loading gist details...
        </div>
      </div>
    );
  }

  if (!gist) {
    return (
      <div className={clsx(styles.container, className)}>
        <div className={styles.empty} role="status">
          No gist selected. Choose a gist from the list to view details.
        </div>
      </div>
    );
  }

  const fileNames = Object.keys(gist.files);
  const currentFile = selectedFile ? gist.files[selectedFile] : gist.files[fileNames[0]];
  const currentFileName = selectedFile || fileNames[0];

  const handleFileTabClick = (filename: string) => {
    onFileSelect?.(filename);
  };

  const handleFileTabKeyDown = (event: React.KeyboardEvent, filename: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onFileSelect?.(filename);
    }
  };

  return (
    <div className={clsx(styles.container, className)}>
      <div className={styles.header}>
        <div className={styles.gistInfo}>
          <h2 className={styles.title}>
            {gist.description || 'Untitled Gist'}
          </h2>

          <div className={styles.ownerInfo}>
            <img
              src={gist.owner.avatar_url}
              alt={`${gist.owner.login}'s avatar`}
              className={styles.avatar}
              loading="lazy"
            />
            <a
              href={gist.owner.html_url}
              className={styles.ownerLink}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`View ${gist.owner.login}'s GitHub profile`}
            >
              {gist.owner.login}
            </a>
          </div>

          <div className={styles.meta}>
            <div className={styles.metaItem}>
              <Clock size={14} aria-hidden="true" />
              <span>Updated {formatRelativeTime(gist.updated_at)}</span>
            </div>
            <div className={styles.metaItem}>
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
            <div className={styles.metaItem}>
              <FileText size={14} aria-hidden="true" />
              <span>{fileNames.length} file{fileNames.length !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className={styles.closeButton}
            aria-label="Close gist details"
          >
            <X size={20} aria-hidden="true" />
          </button>
        )}
      </div>

      <div className={styles.content}>
        {fileNames.length > 1 && (
          <div className={styles.fileTabs} role="tablist" aria-label="Gist files">
            {fileNames.map((filename) => (
              <button
                key={filename}
                className={clsx(
                  styles.fileTab,
                  (selectedFile === filename || (!selectedFile && filename === fileNames[0])) && styles.active
                )}
                onClick={() => handleFileTabClick(filename)}
                onKeyDown={(e) => handleFileTabKeyDown(e, filename)}
                role="tab"
                aria-selected={selectedFile === filename || (!selectedFile && filename === fileNames[0])}
                aria-controls={`file-content-${filename}`}
              >
                {filename}
              </button>
            ))}
          </div>
        )}

        {currentFile && (
          <div className={styles.fileContent}>
            <div className={styles.fileHeader}>
              <span className={styles.fileName}>{currentFileName}</span>
              <div className={styles.fileInfo}>
                <span>{formatLanguage(currentFile.language)}</span>
                <span>{formatFileSize(currentFile.size)}</span>
              </div>
            </div>

            <div 
              className={clsx(
                styles.codeContainer,
                isCodeExpanded && styles.expanded
              )}
              id={`file-content-${currentFileName}`}
              role="tabpanel"
              aria-labelledby={`tab-${currentFileName}`}
            >
              <button
                onClick={() => setIsCodeExpanded(!isCodeExpanded)}
                className={styles.expandButton}
                aria-label={isCodeExpanded ? 'Collapse code view' : 'Expand code view'}
              >
                {isCodeExpanded ? (
                  <Minimize2 size={14} aria-hidden="true" />
                ) : (
                  <Maximize2 size={14} aria-hidden="true" />
                )}
              </button>

              {currentFile.content ? (
                <Highlight
                  theme={themes.github}
                  code={currentFile.content}
                  language={currentFile.language?.toLowerCase() || 'text'}
                >
                  {({ style, tokens, getLineProps, getTokenProps }) => (
                    <pre className={styles.code} style={style}>
                      {tokens.map((line, i) => (
                        <div key={i} {...getLineProps({ line })}>
                          {line.map((token, key) => (
                            <span key={key} {...getTokenProps({ token })} />
                          ))}
                        </div>
                      ))}
                    </pre>
                  )}
                </Highlight>
              ) : (
                <div className={styles.code}>
                  <em>No content available for this file</em>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

GistDetail.displayName = 'GistDetail';
