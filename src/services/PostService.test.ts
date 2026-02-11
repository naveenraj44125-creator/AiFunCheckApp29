/**
 * Unit tests for PostService - Content Validation
 * Tests for Task 4.1: Implement content validation
 * Requirements: 2.5, 2.6, 2.7, 2.8, 2.9, 2.10, 2.11
 */

import { validateContent, PostContentWithFile, isSupportedImageFormat, isSupportedVideoFormat } from './PostService';
import { MAX_IMAGE_SIZE, MAX_VIDEO_SIZE, SUPPORTED_IMAGE_FORMATS, SUPPORTED_VIDEO_FORMATS } from '../models/constants';

describe('PostService - validateContent', () => {
  describe('Text Content Validation', () => {
    /**
     * Requirement 2.5: Reject empty content
     */
    it('should reject null content', () => {
      const result = validateContent(null as unknown as PostContentWithFile);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Content cannot be empty');
    });

    /**
     * Requirement 2.5: Reject empty text content
     */
    it('should reject text content with empty string', () => {
      const content: PostContentWithFile = {
        type: 'text',
        text: '',
      };

      const result = validateContent(content);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Text content cannot be empty');
    });

    /**
     * Requirement 2.5: Reject text content with only whitespace
     */
    it('should reject text content with only whitespace', () => {
      const content: PostContentWithFile = {
        type: 'text',
        text: '   \n\t  ',
      };

      const result = validateContent(content);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Text content cannot be empty');
    });

    /**
     * Requirement 2.5: Reject text content with undefined text
     */
    it('should reject text content with undefined text', () => {
      const content: PostContentWithFile = {
        type: 'text',
      };

      const result = validateContent(content);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Text content cannot be empty');
    });

    /**
     * Valid text content should pass validation
     */
    it('should accept valid text content', () => {
      const content: PostContentWithFile = {
        type: 'text',
        text: 'This is a funny AI story!',
      };

      const result = validateContent(content);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    /**
     * Text content with leading/trailing whitespace should be valid
     */
    it('should accept text content with leading/trailing whitespace', () => {
      const content: PostContentWithFile = {
        type: 'text',
        text: '  Valid content with spaces  ',
      };

      const result = validateContent(content);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('Image Content Validation', () => {
    /**
     * Requirement 2.5: Reject empty image content
     */
    it('should reject image content without URL or file data', () => {
      const content: PostContentWithFile = {
        type: 'image',
      };

      const result = validateContent(content);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Image content cannot be empty');
    });

    /**
     * Requirement 2.10: Accept JPEG image format
     */
    it('should accept JPEG image format', () => {
      const content: PostContentWithFile = {
        type: 'image',
        mimeType: 'image/jpeg',
        fileSize: 1024 * 1024, // 1MB
      };

      const result = validateContent(content);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    /**
     * Requirement 2.10: Accept PNG image format
     */
    it('should accept PNG image format', () => {
      const content: PostContentWithFile = {
        type: 'image',
        mimeType: 'image/png',
        fileSize: 1024 * 1024, // 1MB
      };

      const result = validateContent(content);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    /**
     * Requirement 2.10: Accept GIF image format
     */
    it('should accept GIF image format', () => {
      const content: PostContentWithFile = {
        type: 'image',
        mimeType: 'image/gif',
        fileSize: 1024 * 1024, // 1MB
      };

      const result = validateContent(content);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    /**
     * Requirement 2.8: Reject unsupported image format
     */
    it('should reject unsupported image format (BMP)', () => {
      const content: PostContentWithFile = {
        type: 'image',
        mimeType: 'image/bmp',
        fileSize: 1024 * 1024,
      };

      const result = validateContent(content);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Unsupported image format. Supported formats: JPEG, PNG, GIF');
    });

    /**
     * Requirement 2.8: Reject unsupported image format (TIFF)
     */
    it('should reject unsupported image format (TIFF)', () => {
      const content: PostContentWithFile = {
        type: 'image',
        mimeType: 'image/tiff',
        fileSize: 1024 * 1024,
      };

      const result = validateContent(content);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Unsupported image format. Supported formats: JPEG, PNG, GIF');
    });

    /**
     * Requirement 2.8: Reject unsupported image format (WebP)
     */
    it('should reject unsupported image format (WebP)', () => {
      const content: PostContentWithFile = {
        type: 'image',
        mimeType: 'image/webp',
        fileSize: 1024 * 1024,
      };

      const result = validateContent(content);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Unsupported image format. Supported formats: JPEG, PNG, GIF');
    });

    /**
     * Requirement 2.6: Accept image at exactly max size (10MB)
     */
    it('should accept image at exactly max size (10MB)', () => {
      const content: PostContentWithFile = {
        type: 'image',
        mimeType: 'image/jpeg',
        fileSize: MAX_IMAGE_SIZE, // Exactly 10MB
      };

      const result = validateContent(content);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    /**
     * Requirement 2.6: Reject image exceeding max size
     */
    it('should reject image exceeding max size (10MB)', () => {
      const content: PostContentWithFile = {
        type: 'image',
        mimeType: 'image/jpeg',
        fileSize: MAX_IMAGE_SIZE + 1, // Just over 10MB
      };

      const result = validateContent(content);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Image file exceeds maximum size of 10MB');
    });

    /**
     * Requirement 2.6: Reject large image (15MB)
     */
    it('should reject large image (15MB)', () => {
      const content: PostContentWithFile = {
        type: 'image',
        mimeType: 'image/png',
        fileSize: 15 * 1024 * 1024, // 15MB
      };

      const result = validateContent(content);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Image file exceeds maximum size of 10MB');
    });

    /**
     * Image with URL but no file data should be valid
     */
    it('should accept image with URL only', () => {
      const content: PostContentWithFile = {
        type: 'image',
        mediaUrl: 'https://example.com/image.jpg',
      };

      const result = validateContent(content);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    /**
     * Multiple errors: Invalid format AND too large
     */
    it('should report multiple errors for invalid format and size', () => {
      const content: PostContentWithFile = {
        type: 'image',
        mimeType: 'image/bmp',
        fileSize: 15 * 1024 * 1024, // 15MB
      };

      const result = validateContent(content);

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(2);
      expect(result.errors).toContain('Unsupported image format. Supported formats: JPEG, PNG, GIF');
      expect(result.errors).toContain('Image file exceeds maximum size of 10MB');
    });
  });

  describe('Video Content Validation', () => {
    /**
     * Requirement 2.5: Reject empty video content
     */
    it('should reject video content without URL or file data', () => {
      const content: PostContentWithFile = {
        type: 'video',
      };

      const result = validateContent(content);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Video content cannot be empty');
    });

    /**
     * Requirement 2.11: Accept MP4 video format
     */
    it('should accept MP4 video format', () => {
      const content: PostContentWithFile = {
        type: 'video',
        mimeType: 'video/mp4',
        fileSize: 50 * 1024 * 1024, // 50MB
      };

      const result = validateContent(content);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    /**
     * Requirement 2.11: Accept WebM video format
     */
    it('should accept WebM video format', () => {
      const content: PostContentWithFile = {
        type: 'video',
        mimeType: 'video/webm',
        fileSize: 50 * 1024 * 1024, // 50MB
      };

      const result = validateContent(content);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    /**
     * Requirement 2.9: Reject unsupported video format (AVI)
     */
    it('should reject unsupported video format (AVI)', () => {
      const content: PostContentWithFile = {
        type: 'video',
        mimeType: 'video/avi',
        fileSize: 50 * 1024 * 1024,
      };

      const result = validateContent(content);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Unsupported video format. Supported formats: MP4, WebM');
    });

    /**
     * Requirement 2.9: Reject unsupported video format (MOV)
     */
    it('should reject unsupported video format (MOV)', () => {
      const content: PostContentWithFile = {
        type: 'video',
        mimeType: 'video/quicktime',
        fileSize: 50 * 1024 * 1024,
      };

      const result = validateContent(content);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Unsupported video format. Supported formats: MP4, WebM');
    });

    /**
     * Requirement 2.9: Reject unsupported video format (MKV)
     */
    it('should reject unsupported video format (MKV)', () => {
      const content: PostContentWithFile = {
        type: 'video',
        mimeType: 'video/x-matroska',
        fileSize: 50 * 1024 * 1024,
      };

      const result = validateContent(content);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Unsupported video format. Supported formats: MP4, WebM');
    });

    /**
     * Requirement 2.7: Accept video at exactly max size (100MB)
     */
    it('should accept video at exactly max size (100MB)', () => {
      const content: PostContentWithFile = {
        type: 'video',
        mimeType: 'video/mp4',
        fileSize: MAX_VIDEO_SIZE, // Exactly 100MB
      };

      const result = validateContent(content);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    /**
     * Requirement 2.7: Reject video exceeding max size
     */
    it('should reject video exceeding max size (100MB)', () => {
      const content: PostContentWithFile = {
        type: 'video',
        mimeType: 'video/mp4',
        fileSize: MAX_VIDEO_SIZE + 1, // Just over 100MB
      };

      const result = validateContent(content);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Video file exceeds maximum size of 100MB');
    });

    /**
     * Requirement 2.7: Reject large video (150MB)
     */
    it('should reject large video (150MB)', () => {
      const content: PostContentWithFile = {
        type: 'video',
        mimeType: 'video/webm',
        fileSize: 150 * 1024 * 1024, // 150MB
      };

      const result = validateContent(content);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Video file exceeds maximum size of 100MB');
    });

    /**
     * Video with URL but no file data should be valid
     */
    it('should accept video with URL only', () => {
      const content: PostContentWithFile = {
        type: 'video',
        mediaUrl: 'https://example.com/video.mp4',
      };

      const result = validateContent(content);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    /**
     * Multiple errors: Invalid format AND too large
     */
    it('should report multiple errors for invalid format and size', () => {
      const content: PostContentWithFile = {
        type: 'video',
        mimeType: 'video/avi',
        fileSize: 150 * 1024 * 1024, // 150MB
      };

      const result = validateContent(content);

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(2);
      expect(result.errors).toContain('Unsupported video format. Supported formats: MP4, WebM');
      expect(result.errors).toContain('Video file exceeds maximum size of 100MB');
    });
  });

  describe('Invalid Content Type', () => {
    /**
     * Should reject invalid content type
     */
    it('should reject invalid content type', () => {
      const content = {
        type: 'audio' as any,
      };

      const result = validateContent(content);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid content type');
    });
  });

  describe('Edge Cases', () => {
    /**
     * Zero file size should be valid (empty file check is separate)
     */
    it('should accept zero file size for image with valid format', () => {
      const content: PostContentWithFile = {
        type: 'image',
        mimeType: 'image/jpeg',
        fileSize: 0,
      };

      const result = validateContent(content);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    /**
     * Very small file size should be valid
     */
    it('should accept very small file size', () => {
      const content: PostContentWithFile = {
        type: 'image',
        mimeType: 'image/png',
        fileSize: 1, // 1 byte
      };

      const result = validateContent(content);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    /**
     * Content with both URL and file data should validate file data
     */
    it('should validate file data when both URL and file data present', () => {
      const content: PostContentWithFile = {
        type: 'image',
        mediaUrl: 'https://example.com/image.jpg',
        mimeType: 'image/bmp', // Invalid format
        fileSize: 1024,
      };

      const result = validateContent(content);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Unsupported image format. Supported formats: JPEG, PNG, GIF');
    });
  });
});

describe('PostService - Helper Functions', () => {
  describe('isSupportedImageFormat', () => {
    it('should return true for JPEG', () => {
      expect(isSupportedImageFormat('image/jpeg')).toBe(true);
    });

    it('should return true for PNG', () => {
      expect(isSupportedImageFormat('image/png')).toBe(true);
    });

    it('should return true for GIF', () => {
      expect(isSupportedImageFormat('image/gif')).toBe(true);
    });

    it('should return false for unsupported formats', () => {
      expect(isSupportedImageFormat('image/bmp')).toBe(false);
      expect(isSupportedImageFormat('image/webp')).toBe(false);
      expect(isSupportedImageFormat('image/tiff')).toBe(false);
    });
  });

  describe('isSupportedVideoFormat', () => {
    it('should return true for MP4', () => {
      expect(isSupportedVideoFormat('video/mp4')).toBe(true);
    });

    it('should return true for WebM', () => {
      expect(isSupportedVideoFormat('video/webm')).toBe(true);
    });

    it('should return false for unsupported formats', () => {
      expect(isSupportedVideoFormat('video/avi')).toBe(false);
      expect(isSupportedVideoFormat('video/quicktime')).toBe(false);
      expect(isSupportedVideoFormat('video/x-matroska')).toBe(false);
    });
  });
});

describe('PostService - Constants Verification', () => {
  /**
   * Verify supported image formats match requirements
   */
  it('should have correct supported image formats', () => {
    expect(SUPPORTED_IMAGE_FORMATS).toContain('image/jpeg');
    expect(SUPPORTED_IMAGE_FORMATS).toContain('image/png');
    expect(SUPPORTED_IMAGE_FORMATS).toContain('image/gif');
    expect(SUPPORTED_IMAGE_FORMATS).toHaveLength(3);
  });

  /**
   * Verify supported video formats match requirements
   */
  it('should have correct supported video formats', () => {
    expect(SUPPORTED_VIDEO_FORMATS).toContain('video/mp4');
    expect(SUPPORTED_VIDEO_FORMATS).toContain('video/webm');
    expect(SUPPORTED_VIDEO_FORMATS).toHaveLength(2);
  });

  /**
   * Verify max image size is 10MB
   */
  it('should have max image size of 10MB', () => {
    expect(MAX_IMAGE_SIZE).toBe(10 * 1024 * 1024);
  });

  /**
   * Verify max video size is 100MB
   */
  it('should have max video size of 100MB', () => {
    expect(MAX_VIDEO_SIZE).toBe(100 * 1024 * 1024);
  });
});


/**
 * Unit tests for PostService - Post Creation
 * Tests for Task 4.2: Implement post creation
 * Requirements: 2.1, 2.2, 2.3, 2.4, 3.1, 3.6
 */

import { createPost } from './PostService';
import { InMemoryStorage } from '../storage/InMemoryStorage';
import { UnauthorizedError, EmptyContentError, InvalidFormatError, FileTooLargeError } from '../models/errors';
import { PostContent, Visibility } from '../models/types';
import { DEFAULT_VISIBILITY } from '../models/constants';

describe('PostService - createPost', () => {
  let storage: InMemoryStorage;

  beforeEach(() => {
    storage = new InMemoryStorage();
  });

  afterEach(() => {
    storage.clear();
  });

  describe('Authentication Requirement (2.1)', () => {
    /**
     * Requirement 2.1: Deny request if user is not authenticated
     */
    it('should throw UnauthorizedError when userId is null', async () => {
      const content: PostContent = {
        type: 'text',
        text: 'Test post content',
      };

      await expect(createPost(null, content, undefined, storage)).rejects.toThrow(UnauthorizedError);
    });

    /**
     * Requirement 2.1: Deny request if user is not authenticated
     */
    it('should throw UnauthorizedError when userId is undefined', async () => {
      const content: PostContent = {
        type: 'text',
        text: 'Test post content',
      };

      await expect(createPost(undefined, content, undefined, storage)).rejects.toThrow(UnauthorizedError);
    });

    /**
     * Requirement 2.1: Deny request if user is not authenticated
     */
    it('should throw UnauthorizedError when userId is empty string', async () => {
      const content: PostContent = {
        type: 'text',
        text: 'Test post content',
      };

      await expect(createPost('', content, undefined, storage)).rejects.toThrow(UnauthorizedError);
    });
  });

  describe('Content Validation (2.2, 2.3, 2.4, 2.5)', () => {
    /**
     * Requirement 2.2: Create text post with valid content
     */
    it('should create a text post with valid content', async () => {
      const content: PostContent = {
        type: 'text',
        text: 'My funny AI story!',
      };

      const post = await createPost('user_123', content, undefined, storage);

      expect(post).toBeDefined();
      expect(post.id).toBeDefined();
      expect(post.authorId).toBe('user_123');
      expect(post.content.type).toBe('text');
      expect(post.content.text).toBe('My funny AI story!');
    });

    /**
     * Requirement 2.3: Create image post with valid content
     */
    it('should create an image post with valid content', async () => {
      const content: PostContent = {
        type: 'image',
        mediaUrl: 'https://example.com/funny-ai.jpg',
      };

      const post = await createPost('user_123', content, 'public', storage);

      expect(post).toBeDefined();
      expect(post.content.type).toBe('image');
      expect(post.content.mediaUrl).toBe('https://example.com/funny-ai.jpg');
    });

    /**
     * Requirement 2.4: Create video post with valid content
     */
    it('should create a video post with valid content', async () => {
      const content: PostContent = {
        type: 'video',
        mediaUrl: 'https://example.com/funny-ai.mp4',
      };

      const post = await createPost('user_123', content, 'public', storage);

      expect(post).toBeDefined();
      expect(post.content.type).toBe('video');
      expect(post.content.mediaUrl).toBe('https://example.com/funny-ai.mp4');
    });

    /**
     * Requirement 2.5: Reject empty text content
     */
    it('should throw EmptyContentError for empty text content', async () => {
      const content: PostContent = {
        type: 'text',
        text: '',
      };

      await expect(createPost('user_123', content, undefined, storage)).rejects.toThrow(EmptyContentError);
    });

    /**
     * Requirement 2.5: Reject whitespace-only text content
     */
    it('should throw EmptyContentError for whitespace-only text content', async () => {
      const content: PostContent = {
        type: 'text',
        text: '   \n\t  ',
      };

      await expect(createPost('user_123', content, undefined, storage)).rejects.toThrow(EmptyContentError);
    });

    /**
     * Requirement 2.5: Reject empty image content
     */
    it('should throw EmptyContentError for empty image content', async () => {
      const content: PostContent = {
        type: 'image',
      };

      await expect(createPost('user_123', content, undefined, storage)).rejects.toThrow(EmptyContentError);
    });

    /**
     * Requirement 2.5: Reject empty video content
     */
    it('should throw EmptyContentError for empty video content', async () => {
      const content: PostContent = {
        type: 'video',
      };

      await expect(createPost('user_123', content, undefined, storage)).rejects.toThrow(EmptyContentError);
    });
  });

  describe('Visibility Settings (3.1, 3.6)', () => {
    /**
     * Requirement 3.6: Default visibility to friends_only
     */
    it('should default visibility to friends_only when not specified', async () => {
      const content: PostContent = {
        type: 'text',
        text: 'Test post',
      };

      const post = await createPost('user_123', content, undefined, storage);

      expect(post.visibility).toBe('friends_only');
      expect(post.visibility).toBe(DEFAULT_VISIBILITY);
    });

    /**
     * Requirement 3.1: Accept friends_only visibility
     */
    it('should accept friends_only visibility when explicitly set', async () => {
      const content: PostContent = {
        type: 'text',
        text: 'Test post',
      };

      const post = await createPost('user_123', content, 'friends_only', storage);

      expect(post.visibility).toBe('friends_only');
    });

    /**
     * Requirement 3.1: Accept public visibility
     */
    it('should accept public visibility when explicitly set', async () => {
      const content: PostContent = {
        type: 'text',
        text: 'Test post',
      };

      const post = await createPost('user_123', content, 'public', storage);

      expect(post.visibility).toBe('public');
    });
  });

  describe('Post Metadata', () => {
    /**
     * Post should have a unique ID
     */
    it('should generate a unique post ID', async () => {
      const content: PostContent = {
        type: 'text',
        text: 'Test post',
      };

      const post1 = await createPost('user_123', content, undefined, storage);
      const post2 = await createPost('user_123', content, undefined, storage);

      expect(post1.id).toBeDefined();
      expect(post2.id).toBeDefined();
      expect(post1.id).not.toBe(post2.id);
    });

    /**
     * Post should have correct authorId
     */
    it('should set authorId to the authenticated user', async () => {
      const content: PostContent = {
        type: 'text',
        text: 'Test post',
      };

      const post = await createPost('user_456', content, undefined, storage);

      expect(post.authorId).toBe('user_456');
    });

    /**
     * Post should have createdAt timestamp
     */
    it('should set createdAt timestamp', async () => {
      const beforeCreate = new Date();
      const content: PostContent = {
        type: 'text',
        text: 'Test post',
      };

      const post = await createPost('user_123', content, undefined, storage);
      const afterCreate = new Date();

      expect(post.createdAt).toBeDefined();
      expect(post.createdAt.getTime()).toBeGreaterThanOrEqual(beforeCreate.getTime());
      expect(post.createdAt.getTime()).toBeLessThanOrEqual(afterCreate.getTime());
    });

    /**
     * Post should have updatedAt timestamp equal to createdAt for new posts
     */
    it('should set updatedAt equal to createdAt for new posts', async () => {
      const content: PostContent = {
        type: 'text',
        text: 'Test post',
      };

      const post = await createPost('user_123', content, undefined, storage);

      expect(post.updatedAt).toBeDefined();
      expect(post.updatedAt.getTime()).toBe(post.createdAt.getTime());
    });

    /**
     * New post should not be marked as edited
     */
    it('should set isEdited to false for new posts', async () => {
      const content: PostContent = {
        type: 'text',
        text: 'Test post',
      };

      const post = await createPost('user_123', content, undefined, storage);

      expect(post.isEdited).toBe(false);
    });
  });

  describe('Storage', () => {
    /**
     * Post should be stored and retrievable
     */
    it('should store the post in storage', async () => {
      const content: PostContent = {
        type: 'text',
        text: 'Test post',
      };

      const post = await createPost('user_123', content, undefined, storage);
      const retrievedPost = storage.getPostById(post.id);

      expect(retrievedPost).toBeDefined();
      expect(retrievedPost?.id).toBe(post.id);
      expect(retrievedPost?.authorId).toBe(post.authorId);
      expect(retrievedPost?.content.text).toBe(post.content.text);
    });

    /**
     * Multiple posts should be stored correctly
     */
    it('should store multiple posts', async () => {
      const content1: PostContent = { type: 'text', text: 'Post 1' };
      const content2: PostContent = { type: 'text', text: 'Post 2' };
      const content3: PostContent = { type: 'text', text: 'Post 3' };

      const post1 = await createPost('user_123', content1, undefined, storage);
      const post2 = await createPost('user_123', content2, undefined, storage);
      const post3 = await createPost('user_456', content3, undefined, storage);

      expect(storage.getPostById(post1.id)).toBeDefined();
      expect(storage.getPostById(post2.id)).toBeDefined();
      expect(storage.getPostById(post3.id)).toBeDefined();
      expect(storage.getAllPosts()).toHaveLength(3);
    });

    /**
     * Posts should be retrievable by author
     */
    it('should allow retrieval of posts by author', async () => {
      const content1: PostContent = { type: 'text', text: 'Post 1' };
      const content2: PostContent = { type: 'text', text: 'Post 2' };
      const content3: PostContent = { type: 'text', text: 'Post 3' };

      await createPost('user_123', content1, undefined, storage);
      await createPost('user_123', content2, undefined, storage);
      await createPost('user_456', content3, undefined, storage);

      const user123Posts = storage.getPostsByAuthor('user_123');
      const user456Posts = storage.getPostsByAuthor('user_456');

      expect(user123Posts).toHaveLength(2);
      expect(user456Posts).toHaveLength(1);
    });
  });
});


/**
 * Unit tests for PostService - Visibility Checking
 * Tests for Task 5.1: Implement visibility checking logic
 * Requirements: 3.2, 3.3, 3.4, 3.5
 */

import { canViewPost, getPost } from './PostService';
import { AccessDeniedError } from '../models/errors';
import { Post } from '../models/types';

describe('PostService - canViewPost', () => {
  let storage: InMemoryStorage;

  beforeEach(() => {
    storage = new InMemoryStorage();
  });

  afterEach(() => {
    storage.clear();
  });

  /**
   * Helper function to create a test post
   */
  function createTestPost(overrides: Partial<Post> = {}): Post {
    return {
      id: 'post_123',
      authorId: 'author_123',
      content: { type: 'text', text: 'Test post' },
      visibility: 'friends_only',
      createdAt: new Date(),
      updatedAt: new Date(),
      isEdited: false,
      ...overrides,
    };
  }

  describe('Public Posts (Requirement 3.3)', () => {
    /**
     * Requirement 3.3: Public posts are visible to all users
     */
    it('should return true for public posts when viewer is authenticated', () => {
      const post = createTestPost({ visibility: 'public' });

      const result = canViewPost(post, 'viewer_123', storage);

      expect(result).toBe(true);
    });

    /**
     * Requirement 3.3: Public posts are visible to unauthenticated users
     */
    it('should return true for public posts when viewer is unauthenticated (null)', () => {
      const post = createTestPost({ visibility: 'public' });

      const result = canViewPost(post, null, storage);

      expect(result).toBe(true);
    });

    /**
     * Requirement 3.3: Public posts are visible even to non-friends
     */
    it('should return true for public posts when viewer is not a friend', () => {
      const post = createTestPost({ visibility: 'public', authorId: 'author_123' });
      // No friendship established

      const result = canViewPost(post, 'stranger_123', storage);

      expect(result).toBe(true);
    });
  });

  describe('Friends-Only Posts - Owner Access', () => {
    /**
     * Owner can always see their own posts
     */
    it('should return true for friends_only posts when viewer is the author', () => {
      const post = createTestPost({ visibility: 'friends_only', authorId: 'author_123' });

      const result = canViewPost(post, 'author_123', storage);

      expect(result).toBe(true);
    });
  });

  describe('Friends-Only Posts - Friend Access (Requirement 3.5)', () => {
    /**
     * Requirement 3.5: Friends-only posts are visible to users in author's friends list
     */
    it('should return true for friends_only posts when viewer is in author friends list', () => {
      const post = createTestPost({ visibility: 'friends_only', authorId: 'author_123' });
      
      // Establish friendship
      storage.createFriendship({
        userId: 'author_123',
        friendId: 'friend_123',
        createdAt: new Date(),
      });
      storage.createFriendship({
        userId: 'friend_123',
        friendId: 'author_123',
        createdAt: new Date(),
      });

      const result = canViewPost(post, 'friend_123', storage);

      expect(result).toBe(true);
    });
  });

  describe('Friends-Only Posts - Non-Friend Access (Requirement 3.4)', () => {
    /**
     * Requirement 3.4: Friends-only posts are NOT visible to users NOT in author's friends list
     */
    it('should return false for friends_only posts when viewer is NOT in author friends list', () => {
      const post = createTestPost({ visibility: 'friends_only', authorId: 'author_123' });
      // No friendship established

      const result = canViewPost(post, 'stranger_123', storage);

      expect(result).toBe(false);
    });

    /**
     * Requirement 3.4: Friends-only posts are NOT visible to unauthenticated users
     */
    it('should return false for friends_only posts when viewer is unauthenticated (null)', () => {
      const post = createTestPost({ visibility: 'friends_only' });

      const result = canViewPost(post, null, storage);

      expect(result).toBe(false);
    });
  });

  describe('Friends-Only Posts - Friendship Direction (Requirement 3.2)', () => {
    /**
     * Requirement 3.2: Friends-only posts are restricted to author's friends list
     * The friendship must be from the author's perspective
     */
    it('should check friendship from author perspective', () => {
      const post = createTestPost({ visibility: 'friends_only', authorId: 'author_123' });
      
      // Only establish one-way friendship (viewer has author as friend, but not vice versa)
      // This simulates a case where the friendship is not bidirectional
      storage.createFriendship({
        userId: 'viewer_123',
        friendId: 'author_123',
        createdAt: new Date(),
      });
      // Note: author_123 does NOT have viewer_123 as friend

      const result = canViewPost(post, 'viewer_123', storage);

      // Should be false because author doesn't have viewer as friend
      expect(result).toBe(false);
    });

    /**
     * Bidirectional friendship should allow access
     */
    it('should return true when bidirectional friendship exists', () => {
      const post = createTestPost({ visibility: 'friends_only', authorId: 'author_123' });
      
      // Establish bidirectional friendship
      storage.createFriendship({
        userId: 'author_123',
        friendId: 'viewer_123',
        createdAt: new Date(),
      });
      storage.createFriendship({
        userId: 'viewer_123',
        friendId: 'author_123',
        createdAt: new Date(),
      });

      const result = canViewPost(post, 'viewer_123', storage);

      expect(result).toBe(true);
    });
  });
});

describe('PostService - getPost', () => {
  let storage: InMemoryStorage;

  beforeEach(() => {
    storage = new InMemoryStorage();
  });

  afterEach(() => {
    storage.clear();
  });

  describe('Post Not Found', () => {
    /**
     * Should return null when post doesn't exist
     */
    it('should return null when post does not exist', async () => {
      const result = await getPost('nonexistent_post', 'user_123', storage);

      expect(result).toBeNull();
    });
  });

  describe('Public Post Access', () => {
    /**
     * Requirement 3.3: Public posts are accessible to all users
     */
    it('should return public post for authenticated user', async () => {
      const post: Post = {
        id: 'post_123',
        authorId: 'author_123',
        content: { type: 'text', text: 'Public post' },
        visibility: 'public',
        createdAt: new Date(),
        updatedAt: new Date(),
        isEdited: false,
      };
      storage.createPost(post);

      const result = await getPost('post_123', 'viewer_123', storage);

      expect(result).not.toBeNull();
      expect(result?.id).toBe('post_123');
      expect(result?.content.text).toBe('Public post');
    });

    /**
     * Requirement 3.3: Public posts are accessible to unauthenticated users
     */
    it('should return public post for unauthenticated user (null)', async () => {
      const post: Post = {
        id: 'post_123',
        authorId: 'author_123',
        content: { type: 'text', text: 'Public post' },
        visibility: 'public',
        createdAt: new Date(),
        updatedAt: new Date(),
        isEdited: false,
      };
      storage.createPost(post);

      const result = await getPost('post_123', null, storage);

      expect(result).not.toBeNull();
      expect(result?.id).toBe('post_123');
    });
  });

  describe('Friends-Only Post Access', () => {
    /**
     * Owner can access their own friends-only post
     */
    it('should return friends_only post for the author', async () => {
      const post: Post = {
        id: 'post_123',
        authorId: 'author_123',
        content: { type: 'text', text: 'Friends only post' },
        visibility: 'friends_only',
        createdAt: new Date(),
        updatedAt: new Date(),
        isEdited: false,
      };
      storage.createPost(post);

      const result = await getPost('post_123', 'author_123', storage);

      expect(result).not.toBeNull();
      expect(result?.id).toBe('post_123');
    });

    /**
     * Requirement 3.5: Friends can access friends-only posts
     */
    it('should return friends_only post for a friend', async () => {
      const post: Post = {
        id: 'post_123',
        authorId: 'author_123',
        content: { type: 'text', text: 'Friends only post' },
        visibility: 'friends_only',
        createdAt: new Date(),
        updatedAt: new Date(),
        isEdited: false,
      };
      storage.createPost(post);

      // Establish friendship
      storage.createFriendship({
        userId: 'author_123',
        friendId: 'friend_123',
        createdAt: new Date(),
      });

      const result = await getPost('post_123', 'friend_123', storage);

      expect(result).not.toBeNull();
      expect(result?.id).toBe('post_123');
    });

    /**
     * Requirement 3.4: Non-friends cannot access friends-only posts
     */
    it('should throw AccessDeniedError for friends_only post when viewer is not a friend', async () => {
      const post: Post = {
        id: 'post_123',
        authorId: 'author_123',
        content: { type: 'text', text: 'Friends only post' },
        visibility: 'friends_only',
        createdAt: new Date(),
        updatedAt: new Date(),
        isEdited: false,
      };
      storage.createPost(post);
      // No friendship established

      await expect(getPost('post_123', 'stranger_123', storage)).rejects.toThrow(AccessDeniedError);
    });

    /**
     * Requirement 3.4: Unauthenticated users cannot access friends-only posts
     */
    it('should throw AccessDeniedError for friends_only post when viewer is unauthenticated', async () => {
      const post: Post = {
        id: 'post_123',
        authorId: 'author_123',
        content: { type: 'text', text: 'Friends only post' },
        visibility: 'friends_only',
        createdAt: new Date(),
        updatedAt: new Date(),
        isEdited: false,
      };
      storage.createPost(post);

      await expect(getPost('post_123', null, storage)).rejects.toThrow(AccessDeniedError);
    });
  });

  describe('Edge Cases', () => {
    /**
     * Should handle post with all content types
     */
    it('should return image post with correct visibility check', async () => {
      const post: Post = {
        id: 'post_image',
        authorId: 'author_123',
        content: { type: 'image', mediaUrl: 'https://example.com/image.jpg' },
        visibility: 'public',
        createdAt: new Date(),
        updatedAt: new Date(),
        isEdited: false,
      };
      storage.createPost(post);

      const result = await getPost('post_image', 'viewer_123', storage);

      expect(result).not.toBeNull();
      expect(result?.content.type).toBe('image');
    });

    /**
     * Should handle video post with correct visibility check
     */
    it('should return video post with correct visibility check', async () => {
      const post: Post = {
        id: 'post_video',
        authorId: 'author_123',
        content: { type: 'video', mediaUrl: 'https://example.com/video.mp4' },
        visibility: 'friends_only',
        createdAt: new Date(),
        updatedAt: new Date(),
        isEdited: false,
      };
      storage.createPost(post);

      // Establish friendship
      storage.createFriendship({
        userId: 'author_123',
        friendId: 'friend_123',
        createdAt: new Date(),
      });

      const result = await getPost('post_video', 'friend_123', storage);

      expect(result).not.toBeNull();
      expect(result?.content.type).toBe('video');
    });
  });
});


/**
 * Unit tests for PostService - Post Editing
 * Tests for Task 10.1: Implement post editing
 * Requirements: 6.1, 6.2, 6.5, 6.6
 */

import { updatePost } from './PostService';
import { PostNotFoundError } from '../models/errors';

describe('PostService - updatePost', () => {
  let storage: InMemoryStorage;

  beforeEach(() => {
    storage = new InMemoryStorage();
  });

  afterEach(() => {
    storage.clear();
  });

  /**
   * Helper function to create a test post in storage
   */
  function createTestPostInStorage(overrides: Partial<Post> = {}): Post {
    const post: Post = {
      id: 'post_123',
      authorId: 'author_123',
      content: { type: 'text', text: 'Original content' },
      visibility: 'friends_only',
      createdAt: new Date('2024-01-01T10:00:00Z'),
      updatedAt: new Date('2024-01-01T10:00:00Z'),
      isEdited: false,
      ...overrides,
    };
    storage.createPost(post);
    return post;
  }

  describe('Authentication Requirement', () => {
    /**
     * Should throw UnauthorizedError when userId is null
     */
    it('should throw UnauthorizedError when userId is null', async () => {
      createTestPostInStorage();

      await expect(
        updatePost('post_123', null, { content: { type: 'text', text: 'Updated' } }, storage)
      ).rejects.toThrow(UnauthorizedError);
    });

    /**
     * Should throw UnauthorizedError when userId is undefined
     */
    it('should throw UnauthorizedError when userId is undefined', async () => {
      createTestPostInStorage();

      await expect(
        updatePost('post_123', undefined, { content: { type: 'text', text: 'Updated' } }, storage)
      ).rejects.toThrow(UnauthorizedError);
    });

    /**
     * Should throw UnauthorizedError when userId is empty string
     */
    it('should throw UnauthorizedError when userId is empty string', async () => {
      createTestPostInStorage();

      await expect(
        updatePost('post_123', '', { content: { type: 'text', text: 'Updated' } }, storage)
      ).rejects.toThrow(UnauthorizedError);
    });
  });

  describe('Post Not Found', () => {
    /**
     * Should throw PostNotFoundError when post doesn't exist
     */
    it('should throw PostNotFoundError when post does not exist', async () => {
      await expect(
        updatePost('nonexistent_post', 'user_123', { content: { type: 'text', text: 'Updated' } }, storage)
      ).rejects.toThrow(PostNotFoundError);
    });
  });

  describe('Authorization (Requirement 6.6)', () => {
    /**
     * Requirement 6.6: Only post author can edit their post
     */
    it('should throw AccessDeniedError when user is not the author', async () => {
      createTestPostInStorage({ authorId: 'author_123' });

      await expect(
        updatePost('post_123', 'other_user', { content: { type: 'text', text: 'Updated' } }, storage)
      ).rejects.toThrow(AccessDeniedError);
    });

    /**
     * Requirement 6.1: User can edit their own posts
     */
    it('should allow author to edit their own post', async () => {
      createTestPostInStorage({ authorId: 'author_123' });

      const updatedPost = await updatePost(
        'post_123',
        'author_123',
        { content: { type: 'text', text: 'Updated content' } },
        storage
      );

      expect(updatedPost).toBeDefined();
      expect(updatedPost.content.text).toBe('Updated content');
    });
  });

  describe('Content Update (Requirement 6.1)', () => {
    /**
     * Requirement 6.1: User can edit their own posts - text content
     */
    it('should update text content', async () => {
      createTestPostInStorage({ content: { type: 'text', text: 'Original' } });

      const updatedPost = await updatePost(
        'post_123',
        'author_123',
        { content: { type: 'text', text: 'Updated text content' } },
        storage
      );

      expect(updatedPost.content.text).toBe('Updated text content');
    });

    /**
     * Should update image content
     */
    it('should update image content', async () => {
      createTestPostInStorage({ content: { type: 'image', mediaUrl: 'https://old.com/image.jpg' } });

      const updatedPost = await updatePost(
        'post_123',
        'author_123',
        { content: { type: 'image', mediaUrl: 'https://new.com/image.jpg' } },
        storage
      );

      expect(updatedPost.content.type).toBe('image');
      expect(updatedPost.content.mediaUrl).toBe('https://new.com/image.jpg');
    });

    /**
     * Should update video content
     */
    it('should update video content', async () => {
      createTestPostInStorage({ content: { type: 'video', mediaUrl: 'https://old.com/video.mp4' } });

      const updatedPost = await updatePost(
        'post_123',
        'author_123',
        { content: { type: 'video', mediaUrl: 'https://new.com/video.mp4' } },
        storage
      );

      expect(updatedPost.content.type).toBe('video');
      expect(updatedPost.content.mediaUrl).toBe('https://new.com/video.mp4');
    });

    /**
     * Should preserve original content when not updating content
     */
    it('should preserve original content when only updating visibility', async () => {
      createTestPostInStorage({ content: { type: 'text', text: 'Original content' } });

      const updatedPost = await updatePost(
        'post_123',
        'author_123',
        { visibility: 'public' },
        storage
      );

      expect(updatedPost.content.text).toBe('Original content');
    });
  });

  describe('Edited Flag (Requirement 6.2)', () => {
    /**
     * Requirement 6.2: Edited posts show "edited" indicator
     */
    it('should set isEdited to true after editing content', async () => {
      const originalPost = createTestPostInStorage({ isEdited: false });
      expect(originalPost.isEdited).toBe(false);

      const updatedPost = await updatePost(
        'post_123',
        'author_123',
        { content: { type: 'text', text: 'Updated content' } },
        storage
      );

      expect(updatedPost.isEdited).toBe(true);
    });

    /**
     * Requirement 6.2: Edited posts show "edited" indicator - visibility change
     */
    it('should set isEdited to true after changing visibility', async () => {
      const originalPost = createTestPostInStorage({ isEdited: false, visibility: 'friends_only' });
      expect(originalPost.isEdited).toBe(false);

      const updatedPost = await updatePost(
        'post_123',
        'author_123',
        { visibility: 'public' },
        storage
      );

      expect(updatedPost.isEdited).toBe(true);
    });

    /**
     * Should keep isEdited true if already edited
     */
    it('should keep isEdited true if post was already edited', async () => {
      createTestPostInStorage({ isEdited: true });

      const updatedPost = await updatePost(
        'post_123',
        'author_123',
        { content: { type: 'text', text: 'Another update' } },
        storage
      );

      expect(updatedPost.isEdited).toBe(true);
    });
  });

  describe('Visibility Change (Requirement 6.5)', () => {
    /**
     * Requirement 6.5: User can change visibility when editing
     */
    it('should change visibility from friends_only to public', async () => {
      createTestPostInStorage({ visibility: 'friends_only' });

      const updatedPost = await updatePost(
        'post_123',
        'author_123',
        { visibility: 'public' },
        storage
      );

      expect(updatedPost.visibility).toBe('public');
    });

    /**
     * Requirement 6.5: User can change visibility when editing
     */
    it('should change visibility from public to friends_only', async () => {
      createTestPostInStorage({ visibility: 'public' });

      const updatedPost = await updatePost(
        'post_123',
        'author_123',
        { visibility: 'friends_only' },
        storage
      );

      expect(updatedPost.visibility).toBe('friends_only');
    });

    /**
     * Should preserve visibility when not updating it
     */
    it('should preserve visibility when not specified in updates', async () => {
      createTestPostInStorage({ visibility: 'public' });

      const updatedPost = await updatePost(
        'post_123',
        'author_123',
        { content: { type: 'text', text: 'Updated content' } },
        storage
      );

      expect(updatedPost.visibility).toBe('public');
    });
  });

  describe('Timestamp Preservation (Requirement 6.6)', () => {
    /**
     * Requirement 6.6: Preserve the original creation timestamp
     */
    it('should preserve original createdAt timestamp', async () => {
      const originalCreatedAt = new Date('2024-01-01T10:00:00Z');
      createTestPostInStorage({ createdAt: originalCreatedAt });

      const updatedPost = await updatePost(
        'post_123',
        'author_123',
        { content: { type: 'text', text: 'Updated content' } },
        storage
      );

      expect(updatedPost.createdAt.getTime()).toBe(originalCreatedAt.getTime());
    });

    /**
     * Should update updatedAt timestamp
     */
    it('should update updatedAt timestamp', async () => {
      const originalUpdatedAt = new Date('2024-01-01T10:00:00Z');
      createTestPostInStorage({ updatedAt: originalUpdatedAt });

      const beforeUpdate = new Date();
      const updatedPost = await updatePost(
        'post_123',
        'author_123',
        { content: { type: 'text', text: 'Updated content' } },
        storage
      );
      const afterUpdate = new Date();

      expect(updatedPost.updatedAt.getTime()).toBeGreaterThanOrEqual(beforeUpdate.getTime());
      expect(updatedPost.updatedAt.getTime()).toBeLessThanOrEqual(afterUpdate.getTime());
      expect(updatedPost.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });
  });

  describe('Content Validation', () => {
    /**
     * Should reject empty text content
     */
    it('should throw EmptyContentError for empty text content', async () => {
      createTestPostInStorage();

      await expect(
        updatePost('post_123', 'author_123', { content: { type: 'text', text: '' } }, storage)
      ).rejects.toThrow(EmptyContentError);
    });

    /**
     * Should reject whitespace-only text content
     */
    it('should throw EmptyContentError for whitespace-only text content', async () => {
      createTestPostInStorage();

      await expect(
        updatePost('post_123', 'author_123', { content: { type: 'text', text: '   \n\t  ' } }, storage)
      ).rejects.toThrow(EmptyContentError);
    });

    /**
     * Should reject empty image content
     */
    it('should throw EmptyContentError for empty image content', async () => {
      createTestPostInStorage();

      await expect(
        updatePost('post_123', 'author_123', { content: { type: 'image' } }, storage)
      ).rejects.toThrow(EmptyContentError);
    });

    /**
     * Should reject empty video content
     */
    it('should throw EmptyContentError for empty video content', async () => {
      createTestPostInStorage();

      await expect(
        updatePost('post_123', 'author_123', { content: { type: 'video' } }, storage)
      ).rejects.toThrow(EmptyContentError);
    });
  });

  describe('Storage Persistence', () => {
    /**
     * Updated post should be persisted in storage
     */
    it('should persist updated post in storage', async () => {
      createTestPostInStorage();

      await updatePost(
        'post_123',
        'author_123',
        { content: { type: 'text', text: 'Updated content' } },
        storage
      );

      const retrievedPost = storage.getPostById('post_123');
      expect(retrievedPost).toBeDefined();
      expect(retrievedPost?.content.text).toBe('Updated content');
      expect(retrievedPost?.isEdited).toBe(true);
    });

    /**
     * Should preserve authorId after update
     */
    it('should preserve authorId after update', async () => {
      createTestPostInStorage({ authorId: 'author_123' });

      const updatedPost = await updatePost(
        'post_123',
        'author_123',
        { content: { type: 'text', text: 'Updated content' } },
        storage
      );

      expect(updatedPost.authorId).toBe('author_123');
    });

    /**
     * Should preserve post ID after update
     */
    it('should preserve post ID after update', async () => {
      createTestPostInStorage({ id: 'post_123' });

      const updatedPost = await updatePost(
        'post_123',
        'author_123',
        { content: { type: 'text', text: 'Updated content' } },
        storage
      );

      expect(updatedPost.id).toBe('post_123');
    });
  });

  describe('Combined Updates', () => {
    /**
     * Should update both content and visibility at once
     */
    it('should update both content and visibility simultaneously', async () => {
      createTestPostInStorage({
        content: { type: 'text', text: 'Original' },
        visibility: 'friends_only',
      });

      const updatedPost = await updatePost(
        'post_123',
        'author_123',
        {
          content: { type: 'text', text: 'Updated content' },
          visibility: 'public',
        },
        storage
      );

      expect(updatedPost.content.text).toBe('Updated content');
      expect(updatedPost.visibility).toBe('public');
      expect(updatedPost.isEdited).toBe(true);
    });
  });
});


/**
 * Unit tests for PostService - Post Deletion
 * Tests for Task 10.2: Implement post deletion
 * Requirements: 6.3, 6.4
 */

import { deletePost } from './PostService';

describe('PostService - deletePost', () => {
  let storage: InMemoryStorage;

  beforeEach(() => {
    storage = new InMemoryStorage();
  });

  afterEach(() => {
    storage.clear();
  });

  /**
   * Helper function to create a test post in storage
   */
  function createTestPostInStorage(overrides: Partial<Post> = {}): Post {
    const post: Post = {
      id: 'post_123',
      authorId: 'author_123',
      content: { type: 'text', text: 'Test content' },
      visibility: 'friends_only',
      createdAt: new Date('2024-01-01T10:00:00Z'),
      updatedAt: new Date('2024-01-01T10:00:00Z'),
      isEdited: false,
      ...overrides,
    };
    storage.createPost(post);
    return post;
  }

  describe('Authentication Requirement', () => {
    /**
     * Should throw UnauthorizedError when userId is null
     */
    it('should throw UnauthorizedError when userId is null', async () => {
      createTestPostInStorage();

      await expect(deletePost('post_123', null, storage)).rejects.toThrow(UnauthorizedError);
    });

    /**
     * Should throw UnauthorizedError when userId is undefined
     */
    it('should throw UnauthorizedError when userId is undefined', async () => {
      createTestPostInStorage();

      await expect(deletePost('post_123', undefined, storage)).rejects.toThrow(UnauthorizedError);
    });

    /**
     * Should throw UnauthorizedError when userId is empty string
     */
    it('should throw UnauthorizedError when userId is empty string', async () => {
      createTestPostInStorage();

      await expect(deletePost('post_123', '', storage)).rejects.toThrow(UnauthorizedError);
    });
  });

  describe('Post Not Found', () => {
    /**
     * Should throw PostNotFoundError when post doesn't exist
     */
    it('should throw PostNotFoundError when post does not exist', async () => {
      await expect(deletePost('nonexistent_post', 'user_123', storage)).rejects.toThrow(PostNotFoundError);
    });
  });

  describe('Authorization (Requirement 6.4)', () => {
    /**
     * Requirement 6.4: Only post author can delete their post
     */
    it('should throw AccessDeniedError when user is not the author', async () => {
      createTestPostInStorage({ authorId: 'author_123' });

      await expect(deletePost('post_123', 'other_user', storage)).rejects.toThrow(AccessDeniedError);
    });

    /**
     * Requirement 6.3: User can delete their own posts
     */
    it('should allow author to delete their own post', async () => {
      createTestPostInStorage({ authorId: 'author_123' });

      await expect(deletePost('post_123', 'author_123', storage)).resolves.toBeUndefined();
    });
  });

  describe('Post Removal (Requirement 6.3)', () => {
    /**
     * Requirement 6.3: Delete removes post from the system
     */
    it('should remove post from storage after deletion', async () => {
      createTestPostInStorage({ id: 'post_123', authorId: 'author_123' });
      
      // Verify post exists before deletion
      expect(storage.getPostById('post_123')).toBeDefined();

      await deletePost('post_123', 'author_123', storage);

      // Verify post is removed after deletion
      expect(storage.getPostById('post_123')).toBeUndefined();
    });

    /**
     * Should remove post from author's posts list
     */
    it('should remove post from author posts list', async () => {
      createTestPostInStorage({ id: 'post_123', authorId: 'author_123' });
      
      // Verify post is in author's posts before deletion
      const postsBefore = storage.getPostsByAuthor('author_123');
      expect(postsBefore).toHaveLength(1);

      await deletePost('post_123', 'author_123', storage);

      // Verify post is removed from author's posts after deletion
      const postsAfter = storage.getPostsByAuthor('author_123');
      expect(postsAfter).toHaveLength(0);
    });

    /**
     * Should not affect other posts when deleting one post
     */
    it('should not affect other posts when deleting one post', async () => {
      createTestPostInStorage({ id: 'post_1', authorId: 'author_123' });
      createTestPostInStorage({ id: 'post_2', authorId: 'author_123' });
      createTestPostInStorage({ id: 'post_3', authorId: 'other_author' });

      await deletePost('post_1', 'author_123', storage);

      // Verify other posts still exist
      expect(storage.getPostById('post_2')).toBeDefined();
      expect(storage.getPostById('post_3')).toBeDefined();
      expect(storage.getAllPosts()).toHaveLength(2);
    });
  });

  describe('Edge Cases', () => {
    /**
     * Should handle deletion of text post
     */
    it('should delete text post', async () => {
      createTestPostInStorage({
        id: 'text_post',
        authorId: 'author_123',
        content: { type: 'text', text: 'Text content' },
      });

      await deletePost('text_post', 'author_123', storage);

      expect(storage.getPostById('text_post')).toBeUndefined();
    });

    /**
     * Should handle deletion of image post
     */
    it('should delete image post', async () => {
      createTestPostInStorage({
        id: 'image_post',
        authorId: 'author_123',
        content: { type: 'image', mediaUrl: 'https://example.com/image.jpg' },
      });

      await deletePost('image_post', 'author_123', storage);

      expect(storage.getPostById('image_post')).toBeUndefined();
    });

    /**
     * Should handle deletion of video post
     */
    it('should delete video post', async () => {
      createTestPostInStorage({
        id: 'video_post',
        authorId: 'author_123',
        content: { type: 'video', mediaUrl: 'https://example.com/video.mp4' },
      });

      await deletePost('video_post', 'author_123', storage);

      expect(storage.getPostById('video_post')).toBeUndefined();
    });

    /**
     * Should handle deletion of public post
     */
    it('should delete public post', async () => {
      createTestPostInStorage({
        id: 'public_post',
        authorId: 'author_123',
        visibility: 'public',
      });

      await deletePost('public_post', 'author_123', storage);

      expect(storage.getPostById('public_post')).toBeUndefined();
    });

    /**
     * Should handle deletion of friends_only post
     */
    it('should delete friends_only post', async () => {
      createTestPostInStorage({
        id: 'friends_post',
        authorId: 'author_123',
        visibility: 'friends_only',
      });

      await deletePost('friends_post', 'author_123', storage);

      expect(storage.getPostById('friends_post')).toBeUndefined();
    });

    /**
     * Should handle deletion of edited post
     */
    it('should delete edited post', async () => {
      createTestPostInStorage({
        id: 'edited_post',
        authorId: 'author_123',
        isEdited: true,
      });

      await deletePost('edited_post', 'author_123', storage);

      expect(storage.getPostById('edited_post')).toBeUndefined();
    });
  });
});
