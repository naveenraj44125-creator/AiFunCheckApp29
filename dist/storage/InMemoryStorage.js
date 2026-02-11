"use strict";
/**
 * In-memory storage for local testing without a database
 * Implements simple CRUD operations for all entities
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.storage = exports.InMemoryStorage = void 0;
/**
 * In-memory storage class that holds all application data
 * Used for testing and development without a real database
 */
class InMemoryStorage {
    constructor() {
        this.users = new Map();
        this.usersByEmail = new Map(); // email -> userId
        this.usersByUsername = new Map(); // username -> userId
        this.posts = new Map();
        this.postsByAuthor = new Map(); // authorId -> Set<postId>
        this.sessions = new Map();
        this.sessionsByToken = new Map(); // token -> sessionId
        this.sessionsByUser = new Map(); // userId -> Set<sessionId>
        this.friendRequests = new Map();
        this.friendships = new Map(); // composite key: `${userId}:${friendId}`
        this.friendsByUser = new Map(); // userId -> Set<friendId>
        this.mediaFiles = new Map();
    }
    // User operations
    createUser(user) {
        this.users.set(user.id, user);
        this.usersByEmail.set(user.email.toLowerCase(), user.id);
        this.usersByUsername.set(user.username.toLowerCase(), user.id);
    }
    getUserById(id) {
        return this.users.get(id);
    }
    getUserByEmail(email) {
        const userId = this.usersByEmail.get(email.toLowerCase());
        return userId ? this.users.get(userId) : undefined;
    }
    getUserByUsername(username) {
        const userId = this.usersByUsername.get(username.toLowerCase());
        return userId ? this.users.get(userId) : undefined;
    }
    getAllUsers() {
        return Array.from(this.users.values());
    }
    // Post operations
    createPost(post) {
        this.posts.set(post.id, post);
        if (!this.postsByAuthor.has(post.authorId)) {
            this.postsByAuthor.set(post.authorId, new Set());
        }
        this.postsByAuthor.get(post.authorId).add(post.id);
    }
    getPostById(id) {
        return this.posts.get(id);
    }
    getPostsByAuthor(authorId) {
        const postIds = this.postsByAuthor.get(authorId);
        if (!postIds)
            return [];
        return Array.from(postIds)
            .map(id => this.posts.get(id))
            .filter((post) => post !== undefined);
    }
    getAllPosts() {
        return Array.from(this.posts.values());
    }
    updatePost(post) {
        this.posts.set(post.id, post);
    }
    deletePost(id) {
        const post = this.posts.get(id);
        if (!post)
            return false;
        this.posts.delete(id);
        this.postsByAuthor.get(post.authorId)?.delete(id);
        return true;
    }
    // Session operations
    createSession(session) {
        this.sessions.set(session.id, session);
        this.sessionsByToken.set(session.token, session.id);
        if (!this.sessionsByUser.has(session.userId)) {
            this.sessionsByUser.set(session.userId, new Set());
        }
        this.sessionsByUser.get(session.userId).add(session.id);
    }
    getSessionById(id) {
        return this.sessions.get(id);
    }
    getSessionByToken(token) {
        const sessionId = this.sessionsByToken.get(token);
        return sessionId ? this.sessions.get(sessionId) : undefined;
    }
    deleteSession(id) {
        const session = this.sessions.get(id);
        if (!session)
            return false;
        this.sessions.delete(id);
        this.sessionsByToken.delete(session.token);
        this.sessionsByUser.get(session.userId)?.delete(id);
        return true;
    }
    deleteSessionByToken(token) {
        const sessionId = this.sessionsByToken.get(token);
        if (!sessionId)
            return false;
        return this.deleteSession(sessionId);
    }
    // Friend request operations
    createFriendRequest(request) {
        this.friendRequests.set(request.id, request);
    }
    getFriendRequestById(id) {
        return this.friendRequests.get(id);
    }
    getFriendRequestBetweenUsers(fromUserId, toUserId) {
        return Array.from(this.friendRequests.values()).find(req => req.fromUserId === fromUserId && req.toUserId === toUserId && req.status === 'pending');
    }
    getPendingFriendRequestsForUser(userId) {
        return Array.from(this.friendRequests.values()).filter(req => req.toUserId === userId && req.status === 'pending');
    }
    updateFriendRequest(request) {
        this.friendRequests.set(request.id, request);
    }
    deleteFriendRequest(id) {
        return this.friendRequests.delete(id);
    }
    // Friendship operations
    createFriendship(friendship) {
        const key = `${friendship.userId}:${friendship.friendId}`;
        this.friendships.set(key, friendship);
        if (!this.friendsByUser.has(friendship.userId)) {
            this.friendsByUser.set(friendship.userId, new Set());
        }
        this.friendsByUser.get(friendship.userId).add(friendship.friendId);
    }
    getFriendship(userId, friendId) {
        const key = `${userId}:${friendId}`;
        return this.friendships.get(key);
    }
    areFriends(userId1, userId2) {
        return this.friendsByUser.get(userId1)?.has(userId2) ?? false;
    }
    getFriendIds(userId) {
        return Array.from(this.friendsByUser.get(userId) ?? []);
    }
    deleteFriendship(userId, friendId) {
        const key = `${userId}:${friendId}`;
        const deleted = this.friendships.delete(key);
        this.friendsByUser.get(userId)?.delete(friendId);
        return deleted;
    }
    // Media file operations
    createMediaFile(file) {
        this.mediaFiles.set(file.id, file);
    }
    getMediaFileById(id) {
        return this.mediaFiles.get(id);
    }
    deleteMediaFile(id) {
        return this.mediaFiles.delete(id);
    }
    // Utility methods
    clear() {
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
exports.InMemoryStorage = InMemoryStorage;
// Singleton instance for the application
exports.storage = new InMemoryStorage();
//# sourceMappingURL=InMemoryStorage.js.map