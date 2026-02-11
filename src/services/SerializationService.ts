/**
 * Serialization Service for AI Stories Sharing platform
 * Handles JSON serialization and deserialization of Post objects
 * Requirements: 7.4, 7.5 - Data serialization with all metadata and content types
 */

import { Post, PostContent, ContentType, Visibility } from '../models/types';

/**
 * JSON representation of a Post for serialization
 * Uses ISO string format for dates
 */
export interface SerializedPost {
  id: string;
  authorId: string;
  content: PostContent;
  visibility: Visibility;
  createdAt: string; // ISO 8601 format
  updatedAt: string; // ISO 8601 format
  isEdited: boolean;
}

/**
 * Serializes a Post object to a JSON string
 * Converts Date objects to ISO 8601 strings for proper JSON representation
 * 
 * @param post - The Post object to serialize
 * @returns JSON string representation of the post
 * 
 * Requirements: 7.4 - Posts stored with all metadata (author, timestamp, visibility, content type)
 * Requirements: 7.5 - Support for text, image, and video content types
 */
export function serializePost(post: Post): string {
  const serialized: SerializedPost = {
    id: post.id,
    authorId: post.authorId,
    content: {
      type: post.content.type,
      ...(post.content.text !== undefined && { text: post.content.text }),
      ...(post.content.mediaUrl !== undefined && { mediaUrl: post.content.mediaUrl }),
    },
    visibility: post.visibility,
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
    isEdited: post.isEdited,
  };

  return JSON.stringify(serialized);
}

/**
 * Deserializes a JSON string back to a Post object
 * Converts ISO 8601 date strings back to Date objects
 * 
 * @param json - The JSON string to deserialize
 * @returns Post object with proper Date instances
 * @throws Error if JSON is invalid or missing required fields
 * 
 * Requirements: 7.4 - Posts stored with all metadata (author, timestamp, visibility, content type)
 * Requirements: 7.5 - Support for text, image, and video content types
 */
export function deserializePost(json: string): Post {
  const parsed = JSON.parse(json) as SerializedPost;

  // Validate required fields
  if (!parsed.id || typeof parsed.id !== 'string') {
    throw new Error('Invalid post: missing or invalid id');
  }
  if (!parsed.authorId || typeof parsed.authorId !== 'string') {
    throw new Error('Invalid post: missing or invalid authorId');
  }
  if (!parsed.content || typeof parsed.content !== 'object') {
    throw new Error('Invalid post: missing or invalid content');
  }
  if (!isValidContentType(parsed.content.type)) {
    throw new Error('Invalid post: invalid content type');
  }
  if (!isValidVisibility(parsed.visibility)) {
    throw new Error('Invalid post: invalid visibility');
  }
  if (!parsed.createdAt || typeof parsed.createdAt !== 'string') {
    throw new Error('Invalid post: missing or invalid createdAt');
  }
  if (!parsed.updatedAt || typeof parsed.updatedAt !== 'string') {
    throw new Error('Invalid post: missing or invalid updatedAt');
  }
  if (typeof parsed.isEdited !== 'boolean') {
    throw new Error('Invalid post: missing or invalid isEdited');
  }

  // Validate date strings are valid ISO format
  const createdAt = new Date(parsed.createdAt);
  const updatedAt = new Date(parsed.updatedAt);
  
  if (isNaN(createdAt.getTime())) {
    throw new Error('Invalid post: createdAt is not a valid date');
  }
  if (isNaN(updatedAt.getTime())) {
    throw new Error('Invalid post: updatedAt is not a valid date');
  }

  const post: Post = {
    id: parsed.id,
    authorId: parsed.authorId,
    content: {
      type: parsed.content.type,
      ...(parsed.content.text !== undefined && { text: parsed.content.text }),
      ...(parsed.content.mediaUrl !== undefined && { mediaUrl: parsed.content.mediaUrl }),
    },
    visibility: parsed.visibility,
    createdAt,
    updatedAt,
    isEdited: parsed.isEdited,
  };

  return post;
}

/**
 * Type guard to check if a value is a valid ContentType
 */
function isValidContentType(type: unknown): type is ContentType {
  return type === 'text' || type === 'image' || type === 'video';
}

/**
 * Type guard to check if a value is a valid Visibility
 */
function isValidVisibility(visibility: unknown): visibility is Visibility {
  return visibility === 'friends_only' || visibility === 'public';
}

/**
 * Serializes multiple posts to a JSON array string
 * 
 * @param posts - Array of Post objects to serialize
 * @returns JSON string representation of the posts array
 */
export function serializePosts(posts: Post[]): string {
  const serialized = posts.map(post => ({
    id: post.id,
    authorId: post.authorId,
    content: {
      type: post.content.type,
      ...(post.content.text !== undefined && { text: post.content.text }),
      ...(post.content.mediaUrl !== undefined && { mediaUrl: post.content.mediaUrl }),
    },
    visibility: post.visibility,
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
    isEdited: post.isEdited,
  }));

  return JSON.stringify(serialized);
}

/**
 * Deserializes a JSON array string back to an array of Post objects
 * 
 * @param json - The JSON string to deserialize
 * @returns Array of Post objects with proper Date instances
 * @throws Error if JSON is invalid
 */
export function deserializePosts(json: string): Post[] {
  const parsed = JSON.parse(json) as SerializedPost[];
  
  if (!Array.isArray(parsed)) {
    throw new Error('Invalid posts: expected an array');
  }

  return parsed.map((item, index) => {
    try {
      return deserializePost(JSON.stringify(item));
    } catch (error) {
      throw new Error(`Invalid post at index ${index}: ${(error as Error).message}`);
    }
  });
}
