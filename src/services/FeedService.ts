/**
 * Feed Service
 * Handles feed generation and post visibility
 * Requirements: 4.1-4.6
 */

import { Post, Pagination, FeedResult } from '../models/types';
import { InMemoryStorage, storage } from '../storage/InMemoryStorage';
import { canViewPost } from './PostService';

/**
 * Feed Service Interface
 */
export interface IFeedService {
  getFeed(userId: string | null, pagination: Pagination): Promise<FeedResult>;
}

/**
 * Gets the feed for a user based on visibility rules
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6
 * 
 * @param userId - The ID of the authenticated user (null for unauthenticated users)
 * @param pagination - Pagination parameters (limit and offset)
 * @param storageInstance - Optional storage instance for dependency injection (defaults to singleton)
 * @returns FeedResult containing posts, hasMore flag, and total count
 * 
 * Visibility Rules:
 * - Requirement 4.1: Returns posts based on visibility rules for authenticated users
 * - Requirement 4.2: Shows public posts from all users
 * - Requirement 4.3: Shows friends_only posts only from users in viewer's friends list
 * - Requirement 4.4: Orders posts by creation date in descending order (newest first)
 * - Requirement 4.5: For unauthenticated users (null userId), shows only public posts
 * - Requirement 4.6: Returns empty array if no posts match criteria
 */
export async function getFeed(
  userId: string | null,
  pagination: Pagination,
  storageInstance: InMemoryStorage = storage
): Promise<FeedResult> {
  // Get all posts from storage
  const allPosts = storageInstance.getAllPosts();

  // Filter posts based on visibility rules
  // Requirement 4.1: Apply visibility rules
  // Requirement 4.2: Show public posts from all users
  // Requirement 4.3: Show friends_only posts only from users in viewer's friends list
  // Requirement 4.5: For unauthenticated users, show only public posts
  const visiblePosts = allPosts.filter(post => 
    canViewPost(post, userId, storageInstance)
  );

  // Requirement 4.4: Sort posts by creation date in descending order (newest first)
  const sortedPosts = visiblePosts.sort((a, b) => 
    b.createdAt.getTime() - a.createdAt.getTime()
  );

  // Get total count before pagination
  const total = sortedPosts.length;

  // Apply pagination
  const { limit, offset } = pagination;
  const paginatedPosts = sortedPosts.slice(offset, offset + limit);

  // Calculate if there are more posts
  const hasMore = offset + paginatedPosts.length < total;

  // Requirement 4.6: Returns empty array if no posts match criteria
  // (This is handled naturally by the filter - if no posts match, paginatedPosts will be empty)

  return {
    posts: paginatedPosts,
    hasMore,
    total,
  };
}
