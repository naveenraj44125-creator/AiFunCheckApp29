/**
 * Serialization Service for AI Stories Sharing platform
 * Handles JSON serialization and deserialization of Post objects
 * Requirements: 7.4, 7.5 - Data serialization with all metadata and content types
 */
import { Post, PostContent, Visibility } from '../models/types';
/**
 * JSON representation of a Post for serialization
 * Uses ISO string format for dates
 */
export interface SerializedPost {
    id: string;
    authorId: string;
    content: PostContent;
    visibility: Visibility;
    createdAt: string;
    updatedAt: string;
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
export declare function serializePost(post: Post): string;
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
export declare function deserializePost(json: string): Post;
/**
 * Serializes multiple posts to a JSON array string
 *
 * @param posts - Array of Post objects to serialize
 * @returns JSON string representation of the posts array
 */
export declare function serializePosts(posts: Post[]): string;
/**
 * Deserializes a JSON array string back to an array of Post objects
 *
 * @param json - The JSON string to deserialize
 * @returns Array of Post objects with proper Date instances
 * @throws Error if JSON is invalid
 */
export declare function deserializePosts(json: string): Post[];
//# sourceMappingURL=SerializationService.d.ts.map