/**
 * Feed API Endpoint Tests
 * Task 12.4: Create feed endpoint
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6
 */

import request from 'supertest';
import { app } from '../index';
import { storage } from '../storage/InMemoryStorage';

describe('Feed API Endpoint', () => {
  let authToken: string;
  let userId: string;

  beforeEach(async () => {
    // Clear storage before each test
    storage.clear();

    // Register and login a user
    const registerResponse = await request(app)
      .post('/auth/register')
      .send({
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123'
      });
    userId = registerResponse.body.id;

    const loginResponse = await request(app)
      .post('/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });
    authToken = loginResponse.body.token;
  });

  describe('GET /feed', () => {
    it('should return empty feed when no posts exist (200)', async () => {
      const response = await request(app)
        .get('/feed')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.posts).toEqual([]);
      expect(response.body.hasMore).toBe(false);
      expect(response.body.total).toBe(0);
    });

    it('should return public posts for authenticated user (200)', async () => {
      // Create a public post
      await request(app)
        .post('/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: { type: 'text', text: 'Public post' },
          visibility: 'public'
        });

      const response = await request(app)
        .get('/feed')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.posts).toHaveLength(1);
      expect(response.body.posts[0].content.text).toBe('Public post');
      expect(response.body.posts[0].visibility).toBe('public');
      expect(response.body.total).toBe(1);
    });

    it('should return public posts for unauthenticated user (200)', async () => {
      // Create a public post
      await request(app)
        .post('/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: { type: 'text', text: 'Public post' },
          visibility: 'public'
        });

      const response = await request(app)
        .get('/feed');

      expect(response.status).toBe(200);
      expect(response.body.posts).toHaveLength(1);
      expect(response.body.posts[0].content.text).toBe('Public post');
    });

    it('should not return friends_only posts for unauthenticated user (200)', async () => {
      // Create a friends_only post
      await request(app)
        .post('/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: { type: 'text', text: 'Friends only post' },
          visibility: 'friends_only'
        });

      const response = await request(app)
        .get('/feed');

      expect(response.status).toBe(200);
      expect(response.body.posts).toHaveLength(0);
      expect(response.body.total).toBe(0);
    });

    it('should return own friends_only posts for authenticated user (200)', async () => {
      // Create a friends_only post
      await request(app)
        .post('/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: { type: 'text', text: 'My friends only post' },
          visibility: 'friends_only'
        });

      const response = await request(app)
        .get('/feed')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.posts).toHaveLength(1);
      expect(response.body.posts[0].content.text).toBe('My friends only post');
    });

    it('should return friends_only posts from friends (200)', async () => {
      // Register another user
      const otherRegisterResponse = await request(app)
        .post('/auth/register')
        .send({
          email: 'friend@example.com',
          username: 'frienduser',
          password: 'password123'
        });
      const friendId = otherRegisterResponse.body.id;

      const friendLoginResponse = await request(app)
        .post('/auth/login')
        .send({
          email: 'friend@example.com',
          password: 'password123'
        });
      const friendToken = friendLoginResponse.body.token;

      // Create a friends_only post by the friend
      await request(app)
        .post('/posts')
        .set('Authorization', `Bearer ${friendToken}`)
        .send({
          content: { type: 'text', text: 'Friend\'s private post' },
          visibility: 'friends_only'
        });

      // Before becoming friends, should not see the post
      let response = await request(app)
        .get('/feed')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.body.posts).toHaveLength(0);

      // Send friend request and accept
      const friendRequestResponse = await request(app)
        .post('/friends/request')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ targetUserId: friendId });

      await request(app)
        .post(`/friends/accept/${friendRequestResponse.body.id}`)
        .set('Authorization', `Bearer ${friendToken}`);

      // After becoming friends, should see the post
      response = await request(app)
        .get('/feed')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.body.posts).toHaveLength(1);
      expect(response.body.posts[0].content.text).toBe('Friend\'s private post');
    });

    it('should not return friends_only posts from non-friends (200)', async () => {
      // Register another user
      await request(app)
        .post('/auth/register')
        .send({
          email: 'stranger@example.com',
          username: 'stranger',
          password: 'password123'
        });

      const strangerLoginResponse = await request(app)
        .post('/auth/login')
        .send({
          email: 'stranger@example.com',
          password: 'password123'
        });
      const strangerToken = strangerLoginResponse.body.token;

      // Create a friends_only post by the stranger
      await request(app)
        .post('/posts')
        .set('Authorization', `Bearer ${strangerToken}`)
        .send({
          content: { type: 'text', text: 'Stranger\'s private post' },
          visibility: 'friends_only'
        });

      // Should not see the stranger's friends_only post
      const response = await request(app)
        .get('/feed')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.body.posts).toHaveLength(0);
    });

    it('should order posts by creation date descending (newest first)', async () => {
      // Create multiple posts with slight delays
      await request(app)
        .post('/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: { type: 'text', text: 'First post' },
          visibility: 'public'
        });

      await new Promise(resolve => setTimeout(resolve, 10));

      await request(app)
        .post('/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: { type: 'text', text: 'Second post' },
          visibility: 'public'
        });

      await new Promise(resolve => setTimeout(resolve, 10));

      await request(app)
        .post('/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: { type: 'text', text: 'Third post' },
          visibility: 'public'
        });

      const response = await request(app)
        .get('/feed')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.posts).toHaveLength(3);
      // Newest first
      expect(response.body.posts[0].content.text).toBe('Third post');
      expect(response.body.posts[1].content.text).toBe('Second post');
      expect(response.body.posts[2].content.text).toBe('First post');
    });

    it('should support pagination with limit parameter', async () => {
      // Create 5 public posts
      for (let i = 1; i <= 5; i++) {
        await request(app)
          .post('/posts')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            content: { type: 'text', text: `Post ${i}` },
            visibility: 'public'
          });
        await new Promise(resolve => setTimeout(resolve, 5));
      }

      const response = await request(app)
        .get('/feed?limit=2')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.posts).toHaveLength(2);
      expect(response.body.hasMore).toBe(true);
      expect(response.body.total).toBe(5);
    });

    it('should support pagination with offset parameter', async () => {
      // Create 5 public posts
      for (let i = 1; i <= 5; i++) {
        await request(app)
          .post('/posts')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            content: { type: 'text', text: `Post ${i}` },
            visibility: 'public'
          });
        await new Promise(resolve => setTimeout(resolve, 5));
      }

      const response = await request(app)
        .get('/feed?limit=2&offset=2')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.posts).toHaveLength(2);
      expect(response.body.hasMore).toBe(true);
      expect(response.body.total).toBe(5);
      // Posts 3 and 2 (0-indexed: posts at positions 2 and 3, which are "Post 3" and "Post 2" in descending order)
      expect(response.body.posts[0].content.text).toBe('Post 3');
      expect(response.body.posts[1].content.text).toBe('Post 2');
    });

    it('should use default limit of 20 when not specified', async () => {
      // Create 25 public posts
      for (let i = 1; i <= 25; i++) {
        await request(app)
          .post('/posts')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            content: { type: 'text', text: `Post ${i}` },
            visibility: 'public'
          });
      }

      const response = await request(app)
        .get('/feed')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.posts).toHaveLength(20);
      expect(response.body.hasMore).toBe(true);
      expect(response.body.total).toBe(25);
    });

    it('should return hasMore=false when all posts are returned', async () => {
      // Create 3 public posts
      for (let i = 1; i <= 3; i++) {
        await request(app)
          .post('/posts')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            content: { type: 'text', text: `Post ${i}` },
            visibility: 'public'
          });
      }

      const response = await request(app)
        .get('/feed?limit=10')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.posts).toHaveLength(3);
      expect(response.body.hasMore).toBe(false);
      expect(response.body.total).toBe(3);
    });

    it('should return proper post structure in response', async () => {
      await request(app)
        .post('/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: { type: 'text', text: 'Test post' },
          visibility: 'public'
        });

      const response = await request(app)
        .get('/feed')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      const post = response.body.posts[0];
      expect(post).toHaveProperty('id');
      expect(post).toHaveProperty('authorId');
      expect(post).toHaveProperty('content');
      expect(post).toHaveProperty('visibility');
      expect(post).toHaveProperty('createdAt');
      expect(post).toHaveProperty('updatedAt');
      expect(post).toHaveProperty('isEdited');
    });
  });
});
