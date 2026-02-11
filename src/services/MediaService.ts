/**
 * Media Service for AI Stories Sharing platform
 * Handles media file storage and retrieval for images and videos
 * Requirements: 7.3 - Media files stored with unique identifiers
 */

import { v4 as uuidv4 } from 'uuid';

/**
 * Supported MIME types for media uploads
 * Requirements: 2.10 - Support JPEG, PNG, and GIF image formats
 * Requirements: 2.11 - Support MP4 and WebM video formats
 */
export const SUPPORTED_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
] as const;

export const SUPPORTED_VIDEO_MIME_TYPES = [
  'video/mp4',
  'video/webm',
] as const;

export const SUPPORTED_MIME_TYPES = [
  ...SUPPORTED_IMAGE_MIME_TYPES,
  ...SUPPORTED_VIDEO_MIME_TYPES,
] as const;

export type SupportedMimeType = typeof SUPPORTED_MIME_TYPES[number];

/**
 * Media storage entry containing the binary data and metadata
 */
export interface MediaEntry {
  id: string;
  data: Buffer;
  mimeType: string;
  size: number;
  createdAt: Date;
}

/**
 * In-memory storage for media files
 * Maps media ID to MediaEntry
 */
const mediaStorage: Map<string, MediaEntry> = new Map();

/**
 * Validates if a MIME type is supported for upload
 * 
 * @param mimeType - The MIME type to validate
 * @returns true if the MIME type is supported, false otherwise
 */
export function isSupportedMimeType(mimeType: string): mimeType is SupportedMimeType {
  return (SUPPORTED_MIME_TYPES as readonly string[]).includes(mimeType);
}

/**
 * Checks if a MIME type is an image type
 * 
 * @param mimeType - The MIME type to check
 * @returns true if the MIME type is an image type
 */
export function isImageMimeType(mimeType: string): boolean {
  return (SUPPORTED_IMAGE_MIME_TYPES as readonly string[]).includes(mimeType);
}

/**
 * Checks if a MIME type is a video type
 * 
 * @param mimeType - The MIME type to check
 * @returns true if the MIME type is a video type
 */
export function isVideoMimeType(mimeType: string): boolean {
  return (SUPPORTED_VIDEO_MIME_TYPES as readonly string[]).includes(mimeType);
}

/**
 * Uploads media data to storage and returns a unique identifier
 * 
 * @param data - The binary data of the media file
 * @param mimeType - The MIME type of the media file
 * @returns Promise resolving to the unique media ID
 * @throws Error if the MIME type is not supported
 * 
 * Requirements: 7.3 - Media files stored with unique identifiers
 */
export async function uploadMedia(data: Buffer, mimeType: string): Promise<string> {
  // Validate MIME type
  if (!isSupportedMimeType(mimeType)) {
    throw new Error(
      `Unsupported MIME type: ${mimeType}. Supported types: ${SUPPORTED_MIME_TYPES.join(', ')}`
    );
  }

  // Validate data is not empty
  if (!data || data.length === 0) {
    throw new Error('Media data cannot be empty');
  }

  // Generate unique ID for the media
  const mediaId = uuidv4();

  // Create media entry
  const mediaEntry: MediaEntry = {
    id: mediaId,
    data: Buffer.from(data), // Create a copy of the buffer
    mimeType,
    size: data.length,
    createdAt: new Date(),
  };

  // Store in memory
  mediaStorage.set(mediaId, mediaEntry);

  return mediaId;
}

/**
 * Retrieves media data by its unique identifier
 * 
 * @param mediaId - The unique identifier of the media
 * @returns Promise resolving to the media Buffer, or null if not found
 * 
 * Requirements: 7.3 - Media files stored with unique identifiers
 */
export async function getMedia(mediaId: string): Promise<Buffer | null> {
  const entry = mediaStorage.get(mediaId);
  
  if (!entry) {
    return null;
  }

  // Return a copy of the buffer to prevent external modification
  return Buffer.from(entry.data);
}

/**
 * Retrieves media entry with metadata by its unique identifier
 * 
 * @param mediaId - The unique identifier of the media
 * @returns Promise resolving to the MediaEntry, or null if not found
 */
export async function getMediaEntry(mediaId: string): Promise<MediaEntry | null> {
  const entry = mediaStorage.get(mediaId);
  
  if (!entry) {
    return null;
  }

  // Return a copy to prevent external modification
  return {
    ...entry,
    data: Buffer.from(entry.data),
  };
}

/**
 * Deletes media by its unique identifier
 * 
 * @param mediaId - The unique identifier of the media to delete
 * @returns Promise resolving to true if deleted, false if not found
 */
export async function deleteMedia(mediaId: string): Promise<boolean> {
  return mediaStorage.delete(mediaId);
}

/**
 * Checks if media exists by its unique identifier
 * 
 * @param mediaId - The unique identifier of the media
 * @returns Promise resolving to true if exists, false otherwise
 */
export async function mediaExists(mediaId: string): Promise<boolean> {
  return mediaStorage.has(mediaId);
}

/**
 * Clears all media from storage
 * Useful for testing purposes
 */
export function clearMediaStorage(): void {
  mediaStorage.clear();
}

/**
 * Gets the count of stored media files
 * Useful for testing purposes
 * 
 * @returns The number of media files in storage
 */
export function getMediaCount(): number {
  return mediaStorage.size;
}
