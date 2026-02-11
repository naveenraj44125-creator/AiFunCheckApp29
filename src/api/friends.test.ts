/**
 * Friend API Endpoints Tests
 * Task 12.3: Create friend endpoints
 * Requirements: 5.1, 5.3, 5.4, 5.5
 */

import request from 'supertest';
import { app } from '../index';
import { storage } from '../storage/InMemoryStorage';

describe('Friend API Endpoints', () => {
  let user1Token: string;
  let user2Token: string;
  let user1Id: string;
  let user2Id: string;

  beforeEach(async () => {
    // Clear storage before each test
    storage.clear();

    // Register and login user 1
    const register1Response = await request(app)
      .post('/auth/register')
      .send({
        email: 'user1@example.com',
        username: 'user1',
        password: 'password123'
      });
    user1Id = register1Response.body.id;

    const login1Response = await request(app)
      .post('/auth/login')
      .send({
        email: 'user1@example.com',
        password: 'password123'
      });
    user1Token = login1Response.body.token;

    // Register and login user 2
    const register2Response = await request(app)
      .post('/auth/register')
      .send({
        email: 'user2@example.com',
        username: 'user2',
        password: 'password123'
      });
    user2Id = register2Response.body.id;

    const login2Response = await request(app)
      .post('/auth/login')
      .send({
        email: 'user2@example.com',
        password: 'password123'
      });
    user2Token = login2Response.body.token;
  });

  describe('POST /friends/request', () => {
    it('should send a friend request successfully (201)', async () => {
      const response = await request(app)
        .post('/friends/request')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ targetUserId: user2Id });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.fromUserId).toBe(user1Id);
      expect(response.body.toUserId).toBe(user2Id);
      expect(response.body.status).toBe('pending');
      expect(response.body).toHaveProperty('createdAt');
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .post('/friends/request')
        .send({ targetUserId: user2Id });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('UNAUTHORIZED');
    });

    it('should return 400 when targetUserId is missing', async () => {
      const response = await request(app)
        .post('/friends/request')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('VALIDATION_ERROR');
    });

    it('should return 400 when sending request to self', async () => {
      const response = await request(app)
        .post('/friends/request')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ targetUserId: user1Id });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('SELF_FRIEND_REQUEST');
    });

    it('should return 404 when target user does not exist', async () => {
      const response = await request(app)
        .post('/friends/request')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ targetUserId: 'non-existent-user-id' });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('USER_NOT_FOUND');
    });

    it('should return 409 when friend request already exists', async () => {
      // Send first request
      await request(app)
        .post('/friends/request')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ targetUserId: user2Id });

      // Try to send duplicate request
      const response = await request(app)
        .post('/friends/request')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ targetUserId: user2Id });

      expect(response.status).toBe(409);
      expect(response.body.error).toBe('DUPLICATE_REQUEST');
    });
  });

  describe('POST /friends/accept/:requestId', () => {
    let friendRequestId: string;

    beforeEach(async () => {
      // Create a friend request from user1 to user2
      const requestResponse = await request(app)
        .post('/friends/request')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ targetUserId: user2Id });
      friendRequestId = requestResponse.body.id;
    });

    it('should accept a friend request successfully (200)', async () => {
      const response = await request(app)
        .post(`/friends/accept/${friendRequestId}`)
        .set('Authorization', `Bearer ${user2Token}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Friend request accepted');
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .post(`/friends/accept/${friendRequestId}`);

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('UNAUTHORIZED');
    });

    it('should return 403 when not the recipient', async () => {
      const response = await request(app)
        .post(`/friends/accept/${friendRequestId}`)
        .set('Authorization', `Bearer ${user1Token}`);

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('FORBIDDEN');
    });

    it('should return 404 for non-existent request', async () => {
      const response = await request(app)
        .post('/friends/accept/non-existent-request-id')
        .set('Authorization', `Bearer ${user2Token}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('REQUEST_NOT_FOUND');
    });

    it('should create bidirectional friendship after acceptance', async () => {
      // Accept the request
      await request(app)
        .post(`/friends/accept/${friendRequestId}`)
        .set('Authorization', `Bearer ${user2Token}`);

      // Check user1's friends list
      const user1Friends = await request(app)
        .get('/friends')
        .set('Authorization', `Bearer ${user1Token}`);

      expect(user1Friends.body.friends).toHaveLength(1);
      expect(user1Friends.body.friends[0].id).toBe(user2Id);

      // Check user2's friends list
      const user2Friends = await request(app)
        .get('/friends')
        .set('Authorization', `Bearer ${user2Token}`);

      expect(user2Friends.body.friends).toHaveLength(1);
      expect(user2Friends.body.friends[0].id).toBe(user1Id);
    });
  });

  describe('POST /friends/decline/:requestId', () => {
    let friendRequestId: string;

    beforeEach(async () => {
      // Create a friend request from user1 to user2
      const requestResponse = await request(app)
        .post('/friends/request')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ targetUserId: user2Id });
      friendRequestId = requestResponse.body.id;
    });

    it('should decline a friend request successfully (200)', async () => {
      const response = await request(app)
        .post(`/friends/decline/${friendRequestId}`)
        .set('Authorization', `Bearer ${user2Token}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Friend request declined');
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .post(`/friends/decline/${friendRequestId}`);

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('UNAUTHORIZED');
    });

    it('should return 403 when not the recipient', async () => {
      const response = await request(app)
        .post(`/friends/decline/${friendRequestId}`)
        .set('Authorization', `Bearer ${user1Token}`);

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('FORBIDDEN');
    });

    it('should return 404 for non-existent request', async () => {
      const response = await request(app)
        .post('/friends/decline/non-existent-request-id')
        .set('Authorization', `Bearer ${user2Token}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('REQUEST_NOT_FOUND');
    });

    it('should not create friendship after decline', async () => {
      // Decline the request
      await request(app)
        .post(`/friends/decline/${friendRequestId}`)
        .set('Authorization', `Bearer ${user2Token}`);

      // Check user1's friends list is empty
      const user1Friends = await request(app)
        .get('/friends')
        .set('Authorization', `Bearer ${user1Token}`);

      expect(user1Friends.body.friends).toHaveLength(0);

      // Check user2's friends list is empty
      const user2Friends = await request(app)
        .get('/friends')
        .set('Authorization', `Bearer ${user2Token}`);

      expect(user2Friends.body.friends).toHaveLength(0);
    });
  });

  describe('DELETE /friends/:friendId', () => {
    beforeEach(async () => {
      // Create and accept a friend request to establish friendship
      const requestResponse = await request(app)
        .post('/friends/request')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ targetUserId: user2Id });

      await request(app)
        .post(`/friends/accept/${requestResponse.body.id}`)
        .set('Authorization', `Bearer ${user2Token}`);
    });

    it('should remove a friend successfully (204)', async () => {
      const response = await request(app)
        .delete(`/friends/${user2Id}`)
        .set('Authorization', `Bearer ${user1Token}`);

      expect(response.status).toBe(204);
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .delete(`/friends/${user2Id}`);

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('UNAUTHORIZED');
    });

    it('should return 400 when users are not friends', async () => {
      // First remove the friendship
      await request(app)
        .delete(`/friends/${user2Id}`)
        .set('Authorization', `Bearer ${user1Token}`);

      // Try to remove again
      const response = await request(app)
        .delete(`/friends/${user2Id}`)
        .set('Authorization', `Bearer ${user1Token}`);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('NOT_FRIENDS');
    });

    it('should remove friendship bidirectionally', async () => {
      // Remove friend
      await request(app)
        .delete(`/friends/${user2Id}`)
        .set('Authorization', `Bearer ${user1Token}`);

      // Check user1's friends list is empty
      const user1Friends = await request(app)
        .get('/friends')
        .set('Authorization', `Bearer ${user1Token}`);

      expect(user1Friends.body.friends).toHaveLength(0);

      // Check user2's friends list is empty
      const user2Friends = await request(app)
        .get('/friends')
        .set('Authorization', `Bearer ${user2Token}`);

      expect(user2Friends.body.friends).toHaveLength(0);
    });
  });

  describe('GET /friends', () => {
    it('should return empty friends list initially (200)', async () => {
      const response = await request(app)
        .get('/friends')
        .set('Authorization', `Bearer ${user1Token}`);

      expect(response.status).toBe(200);
      expect(response.body.friends).toHaveLength(0);
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .get('/friends');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('UNAUTHORIZED');
    });

    it('should return friends list after accepting request', async () => {
      // Create and accept friend request
      const requestResponse = await request(app)
        .post('/friends/request')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ targetUserId: user2Id });

      await request(app)
        .post(`/friends/accept/${requestResponse.body.id}`)
        .set('Authorization', `Bearer ${user2Token}`);

      // Get friends list
      const response = await request(app)
        .get('/friends')
        .set('Authorization', `Bearer ${user1Token}`);

      expect(response.status).toBe(200);
      expect(response.body.friends).toHaveLength(1);
      expect(response.body.friends[0].id).toBe(user2Id);
      expect(response.body.friends[0].username).toBe('user2');
      expect(response.body.friends[0].email).toBe('user2@example.com');
      expect(response.body.friends[0]).toHaveProperty('createdAt');
      expect(response.body.friends[0]).not.toHaveProperty('passwordHash');
    });

    it('should return multiple friends', async () => {
      // Register a third user
      const register3Response = await request(app)
        .post('/auth/register')
        .send({
          email: 'user3@example.com',
          username: 'user3',
          password: 'password123'
        });
      const user3Id = register3Response.body.id;

      const login3Response = await request(app)
        .post('/auth/login')
        .send({
          email: 'user3@example.com',
          password: 'password123'
        });
      const user3Token = login3Response.body.token;

      // Create and accept friend request with user2
      const request1Response = await request(app)
        .post('/friends/request')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ targetUserId: user2Id });

      await request(app)
        .post(`/friends/accept/${request1Response.body.id}`)
        .set('Authorization', `Bearer ${user2Token}`);

      // Create and accept friend request with user3
      const request2Response = await request(app)
        .post('/friends/request')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ targetUserId: user3Id });

      await request(app)
        .post(`/friends/accept/${request2Response.body.id}`)
        .set('Authorization', `Bearer ${user3Token}`);

      // Get friends list
      const response = await request(app)
        .get('/friends')
        .set('Authorization', `Bearer ${user1Token}`);

      expect(response.status).toBe(200);
      expect(response.body.friends).toHaveLength(2);
      
      const friendIds = response.body.friends.map((f: any) => f.id);
      expect(friendIds).toContain(user2Id);
      expect(friendIds).toContain(user3Id);
    });
  });
});
