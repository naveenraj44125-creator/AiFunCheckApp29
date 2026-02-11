/**
 * Unit tests for FeedService - Feed Generation
 * Tests for Task 8.1: Implement feed generation
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6
 */

import { getFeed } from './FeedService';
import { InMemoryStorage } from '../storage/InMemoryStorage';
import { Post, Pagination } from '../models/types';

describe('FeedService - getFeed', () => {
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
    const now = new Date();
    return {
      id: `post_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      authorId: 'author_123',
      content: { type: 'text', text: 'Test post' },
      visibility: 'public',
      createdAt: now,
      updatedAt: now,
      isEdited: false,
      ...overrides,
    };
  }

  /**
   * Helper function to create and store a post
   */
  function createAndStorePost(overrides: Partial<Post> = {}): Post {
    const post = createTestPost(overrides);
    storage.createPost(post);
    return post;
  }

  /**
   * Helper function to create a friendship between two users
   */
  function createFriendship(userId1: string, userId2: string): void {
    const now = new Date();
    storage.createFriendship({ userId: userId1, friendId: userId2, createdAt: now });
    storage.createFriendship({ userId: userId2, friendId: userId1, createdAt: now });
  }

  describe('Visibility Rules (Requirements 4.1, 4.2, 4.3, 4.5)', () => {
    /**
     * Requirement 4.2: Shows public posts from all users
     */
    it('should return public posts for authenticated users', async () => {
      const publicPost = createAndStorePost({ 
        authorId: 'author_1', 
        visibility: 'public',
        content: { type: 'text', text: 'Public post' }
      });

      const pagination: Pagination = { limit: 10, offset: 0 };
      const result = await getFeed('viewer_123', pagination, storage);

      expect(result.posts).toHaveLength(1);
      expect(result.posts[0].id).toBe(publicPost.id);
    });

    /**
     * Requirement 4.5: For unauthenticated users, shows only public posts
     */
    it('should return only public posts for unauthenticated users (null userId)', async () => {
      const publicPost = createAndStorePost({ 
        authorId: 'author_1', 
        visibility: 'public' 
      });
      createAndStorePost({ 
        authorId: 'author_2', 
        visibility: 'friends_only' 
      });

      const pagination: Pagination = { limit: 10, offset: 0 };
      const result = await getFeed(null, pagination, storage);

      expect(result.posts).toHaveLength(1);
      expect(result.posts[0].id).toBe(publicPost.id);
      expect(result.total).toBe(1);
    });

    /**
     * Requirement 4.3: Shows friends_only posts only from users in viewer's friends list
     */
    it('should return friends_only posts from friends', async () => {
      const friendPost = createAndStorePost({ 
        authorId: 'friend_user', 
        visibility: 'friends_only',
        content: { type: 'text', text: 'Friends only post' }
      });
      
      // Create friendship between viewer and author
      createFriendship('viewer_123', 'friend_user');

      const pagination: Pagination = { limit: 10, offset: 0 };
      const result = await getFeed('viewer_123', pagination, storage);

      expect(result.posts).toHaveLength(1);
      expect(result.posts[0].id).toBe(friendPost.id);
    });

    /**
     * Requirement 4.3: Does NOT show friends_only posts from non-friends
     */
    it('should NOT return friends_only posts from non-friends', async () => {
      createAndStorePost({ 
        authorId: 'stranger_user', 
        visibility: 'friends_only' 
      });

      const pagination: Pagination = { limit: 10, offset: 0 };
      const result = await getFeed('viewer_123', pagination, storage);

      expect(result.posts).toHaveLength(0);
      expect(result.total).toBe(0);
    });

    /**
     * Requirement 4.1: Returns posts based on visibility rules
     * Combined test for mixed visibility posts
     */
    it('should return correct mix of public and friends_only posts', async () => {
      // Public post from anyone
      const publicPost = createAndStorePost({ 
        id: 'public_post',
        authorId: 'stranger_user', 
        visibility: 'public',
        createdAt: new Date('2024-01-01')
      });
      
      // Friends-only post from friend
      const friendPost = createAndStorePost({ 
        id: 'friend_post',
        authorId: 'friend_user', 
        visibility: 'friends_only',
        createdAt: new Date('2024-01-02')
      });
      
      // Friends-only post from non-friend (should NOT appear)
      createAndStorePost({ 
        id: 'stranger_private_post',
        authorId: 'stranger_user', 
        visibility: 'friends_only',
        createdAt: new Date('2024-01-03')
      });

      // Create friendship
      createFriendship('viewer_123', 'friend_user');

      const pagination: Pagination = { limit: 10, offset: 0 };
      const result = await getFeed('viewer_123', pagination, storage);

      expect(result.posts).toHaveLength(2);
      expect(result.total).toBe(2);
      // Should contain public post and friend's post
      const postIds = result.posts.map(p => p.id);
      expect(postIds).toContain(publicPost.id);
      expect(postIds).toContain(friendPost.id);
    });

    /**
     * User can see their own friends_only posts
     */
    it('should return user\'s own friends_only posts', async () => {
      const ownPost = createAndStorePost({ 
        authorId: 'viewer_123', 
        visibility: 'friends_only' 
      });

      const pagination: Pagination = { limit: 10, offset: 0 };
      const result = await getFeed('viewer_123', pagination, storage);

      expect(result.posts).toHaveLength(1);
      expect(result.posts[0].id).toBe(ownPost.id);
    });
  });

  describe('Feed Ordering (Requirement 4.4)', () => {
    /**
     * Requirement 4.4: Orders posts by creation date in descending order (newest first)
     */
    it('should order posts by creation date descending (newest first)', async () => {
      const oldPost = createAndStorePost({ 
        id: 'old_post',
        authorId: 'author_1', 
        visibility: 'public',
        createdAt: new Date('2024-01-01T10:00:00Z')
      });
      
      const middlePost = createAndStorePost({ 
        id: 'middle_post',
        authorId: 'author_2', 
        visibility: 'public',
        createdAt: new Date('2024-01-02T10:00:00Z')
      });
      
      const newPost = createAndStorePost({ 
        id: 'new_post',
        authorId: 'author_3', 
        visibility: 'public',
        createdAt: new Date('2024-01-03T10:00:00Z')
      });

      const pagination: Pagination = { limit: 10, offset: 0 };
      const result = await getFeed('viewer_123', pagination, storage);

      expect(result.posts).toHaveLength(3);
      expect(result.posts[0].id).toBe(newPost.id);
      expect(result.posts[1].id).toBe(middlePost.id);
      expect(result.posts[2].id).toBe(oldPost.id);
    });

    /**
     * Posts with same timestamp should be handled gracefully
     */
    it('should handle posts with same creation timestamp', async () => {
      const sameTime = new Date('2024-01-01T10:00:00Z');
      
      createAndStorePost({ 
        id: 'post_1',
        visibility: 'public',
        createdAt: sameTime
      });
      
      createAndStorePost({ 
        id: 'post_2',
        visibility: 'public',
        createdAt: sameTime
      });

      const pagination: Pagination = { limit: 10, offset: 0 };
      const result = await getFeed('viewer_123', pagination, storage);

      expect(result.posts).toHaveLength(2);
    });
  });

  describe('Empty Feed (Requirement 4.6)', () => {
    /**
     * Requirement 4.6: Returns empty array if no posts match criteria
     */
    it('should return empty array when no posts exist', async () => {
      const pagination: Pagination = { limit: 10, offset: 0 };
      const result = await getFeed('viewer_123', pagination, storage);

      expect(result.posts).toHaveLength(0);
      expect(result.total).toBe(0);
      expect(result.hasMore).toBe(false);
    });

    /**
     * Requirement 4.6: Returns empty array when no posts match visibility criteria
     */
    it('should return empty array when no posts match visibility criteria', async () => {
      // Only friends_only posts from non-friends
      createAndStorePost({ 
        authorId: 'stranger_1', 
        visibility: 'friends_only' 
      });
      createAndStorePost({ 
        authorId: 'stranger_2', 
        visibility: 'friends_only' 
      });

      const pagination: Pagination = { limit: 10, offset: 0 };
      const result = await getFeed('viewer_123', pagination, storage);

      expect(result.posts).toHaveLength(0);
      expect(result.total).toBe(0);
    });

    /**
     * Unauthenticated user with only friends_only posts
     */
    it('should return empty array for unauthenticated user when only friends_only posts exist', async () => {
      createAndStorePost({ 
        authorId: 'author_1', 
        visibility: 'friends_only' 
      });

      const pagination: Pagination = { limit: 10, offset: 0 };
      const result = await getFeed(null, pagination, storage);

      expect(result.posts).toHaveLength(0);
      expect(result.total).toBe(0);
    });
  });

  describe('Pagination', () => {
    /**
     * Should respect limit parameter
     */
    it('should respect limit parameter', async () => {
      // Create 5 posts
      for (let i = 0; i < 5; i++) {
        createAndStorePost({ 
          id: `post_${i}`,
          visibility: 'public',
          createdAt: new Date(Date.now() + i * 1000)
        });
      }

      const pagination: Pagination = { limit: 3, offset: 0 };
      const result = await getFeed('viewer_123', pagination, storage);

      expect(result.posts).toHaveLength(3);
      expect(result.total).toBe(5);
      expect(result.hasMore).toBe(true);
    });

    /**
     * Should respect offset parameter
     */
    it('should respect offset parameter', async () => {
      // Create 5 posts with distinct timestamps
      const posts: Post[] = [];
      for (let i = 0; i < 5; i++) {
        const post = createAndStorePost({ 
          id: `post_${i}`,
          visibility: 'public',
          createdAt: new Date(Date.now() + i * 1000)
        });
        posts.push(post);
      }

      const pagination: Pagination = { limit: 2, offset: 2 };
      const result = await getFeed('viewer_123', pagination, storage);

      expect(result.posts).toHaveLength(2);
      expect(result.total).toBe(5);
      // Posts are sorted newest first, so offset 2 should skip the 2 newest
    });

    /**
     * Should return hasMore=false when at end of results
     */
    it('should return hasMore=false when at end of results', async () => {
      // Create 3 posts
      for (let i = 0; i < 3; i++) {
        createAndStorePost({ 
          id: `post_${i}`,
          visibility: 'public'
        });
      }

      const pagination: Pagination = { limit: 10, offset: 0 };
      const result = await getFeed('viewer_123', pagination, storage);

      expect(result.posts).toHaveLength(3);
      expect(result.hasMore).toBe(false);
    });

    /**
     * Should return hasMore=true when more results exist
     */
    it('should return hasMore=true when more results exist', async () => {
      // Create 5 posts
      for (let i = 0; i < 5; i++) {
        createAndStorePost({ 
          id: `post_${i}`,
          visibility: 'public'
        });
      }

      const pagination: Pagination = { limit: 3, offset: 0 };
      const result = await getFeed('viewer_123', pagination, storage);

      expect(result.posts).toHaveLength(3);
      expect(result.hasMore).toBe(true);
    });

    /**
     * Should handle offset beyond available posts
     */
    it('should return empty array when offset exceeds total posts', async () => {
      // Create 3 posts
      for (let i = 0; i < 3; i++) {
        createAndStorePost({ 
          id: `post_${i}`,
          visibility: 'public'
        });
      }

      const pagination: Pagination = { limit: 10, offset: 10 };
      const result = await getFeed('viewer_123', pagination, storage);

      expect(result.posts).toHaveLength(0);
      expect(result.total).toBe(3);
      expect(result.hasMore).toBe(false);
    });

    /**
     * Should handle pagination with filtered results
     */
    it('should paginate correctly after visibility filtering', async () => {
      // Create 3 public posts and 2 friends_only posts from non-friends
      for (let i = 0; i < 3; i++) {
        createAndStorePost({ 
          id: `public_${i}`,
          authorId: `author_${i}`,
          visibility: 'public',
          createdAt: new Date(Date.now() + i * 1000)
        });
      }
      for (let i = 0; i < 2; i++) {
        createAndStorePost({ 
          id: `private_${i}`,
          authorId: `stranger_${i}`,
          visibility: 'friends_only'
        });
      }

      const pagination: Pagination = { limit: 2, offset: 0 };
      const result = await getFeed('viewer_123', pagination, storage);

      // Should only see 3 public posts total, limited to 2
      expect(result.posts).toHaveLength(2);
      expect(result.total).toBe(3);
      expect(result.hasMore).toBe(true);
    });

    /**
     * Second page of results
     */
    it('should return correct second page of results', async () => {
      // Create 5 posts with distinct timestamps
      for (let i = 0; i < 5; i++) {
        createAndStorePost({ 
          id: `post_${i}`,
          visibility: 'public',
          createdAt: new Date(Date.now() + i * 1000)
        });
      }

      // First page
      const page1: Pagination = { limit: 2, offset: 0 };
      const result1 = await getFeed('viewer_123', page1, storage);

      // Second page
      const page2: Pagination = { limit: 2, offset: 2 };
      const result2 = await getFeed('viewer_123', page2, storage);

      expect(result1.posts).toHaveLength(2);
      expect(result2.posts).toHaveLength(2);
      
      // Ensure no overlap between pages
      const page1Ids = result1.posts.map(p => p.id);
      const page2Ids = result2.posts.map(p => p.id);
      const overlap = page1Ids.filter(id => page2Ids.includes(id));
      expect(overlap).toHaveLength(0);
    });
  });

  describe('Edge Cases', () => {
    /**
     * Should handle limit of 0
     */
    it('should return empty array with limit of 0', async () => {
      createAndStorePost({ visibility: 'public' });

      const pagination: Pagination = { limit: 0, offset: 0 };
      const result = await getFeed('viewer_123', pagination, storage);

      expect(result.posts).toHaveLength(0);
      expect(result.total).toBe(1);
      expect(result.hasMore).toBe(true);
    });

    /**
     * Should handle large limit
     */
    it('should handle limit larger than total posts', async () => {
      createAndStorePost({ visibility: 'public' });
      createAndStorePost({ visibility: 'public' });

      const pagination: Pagination = { limit: 100, offset: 0 };
      const result = await getFeed('viewer_123', pagination, storage);

      expect(result.posts).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.hasMore).toBe(false);
    });

    /**
     * Should handle multiple content types
     */
    it('should return posts of all content types', async () => {
      createAndStorePost({ 
        id: 'text_post',
        visibility: 'public',
        content: { type: 'text', text: 'Text content' }
      });
      createAndStorePost({ 
        id: 'image_post',
        visibility: 'public',
        content: { type: 'image', mediaUrl: 'https://example.com/image.jpg' }
      });
      createAndStorePost({ 
        id: 'video_post',
        visibility: 'public',
        content: { type: 'video', mediaUrl: 'https://example.com/video.mp4' }
      });

      const pagination: Pagination = { limit: 10, offset: 0 };
      const result = await getFeed('viewer_123', pagination, storage);

      expect(result.posts).toHaveLength(3);
      const contentTypes = result.posts.map(p => p.content.type);
      expect(contentTypes).toContain('text');
      expect(contentTypes).toContain('image');
      expect(contentTypes).toContain('video');
    });
  });
});
