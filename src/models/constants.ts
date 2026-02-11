/**
 * Constants for AI Stories Sharing platform
 */

// Supported media formats
export const SUPPORTED_IMAGE_FORMATS = ['image/jpeg', 'image/png', 'image/gif'];
export const SUPPORTED_VIDEO_FORMATS = ['video/mp4', 'video/webm'];

// File extensions mapping
export const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif'];
export const VIDEO_EXTENSIONS = ['.mp4', '.webm'];

// File size limits (in bytes)
export const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB

// Session configuration
export const SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

// Pagination defaults
export const DEFAULT_PAGE_LIMIT = 20;
export const MAX_PAGE_LIMIT = 100;

// Default visibility for new posts
export const DEFAULT_VISIBILITY = 'friends_only' as const;
