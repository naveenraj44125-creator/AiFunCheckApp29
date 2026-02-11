"use strict";
/**
 * Post Service
 * Handles post creation, retrieval, update, and deletion
 * Requirements: 2.1-2.11, 3.1-3.6, 6.1-6.6
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateContent = validateContent;
exports.isSupportedImageFormat = isSupportedImageFormat;
exports.isSupportedVideoFormat = isSupportedVideoFormat;
exports.canViewPost = canViewPost;
exports.getPost = getPost;
exports.createPost = createPost;
exports.updatePost = updatePost;
exports.deletePost = deletePost;
const constants_1 = require("../models/constants");
const errors_1 = require("../models/errors");
const InMemoryStorage_1 = require("../storage/InMemoryStorage");
/**
 * Validates post content based on type
 * Requirements: 2.5, 2.6, 2.7, 2.8, 2.9, 2.10, 2.11
 *
 * @param content - The content to validate
 * @returns ValidationResult with valid flag and any error messages
 */
function validateContent(content) {
    const errors = [];
    // Requirement 2.5: Reject empty content
    if (!content) {
        return { valid: false, errors: ['Content cannot be empty'] };
    }
    switch (content.type) {
        case 'text':
            // Validate text content is not empty
            if (!content.text || content.text.trim().length === 0) {
                errors.push('Text content cannot be empty');
            }
            break;
        case 'image':
            // Validate image content
            validateImageContent(content, errors);
            break;
        case 'video':
            // Validate video content
            validateVideoContent(content, errors);
            break;
        default:
            errors.push('Invalid content type');
    }
    return {
        valid: errors.length === 0,
        errors,
    };
}
/**
 * Validates image content for format and size
 * Requirements: 2.6, 2.8, 2.10
 *
 * @param content - The image content to validate
 * @param errors - Array to collect error messages
 */
function validateImageContent(content, errors) {
    // Check if image has required content (either URL or file data)
    if (!content.mediaUrl && !content.mimeType) {
        errors.push('Image content cannot be empty');
        return;
    }
    // Requirement 2.8, 2.10: Validate image format (JPEG, PNG, GIF)
    if (content.mimeType) {
        if (!constants_1.SUPPORTED_IMAGE_FORMATS.includes(content.mimeType)) {
            errors.push(`Unsupported image format. Supported formats: JPEG, PNG, GIF`);
        }
    }
    // Requirement 2.6: Validate image file size (max 10MB)
    if (content.fileSize !== undefined) {
        if (content.fileSize > constants_1.MAX_IMAGE_SIZE) {
            errors.push(`Image file exceeds maximum size of 10MB`);
        }
    }
}
/**
 * Validates video content for format and size
 * Requirements: 2.7, 2.9, 2.11
 *
 * @param content - The video content to validate
 * @param errors - Array to collect error messages
 */
function validateVideoContent(content, errors) {
    // Check if video has required content (either URL or file data)
    if (!content.mediaUrl && !content.mimeType) {
        errors.push('Video content cannot be empty');
        return;
    }
    // Requirement 2.9, 2.11: Validate video format (MP4, WebM)
    if (content.mimeType) {
        if (!constants_1.SUPPORTED_VIDEO_FORMATS.includes(content.mimeType)) {
            errors.push(`Unsupported video format. Supported formats: MP4, WebM`);
        }
    }
    // Requirement 2.7: Validate video file size (max 100MB)
    if (content.fileSize !== undefined) {
        if (content.fileSize > constants_1.MAX_VIDEO_SIZE) {
            errors.push(`Video file exceeds maximum size of 100MB`);
        }
    }
}
/**
 * Checks if a MIME type is a supported image format
 * @param mimeType - The MIME type to check
 * @returns true if the format is supported
 */
function isSupportedImageFormat(mimeType) {
    return constants_1.SUPPORTED_IMAGE_FORMATS.includes(mimeType);
}
/**
 * Checks if a MIME type is a supported video format
 * @param mimeType - The MIME type to check
 * @returns true if the format is supported
 */
function isSupportedVideoFormat(mimeType) {
    return constants_1.SUPPORTED_VIDEO_FORMATS.includes(mimeType);
}
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
function canViewPost(post, viewerId, storageInstance = InMemoryStorage_1.storage) {
    // Requirement 3.3: Public posts are visible to all users (including unauthenticated)
    if (post.visibility === 'public') {
        return true;
    }
    // For friends_only posts:
    // Unauthenticated users (null viewerId) cannot see friends_only posts
    if (viewerId === null) {
        return false;
    }
    // Owner can always see their own posts
    if (post.authorId === viewerId) {
        return true;
    }
    // Requirement 3.5: Friends-only posts are visible to users in author's friends list
    // Requirement 3.4: Friends-only posts are NOT visible to users NOT in author's friends list
    // Requirement 3.2: Friends-only posts are restricted to author's friends list
    return storageInstance.areFriends(post.authorId, viewerId);
}
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
async function getPost(postId, requesterId, storageInstance = InMemoryStorage_1.storage) {
    // Retrieve the post from storage
    const post = storageInstance.getPostById(postId);
    // Return null if post doesn't exist
    if (!post) {
        return null;
    }
    // Check if the requester can view the post
    if (!canViewPost(post, requesterId, storageInstance)) {
        throw new errors_1.AccessDeniedError();
    }
    return post;
}
/**
 * Generates a unique post ID
 * @returns A unique string ID for a post
 */
function generatePostId() {
    return `post_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}
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
async function createPost(userId, content, visibility, storageInstance = InMemoryStorage_1.storage) {
    // Requirement 2.1: Deny request if user is not authenticated
    if (!userId) {
        throw new errors_1.UnauthorizedError();
    }
    // Requirements 2.2, 2.3, 2.4, 2.5: Validate content
    const validationResult = validateContent(content);
    if (!validationResult.valid) {
        // Determine the appropriate error type based on validation errors
        const errorMessage = validationResult.errors.join('; ');
        if (errorMessage.includes('cannot be empty')) {
            throw new errors_1.EmptyContentError();
        }
        if (errorMessage.includes('Unsupported')) {
            throw new errors_1.InvalidFormatError(errorMessage);
        }
        if (errorMessage.includes('exceeds maximum size')) {
            throw new errors_1.FileTooLargeError(errorMessage);
        }
        // Default to EmptyContentError for other validation failures
        throw new errors_1.EmptyContentError();
    }
    // Requirements 3.1, 3.6: Default visibility to friends_only if not specified
    const postVisibility = visibility ?? constants_1.DEFAULT_VISIBILITY;
    // Create the post with metadata
    const now = new Date();
    const post = {
        id: generatePostId(),
        authorId: userId,
        content: content,
        visibility: postVisibility,
        createdAt: now,
        updatedAt: now,
        isEdited: false,
    };
    // Store the post
    storageInstance.createPost(post);
    return post;
}
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
async function updatePost(postId, userId, updates, storageInstance = InMemoryStorage_1.storage) {
    // Requirement: User must be authenticated to edit posts
    if (!userId) {
        throw new errors_1.UnauthorizedError();
    }
    // Retrieve the existing post
    const existingPost = storageInstance.getPostById(postId);
    if (!existingPost) {
        throw new errors_1.PostNotFoundError();
    }
    // Requirement 6.6: Only post author can edit their post
    if (existingPost.authorId !== userId) {
        throw new errors_1.AccessDeniedError();
    }
    // Validate content if provided
    if (updates.content) {
        const validationResult = validateContent(updates.content);
        if (!validationResult.valid) {
            const errorMessage = validationResult.errors.join('; ');
            if (errorMessage.includes('cannot be empty')) {
                throw new errors_1.EmptyContentError();
            }
            if (errorMessage.includes('Unsupported')) {
                throw new errors_1.InvalidFormatError(errorMessage);
            }
            if (errorMessage.includes('exceeds maximum size')) {
                throw new errors_1.FileTooLargeError(errorMessage);
            }
            throw new errors_1.EmptyContentError();
        }
    }
    // Create the updated post
    // Requirement 6.6: Preserve the original creation timestamp
    const updatedPost = {
        ...existingPost,
        content: updates.content ?? existingPost.content,
        // Requirement 6.5: Allow visibility changes
        visibility: updates.visibility ?? existingPost.visibility,
        // Requirement 6.2: Mark post as edited
        isEdited: true,
        // Update the updatedAt timestamp
        updatedAt: new Date(),
        // Requirement 6.6: Preserve original createdAt
        createdAt: existingPost.createdAt,
    };
    // Store the updated post
    storageInstance.updatePost(updatedPost);
    return updatedPost;
}
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
async function deletePost(postId, userId, storageInstance = InMemoryStorage_1.storage) {
    // Requirement: User must be authenticated to delete posts
    if (!userId) {
        throw new errors_1.UnauthorizedError();
    }
    // Retrieve the existing post
    const existingPost = storageInstance.getPostById(postId);
    if (!existingPost) {
        throw new errors_1.PostNotFoundError();
    }
    // Requirement 6.4: Only post author can delete their post
    if (existingPost.authorId !== userId) {
        throw new errors_1.AccessDeniedError();
    }
    // Requirement 6.3: Remove the post from the system
    storageInstance.deletePost(postId);
}
//# sourceMappingURL=PostService.js.map