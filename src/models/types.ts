/**
 * Core type definitions for AI Stories Sharing platform
 * Requirements: 7.4, 7.5 - Data serialization and persistence
 */

/**
 * Content type enum for posts
 * Supports text, image, and video content
 */
export type ContentType = 'text' | 'image' | 'video';

/**
 * Visibility setting for posts
 * Controls who can see the post
 */
export type Visibility = 'friends_only' | 'public';

/**
 * Status of a friend request
 */
export type FriendRequestStatus = 'pending' | 'accepted' | 'declined';

/**
 * User interface representing a registered user
 */
export interface User {
  id: string;
  email: string;
  username: string;
  passwordHash: string;
  createdAt: Date;
}

/**
 * Session interface for authenticated user sessions
 */
export interface Session {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
}

/**
 * Content structure for posts
 * Can contain text, image URL, or video URL
 */
export interface PostContent {
  type: ContentType;
  text?: string;
  mediaUrl?: string;
}

/**
 * Post interface representing user-created content
 */
export interface Post {
  id: string;
  authorId: string;
  content: PostContent;
  visibility: Visibility;
  createdAt: Date;
  updatedAt: Date;
  isEdited: boolean;
}

/**
 * Update payload for editing posts
 */
export interface PostUpdate {
  content?: PostContent;
  visibility?: Visibility;
}

/**
 * Friend request interface
 */
export interface FriendRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  status: FriendRequestStatus;
  createdAt: Date;
}

/**
 * Friendship interface representing a bidirectional friendship
 */
export interface Friendship {
  userId: string;
  friendId: string;
  createdAt: Date;
}

/**
 * Validation result for content validation
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Pagination parameters for feed requests
 */
export interface Pagination {
  limit: number;
  offset: number;
}

/**
 * Feed result containing posts and pagination info
 */
export interface FeedResult {
  posts: Post[];
  hasMore: boolean;
  total: number;
}

/**
 * Media file metadata
 */
export interface MediaFile {
  id: string;
  userId: string;
  postId: string;
  filename: string;
  mimeType: string;
  size: number;
  path: string;
  createdAt: Date;
}
