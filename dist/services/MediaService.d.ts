/**
 * Media Service for AI Stories Sharing platform
 * Handles media file storage and retrieval for images and videos
 * Requirements: 7.3 - Media files stored with unique identifiers
 */
/**
 * Supported MIME types for media uploads
 * Requirements: 2.10 - Support JPEG, PNG, and GIF image formats
 * Requirements: 2.11 - Support MP4 and WebM video formats
 */
export declare const SUPPORTED_IMAGE_MIME_TYPES: readonly ["image/jpeg", "image/png", "image/gif"];
export declare const SUPPORTED_VIDEO_MIME_TYPES: readonly ["video/mp4", "video/webm"];
export declare const SUPPORTED_MIME_TYPES: readonly ["image/jpeg", "image/png", "image/gif", "video/mp4", "video/webm"];
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
 * Validates if a MIME type is supported for upload
 *
 * @param mimeType - The MIME type to validate
 * @returns true if the MIME type is supported, false otherwise
 */
export declare function isSupportedMimeType(mimeType: string): mimeType is SupportedMimeType;
/**
 * Checks if a MIME type is an image type
 *
 * @param mimeType - The MIME type to check
 * @returns true if the MIME type is an image type
 */
export declare function isImageMimeType(mimeType: string): boolean;
/**
 * Checks if a MIME type is a video type
 *
 * @param mimeType - The MIME type to check
 * @returns true if the MIME type is a video type
 */
export declare function isVideoMimeType(mimeType: string): boolean;
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
export declare function uploadMedia(data: Buffer, mimeType: string): Promise<string>;
/**
 * Retrieves media data by its unique identifier
 *
 * @param mediaId - The unique identifier of the media
 * @returns Promise resolving to the media Buffer, or null if not found
 *
 * Requirements: 7.3 - Media files stored with unique identifiers
 */
export declare function getMedia(mediaId: string): Promise<Buffer | null>;
/**
 * Retrieves media entry with metadata by its unique identifier
 *
 * @param mediaId - The unique identifier of the media
 * @returns Promise resolving to the MediaEntry, or null if not found
 */
export declare function getMediaEntry(mediaId: string): Promise<MediaEntry | null>;
/**
 * Deletes media by its unique identifier
 *
 * @param mediaId - The unique identifier of the media to delete
 * @returns Promise resolving to true if deleted, false if not found
 */
export declare function deleteMedia(mediaId: string): Promise<boolean>;
/**
 * Checks if media exists by its unique identifier
 *
 * @param mediaId - The unique identifier of the media
 * @returns Promise resolving to true if exists, false otherwise
 */
export declare function mediaExists(mediaId: string): Promise<boolean>;
/**
 * Clears all media from storage
 * Useful for testing purposes
 */
export declare function clearMediaStorage(): void;
/**
 * Gets the count of stored media files
 * Useful for testing purposes
 *
 * @returns The number of media files in storage
 */
export declare function getMediaCount(): number;
//# sourceMappingURL=MediaService.d.ts.map