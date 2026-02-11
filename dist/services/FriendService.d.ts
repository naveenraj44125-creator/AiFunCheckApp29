/**
 * Friend Service
 * Handles friend requests and friendship management
 * Requirements: 5.1-5.6
 */
import { User, FriendRequest } from '../models/types';
import { InMemoryStorage } from '../storage/InMemoryStorage';
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
export declare class FriendService implements IFriendService {
    private storage;
    constructor(storage: InMemoryStorage);
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
    sendFriendRequest(fromUserId: string, toUserId: string): Promise<FriendRequest>;
    /**
     * Accept a friend request
     * Requirement 5.3: Add both users to each other's Friends_List
     *
     * @param requestId - The ID of the friend request to accept
     * @param userId - The ID of the user accepting the request (must be the recipient)
     * @throws FriendRequestNotFoundError if the request doesn't exist
     * @throws ForbiddenError if the user is not the recipient of the request
     */
    acceptFriendRequest(requestId: string, userId: string): Promise<void>;
    /**
     * Decline a friend request
     * Requirement 5.4: Remove pending request without adding to Friends_List
     *
     * @param requestId - The ID of the friend request to decline
     * @param userId - The ID of the user declining the request (must be the recipient)
     * @throws FriendRequestNotFoundError if the request doesn't exist
     * @throws ForbiddenError if the user is not the recipient of the request
     */
    declineFriendRequest(requestId: string, userId: string): Promise<void>;
    /**
     * Remove a friend (bidirectional removal)
     * Requirement 5.5: Remove both users from each other's Friends_List
     *
     * @param userId - The ID of the user removing the friend
     * @param friendId - The ID of the friend to remove
     * @throws NotFriendsError if the users are not friends
     */
    removeFriend(userId: string, friendId: string): Promise<void>;
    /**
     * Get all friends for a user
     *
     * @param userId - The ID of the user
     * @returns Array of User objects representing the user's friends
     */
    getFriends(userId: string): Promise<User[]>;
    /**
     * Check if two users are friends
     *
     * @param userId1 - The ID of the first user
     * @param userId2 - The ID of the second user
     * @returns true if the users are friends, false otherwise
     */
    areFriends(userId1: string, userId2: string): Promise<boolean>;
}
//# sourceMappingURL=FriendService.d.ts.map