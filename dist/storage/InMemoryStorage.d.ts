/**
 * In-memory storage for local testing without a database
 * Implements simple CRUD operations for all entities
 */
import { User, Post, Session, FriendRequest, Friendship, MediaFile } from '../models/types';
/**
 * In-memory storage class that holds all application data
 * Used for testing and development without a real database
 */
export declare class InMemoryStorage {
    private users;
    private usersByEmail;
    private usersByUsername;
    private posts;
    private postsByAuthor;
    private sessions;
    private sessionsByToken;
    private sessionsByUser;
    private friendRequests;
    private friendships;
    private friendsByUser;
    private mediaFiles;
    createUser(user: User): void;
    getUserById(id: string): User | undefined;
    getUserByEmail(email: string): User | undefined;
    getUserByUsername(username: string): User | undefined;
    getAllUsers(): User[];
    createPost(post: Post): void;
    getPostById(id: string): Post | undefined;
    getPostsByAuthor(authorId: string): Post[];
    getAllPosts(): Post[];
    updatePost(post: Post): void;
    deletePost(id: string): boolean;
    createSession(session: Session): void;
    getSessionById(id: string): Session | undefined;
    getSessionByToken(token: string): Session | undefined;
    deleteSession(id: string): boolean;
    deleteSessionByToken(token: string): boolean;
    createFriendRequest(request: FriendRequest): void;
    getFriendRequestById(id: string): FriendRequest | undefined;
    getFriendRequestBetweenUsers(fromUserId: string, toUserId: string): FriendRequest | undefined;
    getPendingFriendRequestsForUser(userId: string): FriendRequest[];
    updateFriendRequest(request: FriendRequest): void;
    deleteFriendRequest(id: string): boolean;
    createFriendship(friendship: Friendship): void;
    getFriendship(userId: string, friendId: string): Friendship | undefined;
    areFriends(userId1: string, userId2: string): boolean;
    getFriendIds(userId: string): string[];
    deleteFriendship(userId: string, friendId: string): boolean;
    createMediaFile(file: MediaFile): void;
    getMediaFileById(id: string): MediaFile | undefined;
    deleteMediaFile(id: string): boolean;
    clear(): void;
}
export declare const storage: InMemoryStorage;
//# sourceMappingURL=InMemoryStorage.d.ts.map