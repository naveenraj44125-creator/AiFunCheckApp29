"use strict";
/**
 * Media Service for AI Stories Sharing platform
 * Handles media file storage and retrieval for images and videos
 * Requirements: 7.3 - Media files stored with unique identifiers
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SUPPORTED_MIME_TYPES = exports.SUPPORTED_VIDEO_MIME_TYPES = exports.SUPPORTED_IMAGE_MIME_TYPES = void 0;
exports.isSupportedMimeType = isSupportedMimeType;
exports.isImageMimeType = isImageMimeType;
exports.isVideoMimeType = isVideoMimeType;
exports.uploadMedia = uploadMedia;
exports.getMedia = getMedia;
exports.getMediaEntry = getMediaEntry;
exports.deleteMedia = deleteMedia;
exports.mediaExists = mediaExists;
exports.clearMediaStorage = clearMediaStorage;
exports.getMediaCount = getMediaCount;
const uuid_1 = require("uuid");
/**
 * Supported MIME types for media uploads
 * Requirements: 2.10 - Support JPEG, PNG, and GIF image formats
 * Requirements: 2.11 - Support MP4 and WebM video formats
 */
exports.SUPPORTED_IMAGE_MIME_TYPES = [
    'image/jpeg',
    'image/png',
    'image/gif',
];
exports.SUPPORTED_VIDEO_MIME_TYPES = [
    'video/mp4',
    'video/webm',
];
exports.SUPPORTED_MIME_TYPES = [
    ...exports.SUPPORTED_IMAGE_MIME_TYPES,
    ...exports.SUPPORTED_VIDEO_MIME_TYPES,
];
/**
 * In-memory storage for media files
 * Maps media ID to MediaEntry
 */
const mediaStorage = new Map();
/**
 * Validates if a MIME type is supported for upload
 *
 * @param mimeType - The MIME type to validate
 * @returns true if the MIME type is supported, false otherwise
 */
function isSupportedMimeType(mimeType) {
    return exports.SUPPORTED_MIME_TYPES.includes(mimeType);
}
/**
 * Checks if a MIME type is an image type
 *
 * @param mimeType - The MIME type to check
 * @returns true if the MIME type is an image type
 */
function isImageMimeType(mimeType) {
    return exports.SUPPORTED_IMAGE_MIME_TYPES.includes(mimeType);
}
/**
 * Checks if a MIME type is a video type
 *
 * @param mimeType - The MIME type to check
 * @returns true if the MIME type is a video type
 */
function isVideoMimeType(mimeType) {
    return exports.SUPPORTED_VIDEO_MIME_TYPES.includes(mimeType);
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
async function uploadMedia(data, mimeType) {
    // Validate MIME type
    if (!isSupportedMimeType(mimeType)) {
        throw new Error(`Unsupported MIME type: ${mimeType}. Supported types: ${exports.SUPPORTED_MIME_TYPES.join(', ')}`);
    }
    // Validate data is not empty
    if (!data || data.length === 0) {
        throw new Error('Media data cannot be empty');
    }
    // Generate unique ID for the media
    const mediaId = (0, uuid_1.v4)();
    // Create media entry
    const mediaEntry = {
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
async function getMedia(mediaId) {
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
async function getMediaEntry(mediaId) {
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
async function deleteMedia(mediaId) {
    return mediaStorage.delete(mediaId);
}
/**
 * Checks if media exists by its unique identifier
 *
 * @param mediaId - The unique identifier of the media
 * @returns Promise resolving to true if exists, false otherwise
 */
async function mediaExists(mediaId) {
    return mediaStorage.has(mediaId);
}
/**
 * Clears all media from storage
 * Useful for testing purposes
 */
function clearMediaStorage() {
    mediaStorage.clear();
}
/**
 * Gets the count of stored media files
 * Useful for testing purposes
 *
 * @returns The number of media files in storage
 */
function getMediaCount() {
    return mediaStorage.size;
}
//# sourceMappingURL=MediaService.js.map