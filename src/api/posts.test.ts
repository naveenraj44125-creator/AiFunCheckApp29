/**
 * Post API Endpoints Tests
 * Task 12.2: Create post endpoints
 * Requirements: 2.2, 6.1, 6.3
 */

import request from 'supertest';
import { app } from '../index';
import { storage } from '../storage/InMemoryStorage';

describe('Post API Endpoints', () => {
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

  describe('POST /posts', () => {
    it('should create a text post with valid content (201)', async () => {
      const response = await request(app)
        .post('/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: {
            type: 'text',
            text: 'My funny AI story'
          }
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.authorId).toBe(userId);
      expect(response.body.content.type).toBe('text');
      expect(response.body.content.text).toBe('My funny AI story');
      expect(response.body.visibility).toBe('friends_only'); // Default visibility
      expect(response.body.isEdited).toBe(false);
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body).toHaveProperty('updatedAt');
    });

    it('should create a post with public visibility', async () => {
      const response = await request(app)
        .post('/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: {
            type: 'text',
            text: 'Public AI story'
          },
          visibility: 'public'
        });

      expect(response.status).toBe(201);
      expect(response.body.visibility).toBe('public');
    });

    it('should create an image post', async () => {
      const response = await request(app)
        .post('/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: {
            type: 'image',
            mediaUrl: 'https://example.com/image.jpg'
          }
        });

      expect(response.status).toBe(201);
      expect(response.body.content.type).toBe('image');
      expect(response.body.content.mediaUrl).toBe('https://example.com/image.jpg');
    });

    it('should create a video post', async () => {
      const response = await request(app)
        .post('/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: {
            type: 'video',
            mediaUrl: 'https://example.com/video.mp4'
          }
        });

      expect(response.status).toBe(201);
      expect(response.body.content.type).toBe('video');
      expect(response.body.content.mediaUrl).toBe('https://example.com/video.mp4');
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .post('/posts')
        .send({
          content: {
            type: 'text',
            text: 'My story'
          }
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('UNAUTHORIZED');
    });

    it('should return 400 when content is missing', async () => {
      const response = await request(app)
        .post('/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('VALIDATION_ERROR');
    });

    it('should return 400 when text content is empty', async () => {
      const response = await request(app)
        .post('/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: {
            type: 'text',
            text: ''
          }
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('EMPTY_CONTENT');
    });
  });

  describe('GET /posts/:id', () => {
    let postId: string;

    beforeEach(async () => {
      // Create a public post
      const createResponse = await request(app)
        .post('/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: {
            type: 'text',
            text: 'Test post'
          },
          visibility: 'public'
        });
      postId = createResponse.body.id;
    });

    it('should get a public post without authentication (200)', async () => {
      const response = await request(app)
        .get(`/posts/${postId}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(postId);
      expect(response.body.content.text).toBe('Test post');
    });

    it('should get a public post with authentication (200)', async () => {
      const response = await request(app)
        .get(`/posts/${postId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(postId);
    });

    it('should get own friends_only post (200)', async () => {
      // Create a friends_only post
      const createResponse = await request(app)
        .post('/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: {
            type: 'text',
            text: 'Friends only post'
          },
          visibility: 'friends_only'
        });
      const friendsOnlyPostId = createResponse.body.id;

      const response = await request(app)
        .get(`/posts/${friendsOnlyPostId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(friendsOnlyPostId);
      expect(response.body.visibility).toBe('friends_only');
    });

    it('should return 404 for non-existent post', async () => {
      const response = await request(app)
        .get('/posts/nonexistent123');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('POST_NOT_FOUND');
    });

    it('should return 403 for friends_only post when not a friend', async () => {
      // Create a friends_only post
      const createResponse = await request(app)
        .post('/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: {
            type: 'text',
            text: 'Friends only post'
          },
          visibility: 'friends_only'
        });
      const friendsOnlyPostId = createResponse.body.id;

      // Register another user
      await request(app)
        .post('/auth/register')
        .send({
          email: 'other@example.com',
          username: 'otheruser',
          password: 'password123'
        });

      const otherLoginResponse = await request(app)
        .post('/auth/login')
        .send({
          email: 'other@example.com',
          password: 'password123'
        });
      const otherToken = otherLoginResponse.body.token;

      // Try to access friends_only post as non-friend
      const response = await request(app)
        .get(`/posts/${friendsOnlyPostId}`)
        .set('Authorization', `Bearer ${otherToken}`);

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('ACCESS_DENIED');
    });

    it('should return 403 for friends_only post when unauthenticated', async () => {
      // Create a friends_only post
      const createResponse = await request(app)
        .post('/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: {
            type: 'text',
            text: 'Friends only post'
          },
          visibility: 'friends_only'
        });
      const friendsOnlyPostId = createResponse.body.id;

      const response = await request(app)
        .get(`/posts/${friendsOnlyPostId}`);

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('ACCESS_DENIED');
    });
  });

  describe('PUT /posts/:id', () => {
    let postId: string;

    beforeEach(async () => {
      // Create a post
      const createResponse = await request(app)
        .post('/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: {
            type: 'text',
            text: 'Original text'
          },
          visibility: 'friends_only'
        });
      postId = createResponse.body.id;
    });

    it('should update post content (200)', async () => {
      const response = await request(app)
        .put(`/posts/${postId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: {
            type: 'text',
            text: 'Updated text'
          }
        });

      expect(response.status).toBe(200);
      expect(response.body.content.text).toBe('Updated text');
      expect(response.body.isEdited).toBe(true);
    });

    it('should update post visibility (200)', async () => {
      const response = await request(app)
        .put(`/posts/${postId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          visibility: 'public'
        });

      expect(response.status).toBe(200);
      expect(response.body.visibility).toBe('public');
      expect(response.body.isEdited).toBe(true);
    });

    it('should preserve createdAt timestamp on update', async () => {
      // Get original post
      const originalResponse = await request(app)
        .get(`/posts/${postId}`)
        .set('Authorization', `Bearer ${authToken}`);
      const originalCreatedAt = originalResponse.body.createdAt;

      // Wait a bit to ensure time difference
      await new Promise(resolve => setTimeout(resolve, 10));

      // Update the post
      const updateResponse = await request(app)
        .put(`/posts/${postId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: {
            type: 'text',
            text: 'Updated text'
          }
        });

      expect(updateResponse.body.createdAt).toBe(originalCreatedAt);
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .put(`/posts/${postId}`)
        .send({
          content: {
            type: 'text',
            text: 'Updated text'
          }
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('UNAUTHORIZED');
    });

    it('should return 403 when updating another user\'s post', async () => {
      // Register another user
      await request(app)
        .post('/auth/register')
        .send({
          email: 'other@example.com',
          username: 'otheruser',
          password: 'password123'
        });

      const otherLoginResponse = await request(app)
        .post('/auth/login')
        .send({
          email: 'other@example.com',
          password: 'password123'
        });
      const otherToken = otherLoginResponse.body.token;

      const response = await request(app)
        .put(`/posts/${postId}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send({
          content: {
            type: 'text',
            text: 'Hacked text'
          }
        });

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('ACCESS_DENIED');
    });

    it('should return 404 for non-existent post', async () => {
      const response = await request(app)
        .put('/posts/nonexistent123')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: {
            type: 'text',
            text: 'Updated text'
          }
        });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('POST_NOT_FOUND');
    });
  });

  describe('DELETE /posts/:id', () => {
    let postId: string;

    beforeEach(async () => {
      // Create a post
      const createResponse = await request(app)
        .post('/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: {
            type: 'text',
            text: 'Post to delete'
          }
        });
      postId = createResponse.body.id;
    });

    it('should delete own post (204)', async () => {
      const response = await request(app)
        .delete(`/posts/${postId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(204);

      // Verify post is deleted
      const getResponse = await request(app)
        .get(`/posts/${postId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(getResponse.status).toBe(404);
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .delete(`/posts/${postId}`);

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('UNAUTHORIZED');
    });

    it('should return 403 when deleting another user\'s post', async () => {
      // Register another user
      await request(app)
        .post('/auth/register')
        .send({
          email: 'other@example.com',
          username: 'otheruser',
          password: 'password123'
        });

      const otherLoginResponse = await request(app)
        .post('/auth/login')
        .send({
          email: 'other@example.com',
          password: 'password123'
        });
      const otherToken = otherLoginResponse.body.token;

      const response = await request(app)
        .delete(`/posts/${postId}`)
        .set('Authorization', `Bearer ${otherToken}`);

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('ACCESS_DENIED');
    });

    it('should return 404 for non-existent post', async () => {
      const response = await request(app)
        .delete('/posts/nonexistent123')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('POST_NOT_FOUND');
    });
  });
});
