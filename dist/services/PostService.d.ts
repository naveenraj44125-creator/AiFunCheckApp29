/**
 * Post Service
 * Handles post creation, retrieval, update, and deletion
 * Requirements: 2.1-2.11, 3.1-3.6, 6.1-6.6
 */
import { Post, PostContent, PostUpdate, Visibility, ValidationResult } from '../models/types';
import { InMemoryStorage } from '../storage/InMemoryStorage';
/**
 * Post Service Interface
 */
export interface IPostService {
    createPost(userId: string, content: PostContent, visibility?: Visibility): Promise<Post>;
    getPost(postId: string, requesterId: string | null): Promise<Post | null>;
    updatePost(postId: string, userId: string, updates: PostUpdate): Promise<Post>;
    deletePost(postId: string, userId: string): Promise<void>;
    validateContent(content: PostContent): ValidationResult;
}
/**
 * Extended PostContent interface for validation that includes file metadata
 */
export interface PostContentWithFile extends PostContent {
    mimeType?: string;
    fileSize?: number;
}
/**
 * Validates post content based on type
 * Requirements: 2.5, 2.6, 2.7, 2.8, 2.9, 2.10, 2.11
 *
 * @param content - The content to validate
 * @returns ValidationResult with valid flag and any error messages
 */
export declare function validateContent(content: PostContentWithFile): ValidationResult;
/**
 * Checks if a MIME type is a supported image format
 * @param mimeType - The MIME type to check
 * @returns true if the format is supported
 */
export declare function isSupportedImageFormat(mimeType: string): boolean;
/**
 * Checks if a MIME type is a supported video format
 * @param mimeType - The MIME type to check
 * @returns true if the format is supported
 */
export declare function isSupportedVideoFormat(mimeType: string): boolean;
/**
 * Checks if a user can view a specific post based on visibility rules
 * Requirements: 3.2, 3.3, 3.4, 3.5
 *
 * @param post - The post to check visibility for
 * @param viewerId - The ID of the user trying to view the post (null for unauthenticated users)
 * @param storageInstance - Optional storage instance for dependency injection (defaults to singleton)
 * @returns true if the viewer can see the post, false otherwise
 *
 * Visibility Rules:
 * - Requirement 3.3: Public posts are visible to all users (including unauthenticated)
 * - Requirement 3.2: Friends-only posts are restricted to author's friends list
 * - Requirement 3.5: Friends-only posts are visible to users in author's friends list
 * - Requirement 3.4: Friends-only posts are NOT visible to users NOT in author's friends list
 * - Owner can always see their own posts
 */
export declare function canViewPost(post: Post, viewerId: string | null, storageInstance?: InMemoryStorage): boolean;
/**
 * Retrieves a post by ID with visibility checking
 * Requirements: 3.2, 3.3, 3.4, 3.5
 *
 * @param postId - The ID of the post to retrieve
 * @param requesterId - The ID of the user requesting the post (null for unauthenticated users)
 * @param storageInstance - Optional storage instance for dependency injection (defaults to singleton)
 * @returns The post if found and accessible, null if not found
 * @throws AccessDeniedError if the user doesn't have permission to view the post
 */
export declare function getPost(postId: string, requesterId: string | null, storageInstance?: InMemoryStorage): Promise<Post | null>;
/**
 * Creates a new post
 * Requirements: 2.1, 2.2, 2.3, 2.4, 3.1, 3.6
 *
 * @param userId - The ID of the authenticated user creating the post (null/undefined if not authenticated)
 * @param content - The content of the post
 * @param visibility - The visibility setting (defaults to friends_only per Requirement 3.6)
 * @param storageInstance - Optional storage instance for dependency injection (defaults to singleton)
 * @returns The created post
 * @throws UnauthorizedError if userId is not provided (Requirement 2.1)
 * @throws EmptyContentError if content validation fails due to empty content
 * @throws InvalidFormatError if content validation fails due to invalid format
 * @throws FileTooLargeError if content validation fails due to file size
 */
export declare function createPost(userId: string | null | undefined, content: PostContent, visibility?: Visibility, storageInstance?: InMemoryStorage): Promise<Post>;
/**
 * Updates an existing post
 * Requirements: 6.1, 6.2, 6.5, 6.6
 *
 * @param postId - The ID of the post to update
 * @param userId - The ID of the authenticated user attempting to update (null/undefined if not authenticated)
 * @param updates - The updates to apply to the post
 * @param storageInstance - Optional storage instance for dependency injection (defaults to singleton)
 * @returns The updated post
 * @throws UnauthorizedError if userId is not provided (user not authenticated)
 * @throws PostNotFoundError if the post doesn't exist
 * @throws AccessDeniedError if the user is not the author of the post (Requirement 6.6)
 */
export declare function updatePost(postId: string, userId: string | null | undefined, updates: PostUpdate, storageInstance?: InMemoryStorage): Promise<Post>;
/**
 * Deletes a post
 * Requirements: 6.3, 6.4
 *
 * @param postId - The ID of the post to delete
 * @param userId - The ID of the authenticated user attempting to delete (null/undefined if not authenticated)
 * @param storageInstance - Optional storage instance for dependency injection (defaults to singleton)
 * @throws UnauthorizedError if userId is not provided (user not authenticated)
 * @throws PostNotFoundError if the post doesn't exist
 * @throws AccessDeniedError if the user is not the author of the post (Requirement 6.4)
 */
export declare function deletePost(postId: string, userId: string | null | undefined, storageInstance?: InMemoryStorage): Promise<void>;
//# sourceMappingURL=PostService.d.ts.map