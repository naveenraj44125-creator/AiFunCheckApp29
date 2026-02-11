/**
 * Unit tests for SerializationService
 * Tests JSON serialization and deserialization of Post objects
 * Requirements: 7.4, 7.5
 */

import {
  serializePost,
  deserializePost,
  serializePosts,
  deserializePosts,
} from './SerializationService';
import { Post, PostContent, Visibility } from '../models/types';

describe('SerializationService', () => {
  // Helper function to create a test post
  const createTestPost = (overrides: Partial<Post> = {}): Post => ({
    id: 'post_123',
    authorId: 'user_456',
    content: {
      type: 'text',
      text: 'My AI assistant thought I wanted to order 100 pizzas...',
    },
    visibility: 'public',
    createdAt: new Date('2024-01-15T10:30:00Z'),
    updatedAt: new Date('2024-01-15T10:30:00Z'),
    isEdited: false,
    ...overrides,
  });

  describe('serializePost', () => {
    it('should serialize a text post correctly', () => {
      const post = createTestPost();
      const json = serializePost(post);
      const parsed = JSON.parse(json);

      expect(parsed.id).toBe('post_123');
      expect(parsed.authorId).toBe('user_456');
      expect(parsed.content.type).toBe('text');
      expect(parsed.content.text).toBe('My AI assistant thought I wanted to order 100 pizzas...');
      expect(parsed.visibility).toBe('public');
      expect(parsed.createdAt).toBe('2024-01-15T10:30:00.000Z');
      expect(parsed.updatedAt).toBe('2024-01-15T10:30:00.000Z');
      expect(parsed.isEdited).toBe(false);
    });

    it('should serialize an image post correctly', () => {
      const post = createTestPost({
        content: {
          type: 'image',
          mediaUrl: 'https://example.com/image.jpg',
        },
      });
      const json = serializePost(post);
      const parsed = JSON.parse(json);

      expect(parsed.content.type).toBe('image');
      expect(parsed.content.mediaUrl).toBe('https://example.com/image.jpg');
      expect(parsed.content.text).toBeUndefined();
    });

    it('should serialize a video post correctly', () => {
      const post = createTestPost({
        content: {
          type: 'video',
          mediaUrl: 'https://example.com/video.mp4',
        },
      });
      const json = serializePost(post);
      const parsed = JSON.parse(json);

      expect(parsed.content.type).toBe('video');
      expect(parsed.content.mediaUrl).toBe('https://example.com/video.mp4');
    });

    it('should serialize friends_only visibility correctly', () => {
      const post = createTestPost({ visibility: 'friends_only' });
      const json = serializePost(post);
      const parsed = JSON.parse(json);

      expect(parsed.visibility).toBe('friends_only');
    });

    it('should serialize edited posts correctly', () => {
      const post = createTestPost({
        isEdited: true,
        updatedAt: new Date('2024-01-16T12:00:00Z'),
      });
      const json = serializePost(post);
      const parsed = JSON.parse(json);

      expect(parsed.isEdited).toBe(true);
      expect(parsed.createdAt).toBe('2024-01-15T10:30:00.000Z');
      expect(parsed.updatedAt).toBe('2024-01-16T12:00:00.000Z');
    });

    it('should handle posts with both text and mediaUrl', () => {
      const post = createTestPost({
        content: {
          type: 'image',
          text: 'Caption for the image',
          mediaUrl: 'https://example.com/image.jpg',
        },
      });
      const json = serializePost(post);
      const parsed = JSON.parse(json);

      expect(parsed.content.type).toBe('image');
      expect(parsed.content.text).toBe('Caption for the image');
      expect(parsed.content.mediaUrl).toBe('https://example.com/image.jpg');
    });
  });

  describe('deserializePost', () => {
    it('should deserialize a text post correctly', () => {
      const json = JSON.stringify({
        id: 'post_123',
        authorId: 'user_456',
        content: {
          type: 'text',
          text: 'Test content',
        },
        visibility: 'public',
        createdAt: '2024-01-15T10:30:00.000Z',
        updatedAt: '2024-01-15T10:30:00.000Z',
        isEdited: false,
      });

      const post = deserializePost(json);

      expect(post.id).toBe('post_123');
      expect(post.authorId).toBe('user_456');
      expect(post.content.type).toBe('text');
      expect(post.content.text).toBe('Test content');
      expect(post.visibility).toBe('public');
      expect(post.createdAt).toBeInstanceOf(Date);
      expect(post.createdAt.toISOString()).toBe('2024-01-15T10:30:00.000Z');
      expect(post.updatedAt).toBeInstanceOf(Date);
      expect(post.isEdited).toBe(false);
    });

    it('should deserialize an image post correctly', () => {
      const json = JSON.stringify({
        id: 'post_123',
        authorId: 'user_456',
        content: {
          type: 'image',
          mediaUrl: 'https://example.com/image.jpg',
        },
        visibility: 'friends_only',
        createdAt: '2024-01-15T10:30:00.000Z',
        updatedAt: '2024-01-15T10:30:00.000Z',
        isEdited: false,
      });

      const post = deserializePost(json);

      expect(post.content.type).toBe('image');
      expect(post.content.mediaUrl).toBe('https://example.com/image.jpg');
      expect(post.content.text).toBeUndefined();
    });

    it('should deserialize a video post correctly', () => {
      const json = JSON.stringify({
        id: 'post_123',
        authorId: 'user_456',
        content: {
          type: 'video',
          mediaUrl: 'https://example.com/video.mp4',
        },
        visibility: 'public',
        createdAt: '2024-01-15T10:30:00.000Z',
        updatedAt: '2024-01-15T10:30:00.000Z',
        isEdited: false,
      });

      const post = deserializePost(json);

      expect(post.content.type).toBe('video');
      expect(post.content.mediaUrl).toBe('https://example.com/video.mp4');
    });

    it('should throw error for invalid JSON', () => {
      expect(() => deserializePost('not valid json')).toThrow();
    });

    it('should throw error for missing id', () => {
      const json = JSON.stringify({
        authorId: 'user_456',
        content: { type: 'text', text: 'Test' },
        visibility: 'public',
        createdAt: '2024-01-15T10:30:00.000Z',
        updatedAt: '2024-01-15T10:30:00.000Z',
        isEdited: false,
      });

      expect(() => deserializePost(json)).toThrow('Invalid post: missing or invalid id');
    });

    it('should throw error for missing authorId', () => {
      const json = JSON.stringify({
        id: 'post_123',
        content: { type: 'text', text: 'Test' },
        visibility: 'public',
        createdAt: '2024-01-15T10:30:00.000Z',
        updatedAt: '2024-01-15T10:30:00.000Z',
        isEdited: false,
      });

      expect(() => deserializePost(json)).toThrow('Invalid post: missing or invalid authorId');
    });

    it('should throw error for invalid content type', () => {
      const json = JSON.stringify({
        id: 'post_123',
        authorId: 'user_456',
        content: { type: 'invalid', text: 'Test' },
        visibility: 'public',
        createdAt: '2024-01-15T10:30:00.000Z',
        updatedAt: '2024-01-15T10:30:00.000Z',
        isEdited: false,
      });

      expect(() => deserializePost(json)).toThrow('Invalid post: invalid content type');
    });

    it('should throw error for invalid visibility', () => {
      const json = JSON.stringify({
        id: 'post_123',
        authorId: 'user_456',
        content: { type: 'text', text: 'Test' },
        visibility: 'invalid',
        createdAt: '2024-01-15T10:30:00.000Z',
        updatedAt: '2024-01-15T10:30:00.000Z',
        isEdited: false,
      });

      expect(() => deserializePost(json)).toThrow('Invalid post: invalid visibility');
    });

    it('should throw error for invalid date format', () => {
      const json = JSON.stringify({
        id: 'post_123',
        authorId: 'user_456',
        content: { type: 'text', text: 'Test' },
        visibility: 'public',
        createdAt: 'not-a-date',
        updatedAt: '2024-01-15T10:30:00.000Z',
        isEdited: false,
      });

      expect(() => deserializePost(json)).toThrow('Invalid post: createdAt is not a valid date');
    });
  });

  describe('round-trip serialization', () => {
    it('should preserve text post data through serialize/deserialize cycle', () => {
      const original = createTestPost();
      const json = serializePost(original);
      const restored = deserializePost(json);

      expect(restored.id).toBe(original.id);
      expect(restored.authorId).toBe(original.authorId);
      expect(restored.content.type).toBe(original.content.type);
      expect(restored.content.text).toBe(original.content.text);
      expect(restored.visibility).toBe(original.visibility);
      expect(restored.createdAt.getTime()).toBe(original.createdAt.getTime());
      expect(restored.updatedAt.getTime()).toBe(original.updatedAt.getTime());
      expect(restored.isEdited).toBe(original.isEdited);
    });

    it('should preserve image post data through serialize/deserialize cycle', () => {
      const original = createTestPost({
        content: {
          type: 'image',
          mediaUrl: 'https://example.com/image.png',
        },
      });
      const json = serializePost(original);
      const restored = deserializePost(json);

      expect(restored.content.type).toBe('image');
      expect(restored.content.mediaUrl).toBe(original.content.mediaUrl);
    });

    it('should preserve video post data through serialize/deserialize cycle', () => {
      const original = createTestPost({
        content: {
          type: 'video',
          mediaUrl: 'https://example.com/video.webm',
        },
      });
      const json = serializePost(original);
      const restored = deserializePost(json);

      expect(restored.content.type).toBe('video');
      expect(restored.content.mediaUrl).toBe(original.content.mediaUrl);
    });

    it('should preserve friends_only visibility through serialize/deserialize cycle', () => {
      const original = createTestPost({ visibility: 'friends_only' });
      const json = serializePost(original);
      const restored = deserializePost(json);

      expect(restored.visibility).toBe('friends_only');
    });

    it('should preserve edited status through serialize/deserialize cycle', () => {
      const original = createTestPost({
        isEdited: true,
        updatedAt: new Date('2024-01-16T12:00:00Z'),
      });
      const json = serializePost(original);
      const restored = deserializePost(json);

      expect(restored.isEdited).toBe(true);
      expect(restored.createdAt.getTime()).toBe(original.createdAt.getTime());
      expect(restored.updatedAt.getTime()).toBe(original.updatedAt.getTime());
    });
  });

  describe('serializePosts', () => {
    it('should serialize an array of posts', () => {
      const posts = [
        createTestPost({ id: 'post_1' }),
        createTestPost({ id: 'post_2', content: { type: 'image', mediaUrl: 'https://example.com/img.jpg' } }),
      ];

      const json = serializePosts(posts);
      const parsed = JSON.parse(json);

      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed.length).toBe(2);
      expect(parsed[0].id).toBe('post_1');
      expect(parsed[1].id).toBe('post_2');
      expect(parsed[1].content.type).toBe('image');
    });

    it('should serialize an empty array', () => {
      const json = serializePosts([]);
      const parsed = JSON.parse(json);

      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed.length).toBe(0);
    });
  });

  describe('deserializePosts', () => {
    it('should deserialize an array of posts', () => {
      const json = JSON.stringify([
        {
          id: 'post_1',
          authorId: 'user_1',
          content: { type: 'text', text: 'First post' },
          visibility: 'public',
          createdAt: '2024-01-15T10:30:00.000Z',
          updatedAt: '2024-01-15T10:30:00.000Z',
          isEdited: false,
        },
        {
          id: 'post_2',
          authorId: 'user_2',
          content: { type: 'video', mediaUrl: 'https://example.com/video.mp4' },
          visibility: 'friends_only',
          createdAt: '2024-01-16T10:30:00.000Z',
          updatedAt: '2024-01-16T10:30:00.000Z',
          isEdited: false,
        },
      ]);

      const posts = deserializePosts(json);

      expect(posts.length).toBe(2);
      expect(posts[0].id).toBe('post_1');
      expect(posts[0].content.type).toBe('text');
      expect(posts[1].id).toBe('post_2');
      expect(posts[1].content.type).toBe('video');
      expect(posts[1].visibility).toBe('friends_only');
    });

    it('should deserialize an empty array', () => {
      const posts = deserializePosts('[]');
      expect(posts.length).toBe(0);
    });

    it('should throw error for non-array JSON', () => {
      expect(() => deserializePosts('{}')).toThrow('Invalid posts: expected an array');
    });

    it('should throw error with index for invalid post in array', () => {
      const json = JSON.stringify([
        {
          id: 'post_1',
          authorId: 'user_1',
          content: { type: 'text', text: 'Valid post' },
          visibility: 'public',
          createdAt: '2024-01-15T10:30:00.000Z',
          updatedAt: '2024-01-15T10:30:00.000Z',
          isEdited: false,
        },
        {
          id: 'post_2',
          // Missing authorId
          content: { type: 'text', text: 'Invalid post' },
          visibility: 'public',
          createdAt: '2024-01-15T10:30:00.000Z',
          updatedAt: '2024-01-15T10:30:00.000Z',
          isEdited: false,
        },
      ]);

      expect(() => deserializePosts(json)).toThrow('Invalid post at index 1');
    });
  });

  describe('posts array round-trip', () => {
    it('should preserve array of posts through serialize/deserialize cycle', () => {
      const original = [
        createTestPost({ id: 'post_1' }),
        createTestPost({ id: 'post_2', visibility: 'friends_only' }),
        createTestPost({ id: 'post_3', content: { type: 'video', mediaUrl: 'https://example.com/v.mp4' } }),
      ];

      const json = serializePosts(original);
      const restored = deserializePosts(json);

      expect(restored.length).toBe(original.length);
      for (let i = 0; i < original.length; i++) {
        expect(restored[i].id).toBe(original[i].id);
        expect(restored[i].authorId).toBe(original[i].authorId);
        expect(restored[i].content.type).toBe(original[i].content.type);
        expect(restored[i].visibility).toBe(original[i].visibility);
        expect(restored[i].createdAt.getTime()).toBe(original[i].createdAt.getTime());
      }
    });
  });
});
