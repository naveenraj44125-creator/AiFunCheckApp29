/**
 * Tests for core types and models
 * Validates type definitions and basic functionality
 */

import * as fc from 'fast-check';
import {
  User,
  Post,
  Session,
  FriendRequest,
  Friendship,
  ContentType,
  Visibility,
  PostContent,
  ValidationResult
} from './types';
import { storage } from '../storage';

describe('Core Types', () => {
  beforeEach(() => {
    storage.clear();
  });

  describe('ContentType', () => {
    it('should support text, image, and video types', () => {
      const validTypes: ContentType[] = ['text', 'image', 'video'];
      validTypes.forEach(type => {
        expect(['text', 'image', 'video']).toContain(type);
      });
    });
  });

  describe('Visibility', () => {
    it('should support friends_only and public visibility', () => {
      const validVisibilities: Visibility[] = ['friends_only', 'public'];
      validVisibilities.forEach(visibility => {
        expect(['friends_only', 'public']).toContain(visibility);
      });
    });
  });

  describe('User interface', () => {
    it('should create a valid user object', () => {
      const user: User = {
        id: 'user-123',
        email: 'test@example.com',
        username: 'testuser',
        passwordHash: 'hashed_password',
        createdAt: new Date()
      };

      expect(user.id).toBe('user-123');
      expect(user.email).toBe('test@example.com');
      expect(user.username).toBe('testuser');
      expect(user.passwordHash).toBe('hashed_password');
      expect(user.createdAt).toBeInstanceOf(Date);
    });
  });

  describe('Post interface', () => {
    it('should create a valid post object with text content', () => {
      const post: Post = {
        id: 'post-123',
        authorId: 'user-456',
        content: {
          type: 'text',
          text: 'My funny AI story'
        },
        visibility: 'public',
        createdAt: new Date(),
        updatedAt: new Date(),
        isEdited: false
      };

      expect(post.id).toBe('post-123');
      expect(post.content.type).toBe('text');
      expect(post.content.text).toBe('My funny AI story');
      expect(post.visibility).toBe('public');
      expect(post.isEdited).toBe(false);
    });

    it('should create a valid post object with image content', () => {
      const post: Post = {
        id: 'post-456',
        authorId: 'user-789',
        content: {
          type: 'image',
          mediaUrl: '/uploads/image.jpg'
        },
        visibility: 'friends_only',
        createdAt: new Date(),
        updatedAt: new Date(),
        isEdited: false
      };

      expect(post.content.type).toBe('image');
      expect(post.content.mediaUrl).toBe('/uploads/image.jpg');
    });
  });

  describe('Session interface', () => {
    it('should create a valid session object', () => {
      const session: Session = {
        id: 'session-123',
        userId: 'user-456',
        token: 'abc123token',
        expiresAt: new Date(Date.now() + 86400000)
      };

      expect(session.id).toBe('session-123');
      expect(session.userId).toBe('user-456');
      expect(session.token).toBe('abc123token');
      expect(session.expiresAt.getTime()).toBeGreaterThan(Date.now());
    });
  });

  describe('FriendRequest interface', () => {
    it('should create a valid friend request object', () => {
      const request: FriendRequest = {
        id: 'request-123',
        fromUserId: 'user-1',
        toUserId: 'user-2',
        status: 'pending',
        createdAt: new Date()
      };

      expect(request.status).toBe('pending');
      expect(request.fromUserId).toBe('user-1');
      expect(request.toUserId).toBe('user-2');
    });
  });

  describe('Friendship interface', () => {
    it('should create a valid friendship object', () => {
      const friendship: Friendship = {
        userId: 'user-1',
        friendId: 'user-2',
        createdAt: new Date()
      };

      expect(friendship.userId).toBe('user-1');
      expect(friendship.friendId).toBe('user-2');
    });
  });
});

describe('InMemoryStorage', () => {
  beforeEach(() => {
    storage.clear();
  });

  describe('User operations', () => {
    it('should store and retrieve users', () => {
      const user: User = {
        id: 'user-123',
        email: 'test@example.com',
        username: 'testuser',
        passwordHash: 'hash',
        createdAt: new Date()
      };

      storage.createUser(user);
      
      expect(storage.getUserById('user-123')).toEqual(user);
      expect(storage.getUserByEmail('test@example.com')).toEqual(user);
      expect(storage.getUserByUsername('testuser')).toEqual(user);
    });

    it('should handle case-insensitive email lookup', () => {
      const user: User = {
        id: 'user-123',
        email: 'Test@Example.COM',
        username: 'testuser',
        passwordHash: 'hash',
        createdAt: new Date()
      };

      storage.createUser(user);
      
      expect(storage.getUserByEmail('test@example.com')).toEqual(user);
      expect(storage.getUserByEmail('TEST@EXAMPLE.COM')).toEqual(user);
    });
  });

  describe('Post operations', () => {
    it('should store and retrieve posts', () => {
      const post: Post = {
        id: 'post-123',
        authorId: 'user-456',
        content: { type: 'text', text: 'Hello' },
        visibility: 'public',
        createdAt: new Date(),
        updatedAt: new Date(),
        isEdited: false
      };

      storage.createPost(post);
      
      expect(storage.getPostById('post-123')).toEqual(post);
      expect(storage.getPostsByAuthor('user-456')).toContainEqual(post);
    });

    it('should delete posts', () => {
      const post: Post = {
        id: 'post-123',
        authorId: 'user-456',
        content: { type: 'text', text: 'Hello' },
        visibility: 'public',
        createdAt: new Date(),
        updatedAt: new Date(),
        isEdited: false
      };

      storage.createPost(post);
      expect(storage.deletePost('post-123')).toBe(true);
      expect(storage.getPostById('post-123')).toBeUndefined();
    });
  });

  describe('Friendship operations', () => {
    it('should track friendships bidirectionally', () => {
      const friendship1: Friendship = {
        userId: 'user-1',
        friendId: 'user-2',
        createdAt: new Date()
      };
      const friendship2: Friendship = {
        userId: 'user-2',
        friendId: 'user-1',
        createdAt: new Date()
      };

      storage.createFriendship(friendship1);
      storage.createFriendship(friendship2);

      expect(storage.areFriends('user-1', 'user-2')).toBe(true);
      expect(storage.areFriends('user-2', 'user-1')).toBe(true);
      expect(storage.getFriendIds('user-1')).toContain('user-2');
    });
  });
});

describe('Property-based tests for types', () => {
  /**
   * Property test: Post serialization round-trip
   * **Validates: Requirements 7.4, 7.5**
   */
  it('should serialize and deserialize posts correctly (Property 20)', () => {
    fc.assert(
      fc.property(
        fc.record({
          id: fc.uuid(),
          authorId: fc.uuid(),
          content: fc.oneof(
            fc.record({
              type: fc.constant('text' as const),
              text: fc.string({ minLength: 1 })
            }),
            fc.record({
              type: fc.constant('image' as const),
              mediaUrl: fc.webUrl()
            }),
            fc.record({
              type: fc.constant('video' as const),
              mediaUrl: fc.webUrl()
            })
          ),
          visibility: fc.constantFrom('friends_only' as const, 'public' as const),
          createdAt: fc.date(),
          updatedAt: fc.date(),
          isEdited: fc.boolean()
        }),
        (post) => {
          // Serialize to JSON
          const json = JSON.stringify(post);
          
          // Deserialize back
          const parsed = JSON.parse(json);
          
          // Convert dates back (JSON.parse returns strings for dates)
          parsed.createdAt = new Date(parsed.createdAt);
          parsed.updatedAt = new Date(parsed.updatedAt);
          
          // Verify round-trip
          expect(parsed.id).toBe(post.id);
          expect(parsed.authorId).toBe(post.authorId);
          expect(parsed.content.type).toBe(post.content.type);
          expect(parsed.visibility).toBe(post.visibility);
          expect(parsed.isEdited).toBe(post.isEdited);
          expect(parsed.createdAt.getTime()).toBe(post.createdAt.getTime());
          expect(parsed.updatedAt.getTime()).toBe(post.updatedAt.getTime());
        }
      ),
      { numRuns: 100 }
    );
  });
});
