/**
 * Unit tests for FriendService
 * Tests for Task 7.1: Friend request operations
 * Requirements: 5.1, 5.3, 5.4, 5.6
 */

import { FriendService } from './FriendService';
import { InMemoryStorage } from '../storage/InMemoryStorage';
import { User } from '../models/types';
import {
  SelfFriendRequestError,
  DuplicateFriendRequestError,
  FriendRequestNotFoundError,
  ForbiddenError,
  UserNotFoundError,
  NotFriendsError
} from '../models/errors';

describe('FriendService', () => {
  let storage: InMemoryStorage;
  let friendService: FriendService;
  let user1: User;
  let user2: User;
  let user3: User;

  beforeEach(() => {
    // Create fresh storage for each test
    storage = new InMemoryStorage();
    friendService = new FriendService(storage);

    // Create test users
    user1 = {
      id: 'user-1',
      email: 'user1@example.com',
      username: 'user1',
      passwordHash: 'hash1',
      createdAt: new Date()
    };

    user2 = {
      id: 'user-2',
      email: 'user2@example.com',
      username: 'user2',
      passwordHash: 'hash2',
      createdAt: new Date()
    };

    user3 = {
      id: 'user-3',
      email: 'user3@example.com',
      username: 'user3',
      passwordHash: 'hash3',
      createdAt: new Date()
    };

    storage.createUser(user1);
    storage.createUser(user2);
    storage.createUser(user3);
  });

  describe('sendFriendRequest', () => {
    /**
     * Requirement 5.1: Create pending friend request
     */
    it('should create a pending friend request between two users', async () => {
      const request = await friendService.sendFriendRequest(user1.id, user2.id);

      expect(request).toBeDefined();
      expect(request.id).toBeDefined();
      expect(request.fromUserId).toBe(user1.id);
      expect(request.toUserId).toBe(user2.id);
      expect(request.status).toBe('pending');
      expect(request.createdAt).toBeInstanceOf(Date);
    });

    /**
     * Requirement 5.1: Friend request should be stored and retrievable
     */
    it('should store friend request that can be retrieved', async () => {
      const request = await friendService.sendFriendRequest(user1.id, user2.id);

      const storedRequest = storage.getFriendRequestById(request.id);
      expect(storedRequest).toBeDefined();
      expect(storedRequest?.id).toBe(request.id);
      expect(storedRequest?.fromUserId).toBe(user1.id);
      expect(storedRequest?.toUserId).toBe(user2.id);
    });

    /**
     * Requirement 5.6: Reject self-requests
     */
    it('should reject friend request to self', async () => {
      await expect(
        friendService.sendFriendRequest(user1.id, user1.id)
      ).rejects.toThrow(SelfFriendRequestError);
    });

    /**
     * Duplicate request: Reject if pending request already exists
     */
    it('should reject duplicate pending friend request', async () => {
      await friendService.sendFriendRequest(user1.id, user2.id);

      await expect(
        friendService.sendFriendRequest(user1.id, user2.id)
      ).rejects.toThrow(DuplicateFriendRequestError);
    });

    /**
     * Duplicate request: Reject if reverse pending request exists
     */
    it('should reject friend request if reverse request is pending', async () => {
      await friendService.sendFriendRequest(user2.id, user1.id);

      await expect(
        friendService.sendFriendRequest(user1.id, user2.id)
      ).rejects.toThrow(DuplicateFriendRequestError);
    });

    /**
     * Duplicate request: Reject if users are already friends
     */
    it('should reject friend request if users are already friends', async () => {
      // Create friendship directly
      const request = await friendService.sendFriendRequest(user1.id, user2.id);
      await friendService.acceptFriendRequest(request.id, user2.id);

      await expect(
        friendService.sendFriendRequest(user1.id, user2.id)
      ).rejects.toThrow(DuplicateFriendRequestError);
    });

    /**
     * User validation: Reject if sender doesn't exist
     */
    it('should reject friend request from non-existent user', async () => {
      await expect(
        friendService.sendFriendRequest('non-existent-user', user2.id)
      ).rejects.toThrow(UserNotFoundError);
    });

    /**
     * User validation: Reject if recipient doesn't exist
     */
    it('should reject friend request to non-existent user', async () => {
      await expect(
        friendService.sendFriendRequest(user1.id, 'non-existent-user')
      ).rejects.toThrow(UserNotFoundError);
    });

    /**
     * Multiple requests: User can send requests to multiple users
     */
    it('should allow user to send friend requests to multiple users', async () => {
      const request1 = await friendService.sendFriendRequest(user1.id, user2.id);
      const request2 = await friendService.sendFriendRequest(user1.id, user3.id);

      expect(request1.id).not.toBe(request2.id);
      expect(request1.toUserId).toBe(user2.id);
      expect(request2.toUserId).toBe(user3.id);
    });
  });

  describe('acceptFriendRequest', () => {
    /**
     * Requirement 5.3: Accept request and create bidirectional friendship
     */
    it('should accept friend request and create bidirectional friendship', async () => {
      const request = await friendService.sendFriendRequest(user1.id, user2.id);

      await friendService.acceptFriendRequest(request.id, user2.id);

      // Check that both users are now friends
      const areFriends = await friendService.areFriends(user1.id, user2.id);
      expect(areFriends).toBe(true);

      // Check bidirectional friendship
      const areFriendsReverse = await friendService.areFriends(user2.id, user1.id);
      expect(areFriendsReverse).toBe(true);
    });

    /**
     * Requirement 5.3: Request status should be updated to accepted
     */
    it('should update request status to accepted', async () => {
      const request = await friendService.sendFriendRequest(user1.id, user2.id);

      await friendService.acceptFriendRequest(request.id, user2.id);

      const updatedRequest = storage.getFriendRequestById(request.id);
      expect(updatedRequest?.status).toBe('accepted');
    });

    /**
     * Authorization: Only recipient can accept
     */
    it('should reject accept from non-recipient user', async () => {
      const request = await friendService.sendFriendRequest(user1.id, user2.id);

      // user1 (sender) tries to accept
      await expect(
        friendService.acceptFriendRequest(request.id, user1.id)
      ).rejects.toThrow(ForbiddenError);

      // user3 (unrelated) tries to accept
      await expect(
        friendService.acceptFriendRequest(request.id, user3.id)
      ).rejects.toThrow(ForbiddenError);
    });

    /**
     * Error handling: Reject if request doesn't exist
     */
    it('should reject accept for non-existent request', async () => {
      await expect(
        friendService.acceptFriendRequest('non-existent-request', user2.id)
      ).rejects.toThrow(FriendRequestNotFoundError);
    });

    /**
     * Error handling: Reject if request is already accepted
     */
    it('should reject accept for already accepted request', async () => {
      const request = await friendService.sendFriendRequest(user1.id, user2.id);
      await friendService.acceptFriendRequest(request.id, user2.id);

      await expect(
        friendService.acceptFriendRequest(request.id, user2.id)
      ).rejects.toThrow(FriendRequestNotFoundError);
    });

    /**
     * Error handling: Reject if request is already declined
     */
    it('should reject accept for already declined request', async () => {
      const request = await friendService.sendFriendRequest(user1.id, user2.id);
      await friendService.declineFriendRequest(request.id, user2.id);

      await expect(
        friendService.acceptFriendRequest(request.id, user2.id)
      ).rejects.toThrow(FriendRequestNotFoundError);
    });

    /**
     * Friends list: Accepted users should appear in each other's friends list
     */
    it('should add both users to each other\'s friends list', async () => {
      const request = await friendService.sendFriendRequest(user1.id, user2.id);
      await friendService.acceptFriendRequest(request.id, user2.id);

      const user1Friends = await friendService.getFriends(user1.id);
      const user2Friends = await friendService.getFriends(user2.id);

      expect(user1Friends.map(f => f.id)).toContain(user2.id);
      expect(user2Friends.map(f => f.id)).toContain(user1.id);
    });
  });

  describe('declineFriendRequest', () => {
    /**
     * Requirement 5.4: Decline request without creating friendship
     */
    it('should decline friend request without creating friendship', async () => {
      const request = await friendService.sendFriendRequest(user1.id, user2.id);

      await friendService.declineFriendRequest(request.id, user2.id);

      // Check that users are NOT friends
      const areFriends = await friendService.areFriends(user1.id, user2.id);
      expect(areFriends).toBe(false);
    });

    /**
     * Requirement 5.4: Request status should be updated to declined
     */
    it('should update request status to declined', async () => {
      const request = await friendService.sendFriendRequest(user1.id, user2.id);

      await friendService.declineFriendRequest(request.id, user2.id);

      const updatedRequest = storage.getFriendRequestById(request.id);
      expect(updatedRequest?.status).toBe('declined');
    });

    /**
     * Authorization: Only recipient can decline
     */
    it('should reject decline from non-recipient user', async () => {
      const request = await friendService.sendFriendRequest(user1.id, user2.id);

      // user1 (sender) tries to decline
      await expect(
        friendService.declineFriendRequest(request.id, user1.id)
      ).rejects.toThrow(ForbiddenError);

      // user3 (unrelated) tries to decline
      await expect(
        friendService.declineFriendRequest(request.id, user3.id)
      ).rejects.toThrow(ForbiddenError);
    });

    /**
     * Error handling: Reject if request doesn't exist
     */
    it('should reject decline for non-existent request', async () => {
      await expect(
        friendService.declineFriendRequest('non-existent-request', user2.id)
      ).rejects.toThrow(FriendRequestNotFoundError);
    });

    /**
     * Error handling: Reject if request is already declined
     */
    it('should reject decline for already declined request', async () => {
      const request = await friendService.sendFriendRequest(user1.id, user2.id);
      await friendService.declineFriendRequest(request.id, user2.id);

      await expect(
        friendService.declineFriendRequest(request.id, user2.id)
      ).rejects.toThrow(FriendRequestNotFoundError);
    });

    /**
     * Error handling: Reject if request is already accepted
     */
    it('should reject decline for already accepted request', async () => {
      const request = await friendService.sendFriendRequest(user1.id, user2.id);
      await friendService.acceptFriendRequest(request.id, user2.id);

      await expect(
        friendService.declineFriendRequest(request.id, user2.id)
      ).rejects.toThrow(FriendRequestNotFoundError);
    });

    /**
     * Friends list: Declined users should NOT appear in friends list
     */
    it('should not add users to friends list after decline', async () => {
      const request = await friendService.sendFriendRequest(user1.id, user2.id);
      await friendService.declineFriendRequest(request.id, user2.id);

      const user1Friends = await friendService.getFriends(user1.id);
      const user2Friends = await friendService.getFriends(user2.id);

      expect(user1Friends.map(f => f.id)).not.toContain(user2.id);
      expect(user2Friends.map(f => f.id)).not.toContain(user1.id);
    });
  });

  describe('areFriends', () => {
    /**
     * Should return false for non-friends
     */
    it('should return false for users who are not friends', async () => {
      const areFriends = await friendService.areFriends(user1.id, user2.id);
      expect(areFriends).toBe(false);
    });

    /**
     * Should return true for friends
     */
    it('should return true for users who are friends', async () => {
      const request = await friendService.sendFriendRequest(user1.id, user2.id);
      await friendService.acceptFriendRequest(request.id, user2.id);

      const areFriends = await friendService.areFriends(user1.id, user2.id);
      expect(areFriends).toBe(true);
    });

    /**
     * Should return false for pending friend request
     */
    it('should return false for pending friend request', async () => {
      await friendService.sendFriendRequest(user1.id, user2.id);

      const areFriends = await friendService.areFriends(user1.id, user2.id);
      expect(areFriends).toBe(false);
    });

    /**
     * Should return false for declined friend request
     */
    it('should return false for declined friend request', async () => {
      const request = await friendService.sendFriendRequest(user1.id, user2.id);
      await friendService.declineFriendRequest(request.id, user2.id);

      const areFriends = await friendService.areFriends(user1.id, user2.id);
      expect(areFriends).toBe(false);
    });
  });

  describe('removeFriend', () => {
    /**
     * Requirement 5.5: Remove both users from each other's Friends_List
     */
    it('should remove both users from each other\'s friends list (bidirectional removal)', async () => {
      // First, create a friendship
      const request = await friendService.sendFriendRequest(user1.id, user2.id);
      await friendService.acceptFriendRequest(request.id, user2.id);

      // Verify they are friends
      expect(await friendService.areFriends(user1.id, user2.id)).toBe(true);

      // Remove the friendship
      await friendService.removeFriend(user1.id, user2.id);

      // Verify they are no longer friends (bidirectional)
      expect(await friendService.areFriends(user1.id, user2.id)).toBe(false);
      expect(await friendService.areFriends(user2.id, user1.id)).toBe(false);
    });

    /**
     * Requirement 5.5: Verify removal from friends list
     */
    it('should remove friend from getFriends results after removal', async () => {
      // Create friendship
      const request = await friendService.sendFriendRequest(user1.id, user2.id);
      await friendService.acceptFriendRequest(request.id, user2.id);

      // Verify friend appears in list
      let user1Friends = await friendService.getFriends(user1.id);
      let user2Friends = await friendService.getFriends(user2.id);
      expect(user1Friends.map(f => f.id)).toContain(user2.id);
      expect(user2Friends.map(f => f.id)).toContain(user1.id);

      // Remove friendship
      await friendService.removeFriend(user1.id, user2.id);

      // Verify friend no longer appears in either list
      user1Friends = await friendService.getFriends(user1.id);
      user2Friends = await friendService.getFriends(user2.id);
      expect(user1Friends.map(f => f.id)).not.toContain(user2.id);
      expect(user2Friends.map(f => f.id)).not.toContain(user1.id);
    });

    /**
     * Error handling: Throw NotFriendsError if users are not friends
     */
    it('should throw NotFriendsError if users are not friends', async () => {
      await expect(
        friendService.removeFriend(user1.id, user2.id)
      ).rejects.toThrow(NotFriendsError);
    });

    /**
     * Error handling: Throw NotFriendsError for pending friend request
     */
    it('should throw NotFriendsError if friend request is pending', async () => {
      await friendService.sendFriendRequest(user1.id, user2.id);

      await expect(
        friendService.removeFriend(user1.id, user2.id)
      ).rejects.toThrow(NotFriendsError);
    });

    /**
     * Error handling: Throw NotFriendsError for declined friend request
     */
    it('should throw NotFriendsError if friend request was declined', async () => {
      const request = await friendService.sendFriendRequest(user1.id, user2.id);
      await friendService.declineFriendRequest(request.id, user2.id);

      await expect(
        friendService.removeFriend(user1.id, user2.id)
      ).rejects.toThrow(NotFriendsError);
    });

    /**
     * Bidirectional: Either user can initiate removal
     */
    it('should allow either user to initiate friend removal', async () => {
      // Create friendship
      const request = await friendService.sendFriendRequest(user1.id, user2.id);
      await friendService.acceptFriendRequest(request.id, user2.id);

      // user2 initiates removal (not the original requester)
      await friendService.removeFriend(user2.id, user1.id);

      // Verify they are no longer friends
      expect(await friendService.areFriends(user1.id, user2.id)).toBe(false);
      expect(await friendService.areFriends(user2.id, user1.id)).toBe(false);
    });

    /**
     * Multiple friends: Removing one friend should not affect other friendships
     */
    it('should not affect other friendships when removing one friend', async () => {
      // Create friendships: user1 <-> user2 and user1 <-> user3
      const request1 = await friendService.sendFriendRequest(user1.id, user2.id);
      const request2 = await friendService.sendFriendRequest(user1.id, user3.id);
      await friendService.acceptFriendRequest(request1.id, user2.id);
      await friendService.acceptFriendRequest(request2.id, user3.id);

      // Remove user2 from user1's friends
      await friendService.removeFriend(user1.id, user2.id);

      // Verify user1 and user3 are still friends
      expect(await friendService.areFriends(user1.id, user3.id)).toBe(true);
      
      // Verify user1 and user2 are no longer friends
      expect(await friendService.areFriends(user1.id, user2.id)).toBe(false);
    });
  });

  describe('getFriends', () => {
    /**
     * Should return empty array for user with no friends
     */
    it('should return empty array for user with no friends', async () => {
      const friends = await friendService.getFriends(user1.id);
      expect(friends).toEqual([]);
    });

    /**
     * Should return friends after accepting request
     */
    it('should return friends after accepting request', async () => {
      const request = await friendService.sendFriendRequest(user1.id, user2.id);
      await friendService.acceptFriendRequest(request.id, user2.id);

      const friends = await friendService.getFriends(user1.id);
      expect(friends).toHaveLength(1);
      expect(friends[0].id).toBe(user2.id);
    });

    /**
     * Should return multiple friends
     */
    it('should return multiple friends', async () => {
      const request1 = await friendService.sendFriendRequest(user1.id, user2.id);
      const request2 = await friendService.sendFriendRequest(user1.id, user3.id);
      await friendService.acceptFriendRequest(request1.id, user2.id);
      await friendService.acceptFriendRequest(request2.id, user3.id);

      const friends = await friendService.getFriends(user1.id);
      expect(friends).toHaveLength(2);
      expect(friends.map(f => f.id)).toContain(user2.id);
      expect(friends.map(f => f.id)).toContain(user3.id);
    });
  });
});
