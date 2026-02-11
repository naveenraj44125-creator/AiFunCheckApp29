/**
 * In-memory storage for local testing without a database
 * Implements simple CRUD operations for all entities
 */

import {
  User,
  Post,
  Session,
  FriendRequest,
  Friendship,
  MediaFile
} from '../models/types';

/**
 * In-memory storage class that holds all application data
 * Used for testing and development without a real database
 */
export class InMemoryStorage {
  private users: Map<string, User> = new Map();
  private usersByEmail: Map<string, string> = new Map(); // email -> userId
  private usersByUsername: Map<string, string> = new Map(); // username -> userId
  
  private posts: Map<string, Post> = new Map();
  private postsByAuthor: Map<string, Set<string>> = new Map(); // authorId -> Set<postId>
  
  private sessions: Map<string, Session> = new Map();
  private sessionsByToken: Map<string, string> = new Map(); // token -> sessionId
  private sessionsByUser: Map<string, Set<string>> = new Map(); // userId -> Set<sessionId>
  
  private friendRequests: Map<string, FriendRequest> = new Map();
  private friendships: Map<string, Friendship> = new Map(); // composite key: `${userId}:${friendId}`
  private friendsByUser: Map<string, Set<string>> = new Map(); // userId -> Set<friendId>
  
  private mediaFiles: Map<string, MediaFile> = new Map();

  // User operations
  createUser(user: User): void {
    this.users.set(user.id, user);
    this.usersByEmail.set(user.email.toLowerCase(), user.id);
    this.usersByUsername.set(user.username.toLowerCase(), user.id);
  }

  getUserById(id: string): User | undefined {
    return this.users.get(id);
  }

  getUserByEmail(email: string): User | undefined {
    const userId = this.usersByEmail.get(email.toLowerCase());
    return userId ? this.users.get(userId) : undefined;
  }

  getUserByUsername(username: string): User | undefined {
    const userId = this.usersByUsername.get(username.toLowerCase());
    return userId ? this.users.get(userId) : undefined;
  }

  getAllUsers(): User[] {
    return Array.from(this.users.values());
  }

  // Post operations
  createPost(post: Post): void {
    this.posts.set(post.id, post);
    
    if (!this.postsByAuthor.has(post.authorId)) {
      this.postsByAuthor.set(post.authorId, new Set());
    }
    this.postsByAuthor.get(post.authorId)!.add(post.id);
  }

  getPostById(id: string): Post | undefined {
    return this.posts.get(id);
  }

  getPostsByAuthor(authorId: string): Post[] {
    const postIds = this.postsByAuthor.get(authorId);
    if (!postIds) return [];
    return Array.from(postIds)
      .map(id => this.posts.get(id))
      .filter((post): post is Post => post !== undefined);
  }

  getAllPosts(): Post[] {
    return Array.from(this.posts.values());
  }

  updatePost(post: Post): void {
    this.posts.set(post.id, post);
  }

  deletePost(id: string): boolean {
    const post = this.posts.get(id);
    if (!post) return false;
    
    this.posts.delete(id);
    this.postsByAuthor.get(post.authorId)?.delete(id);
    return true;
  }

  // Session operations
  createSession(session: Session): void {
    this.sessions.set(session.id, session);
    this.sessionsByToken.set(session.token, session.id);
    
    if (!this.sessionsByUser.has(session.userId)) {
      this.sessionsByUser.set(session.userId, new Set());
    }
    this.sessionsByUser.get(session.userId)!.add(session.id);
  }

  getSessionById(id: string): Session | undefined {
    return this.sessions.get(id);
  }

  getSessionByToken(token: string): Session | undefined {
    const sessionId = this.sessionsByToken.get(token);
    return sessionId ? this.sessions.get(sessionId) : undefined;
  }

  deleteSession(id: string): boolean {
    const session = this.sessions.get(id);
    if (!session) return false;
    
    this.sessions.delete(id);
    this.sessionsByToken.delete(session.token);
    this.sessionsByUser.get(session.userId)?.delete(id);
    return true;
  }

  deleteSessionByToken(token: string): boolean {
    const sessionId = this.sessionsByToken.get(token);
    if (!sessionId) return false;
    return this.deleteSession(sessionId);
  }

  // Friend request operations
  createFriendRequest(request: FriendRequest): void {
    this.friendRequests.set(request.id, request);
  }

  getFriendRequestById(id: string): FriendRequest | undefined {
    return this.friendRequests.get(id);
  }

  getFriendRequestBetweenUsers(fromUserId: string, toUserId: string): FriendRequest | undefined {
    return Array.from(this.friendRequests.values()).find(
      req => req.fromUserId === fromUserId && req.toUserId === toUserId && req.status === 'pending'
    );
  }

  getPendingFriendRequestsForUser(userId: string): FriendRequest[] {
    return Array.from(this.friendRequests.values()).filter(
      req => req.toUserId === userId && req.status === 'pending'
    );
  }

  updateFriendRequest(request: FriendRequest): void {
    this.friendRequests.set(request.id, request);
  }

  deleteFriendRequest(id: string): boolean {
    return this.friendRequests.delete(id);
  }

  // Friendship operations
  createFriendship(friendship: Friendship): void {
    const key = `${friendship.userId}:${friendship.friendId}`;
    this.friendships.set(key, friendship);
    
    if (!this.friendsByUser.has(friendship.userId)) {
      this.friendsByUser.set(friendship.userId, new Set());
    }
    this.friendsByUser.get(friendship.userId)!.add(friendship.friendId);
  }

  getFriendship(userId: string, friendId: string): Friendship | undefined {
    const key = `${userId}:${friendId}`;
    return this.friendships.get(key);
  }

  areFriends(userId1: string, userId2: string): boolean {
    return this.friendsByUser.get(userId1)?.has(userId2) ?? false;
  }

  getFriendIds(userId: string): string[] {
    return Array.from(this.friendsByUser.get(userId) ?? []);
  }

  deleteFriendship(userId: string, friendId: string): boolean {
    const key = `${userId}:${friendId}`;
    const deleted = this.friendships.delete(key);
    this.friendsByUser.get(userId)?.delete(friendId);
    return deleted;
  }

  // Media file operations
  createMediaFile(file: MediaFile): void {
    this.mediaFiles.set(file.id, file);
  }

  getMediaFileById(id: string): MediaFile | undefined {
    return this.mediaFiles.get(id);
  }

  deleteMediaFile(id: string): boolean {
    return this.mediaFiles.delete(id);
  }

  // Utility methods
  clear(): void {
    this.users.clear();
    this.usersByEmail.clear();
    this.usersByUsername.clear();
    this.posts.clear();
    this.postsByAuthor.clear();
    this.sessions.clear();
    this.sessionsByToken.clear();
    this.sessionsByUser.clear();
    this.friendRequests.clear();
    this.friendships.clear();
    this.friendsByUser.clear();
    this.mediaFiles.clear();
  }
}

// Singleton instance for the application
export const storage = new InMemoryStorage();
