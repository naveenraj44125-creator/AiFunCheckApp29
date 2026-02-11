"use strict";
/**
 * Friend Service
 * Handles friend requests and friendship management
 * Requirements: 5.1-5.6
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.FriendService = void 0;
const errors_1 = require("../models/errors");
const uuid_1 = require("uuid");
/**
 * Friend Service Implementation
 * Handles friend requests and friendship management
 */
class FriendService {
    constructor(storage) {
        this.storage = storage;
    }
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
    async sendFriendRequest(fromUserId, toUserId) {
        // Requirement 5.6: Reject self-requests
        if (fromUserId === toUserId) {
            throw new errors_1.SelfFriendRequestError();
        }
        // Validate that both users exist
        const fromUser = this.storage.getUserById(fromUserId);
        if (!fromUser) {
            throw new errors_1.UserNotFoundError();
        }
        const toUser = this.storage.getUserById(toUserId);
        if (!toUser) {
            throw new errors_1.UserNotFoundError();
        }
        // Check if users are already friends
        if (this.storage.areFriends(fromUserId, toUserId)) {
            throw new errors_1.DuplicateFriendRequestError();
        }
        // Check for existing pending request in either direction
        const existingRequest = this.storage.getFriendRequestBetweenUsers(fromUserId, toUserId);
        if (existingRequest) {
            throw new errors_1.DuplicateFriendRequestError();
        }
        // Also check for pending request in the reverse direction
        const reverseRequest = this.storage.getFriendRequestBetweenUsers(toUserId, fromUserId);
        if (reverseRequest) {
            throw new errors_1.DuplicateFriendRequestError();
        }
        // Create the friend request
        const friendRequest = {
            id: (0, uuid_1.v4)(),
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
    async acceptFriendRequest(requestId, userId) {
        const request = this.storage.getFriendRequestById(requestId);
        if (!request) {
            throw new errors_1.FriendRequestNotFoundError();
        }
        // Only the recipient can accept the request
        if (request.toUserId !== userId) {
            throw new errors_1.ForbiddenError('Only the recipient can accept a friend request');
        }
        // Only pending requests can be accepted
        if (request.status !== 'pending') {
            throw new errors_1.FriendRequestNotFoundError();
        }
        // Update the request status
        request.status = 'accepted';
        this.storage.updateFriendRequest(request);
        // Create bidirectional friendship
        const now = new Date();
        const friendship1 = {
            userId: request.fromUserId,
            friendId: request.toUserId,
            createdAt: now
        };
        const friendship2 = {
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
    async declineFriendRequest(requestId, userId) {
        const request = this.storage.getFriendRequestById(requestId);
        if (!request) {
            throw new errors_1.FriendRequestNotFoundError();
        }
        // Only the recipient can decline the request
        if (request.toUserId !== userId) {
            throw new errors_1.ForbiddenError('Only the recipient can decline a friend request');
        }
        // Only pending requests can be declined
        if (request.status !== 'pending') {
            throw new errors_1.FriendRequestNotFoundError();
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
    async removeFriend(userId, friendId) {
        // Check if they are actually friends
        if (!this.storage.areFriends(userId, friendId)) {
            throw new errors_1.NotFriendsError();
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
    async getFriends(userId) {
        const friendIds = this.storage.getFriendIds(userId);
        const friends = [];
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
    async areFriends(userId1, userId2) {
        return this.storage.areFriends(userId1, userId2);
    }
}
exports.FriendService = FriendService;
//# sourceMappingURL=FriendService.js.map