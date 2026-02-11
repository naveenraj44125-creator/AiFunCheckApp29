/**
 * Friend Service
 * Handles friend requests and friendship management
 * Requirements: 5.1-5.6
 */

import { User, FriendRequest, Friendship } from '../models/types';
import { InMemoryStorage } from '../storage/InMemoryStorage';
import {
  SelfFriendRequestError,
  DuplicateFriendRequestError,
  FriendRequestNotFoundError,
  ForbiddenError,
  UserNotFoundError,
  NotFriendsError
} from '../models/errors';
import { v4 as uuidv4 } from 'uuid';

/**
 * Friend Service Interface
 */
export interface IFriendService {
  sendFriendRequest(fromUserId: string, toUserId: string): Promise<FriendRequest>;
  acceptFriendRequest(requestId: string, userId: string): Promise<void>;
  declineFriendRequest(requestId: string, userId: string): Promise<void>;
  removeFriend(userId: string, friendId: string): Promise<void>;
  getFriends(userId: string): Promise<User[]>;
  areFriends(userId1: string, userId2: string): Promise<boolean>;
}

/**
 * Friend Service Implementation
 * Handles friend requests and friendship management
 */
export class FriendService implements IFriendService {
  constructor(private storage: InMemoryStorage) {}

  /**
   * Send a friend request from one user to another
   * Requirement 5.1: Create pending friend request
   * Requirement 5.6: Reject self-requests
   * 
   * @param fromUserId - The ID of the user sending the request
   * @param toUserId - The ID of the user receiving the request
   * @returns The created friend request
   * @throws SelfFriendRequestError if user tries to send request to themselves
   * @throws DuplicateFriendRequestError if a pending request already exists
   * @throws UserNotFoundError if either user doesn't exist
   */
  async sendFriendRequest(fromUserId: string, toUserId: string): Promise<FriendRequest> {
    // Requirement 5.6: Reject self-requests
    if (fromUserId === toUserId) {
      throw new SelfFriendRequestError();
    }

    // Validate that both users exist
    const fromUser = this.storage.getUserById(fromUserId);
    if (!fromUser) {
      throw new UserNotFoundError();
    }

    const toUser = this.storage.getUserById(toUserId);
    if (!toUser) {
      throw new UserNotFoundError();
    }

    // Check if users are already friends
    if (this.storage.areFriends(fromUserId, toUserId)) {
      throw new DuplicateFriendRequestError();
    }

    // Check for existing pending request in either direction
    const existingRequest = this.storage.getFriendRequestBetweenUsers(fromUserId, toUserId);
    if (existingRequest) {
      throw new DuplicateFriendRequestError();
    }

    // Also check for pending request in the reverse direction
    const reverseRequest = this.storage.getFriendRequestBetweenUsers(toUserId, fromUserId);
    if (reverseRequest) {
      throw new DuplicateFriendRequestError();
    }

    // Create the friend request
    const friendRequest: FriendRequest = {
      id: uuidv4(),
      fromUserId,
      toUserId,
      status: 'pending',
      createdAt: new Date()
    };

    this.storage.createFriendRequest(friendRequest);

    return friendRequest;
  }

  /**
   * Accept a friend request
   * Requirement 5.3: Add both users to each other's Friends_List
   * 
   * @param requestId - The ID of the friend request to accept
   * @param userId - The ID of the user accepting the request (must be the recipient)
   * @throws FriendRequestNotFoundError if the request doesn't exist
   * @throws ForbiddenError if the user is not the recipient of the request
   */
  async acceptFriendRequest(requestId: string, userId: string): Promise<void> {
    const request = this.storage.getFriendRequestById(requestId);

    if (!request) {
      throw new FriendRequestNotFoundError();
    }

    // Only the recipient can accept the request
    if (request.toUserId !== userId) {
      throw new ForbiddenError('Only the recipient can accept a friend request');
    }

    // Only pending requests can be accepted
    if (request.status !== 'pending') {
      throw new FriendRequestNotFoundError();
    }

    // Update the request status
    request.status = 'accepted';
    this.storage.updateFriendRequest(request);

    // Create bidirectional friendship
    const now = new Date();

    const friendship1: Friendship = {
      userId: request.fromUserId,
      friendId: request.toUserId,
      createdAt: now
    };

    const friendship2: Friendship = {
      userId: request.toUserId,
      friendId: request.fromUserId,
      createdAt: now
    };

    this.storage.createFriendship(friendship1);
    this.storage.createFriendship(friendship2);
  }

  /**
   * Decline a friend request
   * Requirement 5.4: Remove pending request without adding to Friends_List
   * 
   * @param requestId - The ID of the friend request to decline
   * @param userId - The ID of the user declining the request (must be the recipient)
   * @throws FriendRequestNotFoundError if the request doesn't exist
   * @throws ForbiddenError if the user is not the recipient of the request
   */
  async declineFriendRequest(requestId: string, userId: string): Promise<void> {
    const request = this.storage.getFriendRequestById(requestId);

    if (!request) {
      throw new FriendRequestNotFoundError();
    }

    // Only the recipient can decline the request
    if (request.toUserId !== userId) {
      throw new ForbiddenError('Only the recipient can decline a friend request');
    }

    // Only pending requests can be declined
    if (request.status !== 'pending') {
      throw new FriendRequestNotFoundError();
    }

    // Update the request status
    request.status = 'declined';
    this.storage.updateFriendRequest(request);
  }

  /**
   * Remove a friend (bidirectional removal)
   * Requirement 5.5: Remove both users from each other's Friends_List
   * 
   * @param userId - The ID of the user removing the friend
   * @param friendId - The ID of the friend to remove
   * @throws NotFriendsError if the users are not friends
   */
  async removeFriend(userId: string, friendId: string): Promise<void> {
    // Check if they are actually friends
    if (!this.storage.areFriends(userId, friendId)) {
      throw new NotFriendsError();
    }

    // Remove bidirectional friendship
    this.storage.deleteFriendship(userId, friendId);
    this.storage.deleteFriendship(friendId, userId);
  }

  /**
   * Get all friends for a user
   * 
   * @param userId - The ID of the user
   * @returns Array of User objects representing the user's friends
   */
  async getFriends(userId: string): Promise<User[]> {
    const friendIds = this.storage.getFriendIds(userId);
    const friends: User[] = [];

    for (const friendId of friendIds) {
      const friend = this.storage.getUserById(friendId);
      if (friend) {
        friends.push(friend);
      }
    }

    return friends;
  }

  /**
   * Check if two users are friends
   * 
   * @param userId1 - The ID of the first user
   * @param userId2 - The ID of the second user
   * @returns true if the users are friends, false otherwise
   */
  async areFriends(userId1: string, userId2: string): Promise<boolean> {
    return this.storage.areFriends(userId1, userId2);
  }
}
