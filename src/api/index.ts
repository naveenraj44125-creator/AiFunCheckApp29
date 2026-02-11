/**
 * API Routes
 * Express router for all API endpoints
 * Task 12: API Layer Implementation
 */

import { Router, Request, Response, NextFunction } from 'express';
import { AuthenticationService } from '../services/AuthenticationService';
import { createPost, getPost, updatePost, deletePost } from '../services/PostService';
import { FriendService } from '../services/FriendService';
import { storage } from '../storage/InMemoryStorage';
import { AppError, InvalidSessionError, UnauthorizedError, PostNotFoundError } from '../models/errors';
import { getFeed } from '../services/FeedService';
import { User, Visibility, PostContent } from '../models/types';

// Create router
export const apiRouter = Router();

// Create service instances
const authService = new AuthenticationService(storage);
const friendService = new FriendService(storage);

// ============================================
// Health Check Endpoint (No Auth Required)
// ============================================

/**
 * GET /health
 * Health check endpoint for deployment monitoring
 * Returns 200 OK if the service is running
 */
apiRouter.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'ai-stories-sharing'
  });
});

/**
 * Extended Request interface with authenticated user
 */
export interface AuthenticatedRequest extends Request {
  user?: User;
  sessionToken?: string;
}

/**
 * Error handler middleware
 */
function errorHandler(err: Error, req: Request, res: Response, next: NextFunction): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.code,
      message: err.message
    });
  } else {
    console.error('Unexpected error:', err);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred'
    });
  }
}

/**
 * Async handler wrapper to catch errors
 */
function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// ============================================
// Authentication Endpoints (Task 12.1)
// Requirements: 1.1, 1.4, 1.6
// ============================================

/**
 * POST /auth/register
 * Register a new user account
 * Requirements: 1.1 - Create user account with valid details
 * 
 * Request body:
 *   - email: string (required)
 *   - username: string (required)
 *   - password: string (required)
 * 
 * Response:
 *   - 201: User created successfully
 *   - 400: Missing required fields
 *   - 409: Email or username already exists
 */
apiRouter.post('/auth/register', asyncHandler(async (req: Request, res: Response) => {
  const { email, username, password } = req.body;

  // Validate required fields
  if (!email || !username || !password) {
    res.status(400).json({
      error: 'VALIDATION_ERROR',
      message: 'Email, username, and password are required'
    });
    return;
  }

  // Register the user
  const user = await authService.register(email, username, password);

  // Return success response (exclude passwordHash)
  res.status(201).json({
    id: user.id,
    email: user.email,
    username: user.username,
    createdAt: user.createdAt.toISOString()
  });
}));

/**
 * POST /auth/login
 * Login with email and password
 * Requirements: 1.4 - Authenticate with valid credentials
 * 
 * Request body:
 *   - email: string (required)
 *   - password: string (required)
 * 
 * Response:
 *   - 200: Login successful, returns session token
 *   - 400: Missing required fields
 *   - 401: Invalid credentials
 */
apiRouter.post('/auth/login', asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Validate required fields
  if (!email || !password) {
    res.status(400).json({
      error: 'VALIDATION_ERROR',
      message: 'Email and password are required'
    });
    return;
  }

  // Login the user
  const session = await authService.login(email, password);

  // Return session token
  res.status(200).json({
    token: session.token,
    expiresAt: session.expiresAt.toISOString()
  });
}));

/**
 * POST /auth/logout
 * Logout and terminate session
 * Requirements: 1.6 - Terminate session on logout
 * 
 * Request headers:
 *   - Authorization: Bearer <token>
 * 
 * Response:
 *   - 200: Logout successful
 *   - 401: Invalid or missing session token
 */
apiRouter.post('/auth/logout', asyncHandler(async (req: Request, res: Response) => {
  // Get token from Authorization header
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      error: 'UNAUTHORIZED',
      message: 'Authorization token required'
    });
    return;
  }

  const token = authHeader.substring(7); // Remove 'Bearer ' prefix

  // Find session by token and delete it
  const session = storage.getSessionByToken(token);
  
  if (!session) {
    throw new InvalidSessionError();
  }

  await authService.logout(session.id);

  res.status(200).json({
    message: 'Logged out successfully'
  });
}));

// ============================================
// Authentication Middleware
// ============================================

/**
 * Authentication middleware - requires valid session
 * Extracts user from session token and attaches to request
 * Throws UnauthorizedError if not authenticated
 */
const requireAuth = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedError();
  }

  const token = authHeader.substring(7); // Remove 'Bearer ' prefix
  const user = await authService.validateSessionByToken(token);
  
  if (!user) {
    throw new UnauthorizedError();
  }

  req.user = user;
  req.sessionToken = token;
  next();
});

/**
 * Optional authentication middleware
 * Extracts user from session token if present, but doesn't require it
 */
const optionalAuth = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const user = await authService.validateSessionByToken(token);
    
    if (user) {
      req.user = user;
      req.sessionToken = token;
    }
  }
  
  next();
});

// ============================================
// Post Endpoints (Task 12.2)
// Requirements: 2.2, 6.1, 6.3
// ============================================

/**
 * POST /posts
 * Create a new post
 * Requirements: 2.2 - User can create posts with text, image, or video content
 * 
 * Request headers:
 *   - Authorization: Bearer <token> (required)
 * 
 * Request body:
 *   - content: PostContent (required) - { type: 'text'|'image'|'video', text?: string, mediaUrl?: string }
 *   - visibility: 'friends_only'|'public' (optional, defaults to 'friends_only')
 * 
 * Response:
 *   - 201: Post created successfully
 *   - 400: Invalid content or validation error
 *   - 401: Not authenticated
 */
apiRouter.post('/posts', requireAuth, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { content, visibility } = req.body;

  // Validate content is provided
  if (!content) {
    res.status(400).json({
      error: 'VALIDATION_ERROR',
      message: 'Content is required'
    });
    return;
  }

  // Create the post
  const post = await createPost(
    req.user!.id,
    content as PostContent,
    visibility as Visibility | undefined,
    storage
  );

  // Return success response
  res.status(201).json({
    id: post.id,
    authorId: post.authorId,
    content: post.content,
    visibility: post.visibility,
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
    isEdited: post.isEdited
  });
}));

/**
 * GET /posts/:id
 * Get a post by ID
 * Requirements: 3.2, 3.3, 3.4, 3.5 - Visibility rules apply
 * 
 * Request headers:
 *   - Authorization: Bearer <token> (optional)
 * 
 * Response:
 *   - 200: Post retrieved successfully
 *   - 403: Access denied (friends_only post and not a friend)
 *   - 404: Post not found
 */
apiRouter.get('/posts/:id', optionalAuth, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const postId = req.params.id;
  const requesterId = req.user?.id || null;

  // Get the post with visibility check
  const post = await getPost(postId, requesterId, storage);

  if (!post) {
    throw new PostNotFoundError();
  }

  // Return the post
  res.status(200).json({
    id: post.id,
    authorId: post.authorId,
    content: post.content,
    visibility: post.visibility,
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
    isEdited: post.isEdited
  });
}));

/**
 * PUT /posts/:id
 * Update a post
 * Requirements: 6.1 - User can edit their own posts
 * 
 * Request headers:
 *   - Authorization: Bearer <token> (required)
 * 
 * Request body:
 *   - content: PostContent (optional) - { type: 'text'|'image'|'video', text?: string, mediaUrl?: string }
 *   - visibility: 'friends_only'|'public' (optional)
 * 
 * Response:
 *   - 200: Post updated successfully
 *   - 400: Invalid content or validation error
 *   - 401: Not authenticated
 *   - 403: Not the post owner
 *   - 404: Post not found
 */
apiRouter.put('/posts/:id', requireAuth, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const postId = req.params.id;
  const { content, visibility } = req.body;

  // Update the post
  const post = await updatePost(
    postId,
    req.user!.id,
    { content, visibility },
    storage
  );

  // Return the updated post
  res.status(200).json({
    id: post.id,
    authorId: post.authorId,
    content: post.content,
    visibility: post.visibility,
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
    isEdited: post.isEdited
  });
}));

/**
 * DELETE /posts/:id
 * Delete a post
 * Requirements: 6.3 - User can delete their own posts
 * 
 * Request headers:
 *   - Authorization: Bearer <token> (required)
 * 
 * Response:
 *   - 204: Post deleted successfully
 *   - 401: Not authenticated
 *   - 403: Not the post owner
 *   - 404: Post not found
 */
apiRouter.delete('/posts/:id', requireAuth, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const postId = req.params.id;

  // Delete the post
  await deletePost(postId, req.user!.id, storage);

  // Return no content
  res.status(204).send();
}));

// ============================================
// Friend Endpoints (Task 12.3)
// Requirements: 5.1, 5.3, 5.4, 5.5
// ============================================

/**
 * POST /friends/request
 * Send a friend request to another user
 * Requirements: 5.1 - User can send friend request to another user
 * 
 * Request headers:
 *   - Authorization: Bearer <token> (required)
 * 
 * Request body:
 *   - targetUserId: string (required) - The ID of the user to send the request to
 * 
 * Response:
 *   - 201: Friend request created successfully
 *   - 400: Missing targetUserId or self-request
 *   - 401: Not authenticated
 *   - 404: Target user not found
 *   - 409: Friend request already exists or already friends
 */
apiRouter.post('/friends/request', requireAuth, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { targetUserId } = req.body;

  // Validate required fields
  if (!targetUserId) {
    res.status(400).json({
      error: 'VALIDATION_ERROR',
      message: 'targetUserId is required'
    });
    return;
  }

  // Send the friend request
  const friendRequest = await friendService.sendFriendRequest(req.user!.id, targetUserId);

  // Return success response
  res.status(201).json({
    id: friendRequest.id,
    fromUserId: friendRequest.fromUserId,
    toUserId: friendRequest.toUserId,
    status: friendRequest.status,
    createdAt: friendRequest.createdAt.toISOString()
  });
}));

/**
 * POST /friends/accept/:requestId
 * Accept a friend request
 * Requirements: 5.3 - User can accept friend request
 * 
 * Request headers:
 *   - Authorization: Bearer <token> (required)
 * 
 * Response:
 *   - 200: Friend request accepted successfully
 *   - 401: Not authenticated
 *   - 403: Not the recipient of the request
 *   - 404: Friend request not found
 */
apiRouter.post('/friends/accept/:requestId', requireAuth, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { requestId } = req.params;

  // Accept the friend request
  await friendService.acceptFriendRequest(requestId, req.user!.id);

  // Return success response
  res.status(200).json({
    message: 'Friend request accepted'
  });
}));

/**
 * POST /friends/decline/:requestId
 * Decline a friend request
 * Requirements: 5.4 - User can decline friend request
 * 
 * Request headers:
 *   - Authorization: Bearer <token> (required)
 * 
 * Response:
 *   - 200: Friend request declined successfully
 *   - 401: Not authenticated
 *   - 403: Not the recipient of the request
 *   - 404: Friend request not found
 */
apiRouter.post('/friends/decline/:requestId', requireAuth, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { requestId } = req.params;

  // Decline the friend request
  await friendService.declineFriendRequest(requestId, req.user!.id);

  // Return success response
  res.status(200).json({
    message: 'Friend request declined'
  });
}));

/**
 * DELETE /friends/:friendId
 * Remove a friend
 * Requirements: 5.5 - User can remove existing friend
 * 
 * Request headers:
 *   - Authorization: Bearer <token> (required)
 * 
 * Response:
 *   - 204: Friend removed successfully
 *   - 400: Users are not friends
 *   - 401: Not authenticated
 */
apiRouter.delete('/friends/:friendId', requireAuth, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { friendId } = req.params;

  // Remove the friend
  await friendService.removeFriend(req.user!.id, friendId);

  // Return no content
  res.status(204).send();
}));

/**
 * GET /friends
 * Get the current user's friends list
 * 
 * Request headers:
 *   - Authorization: Bearer <token> (required)
 * 
 * Response:
 *   - 200: Friends list retrieved successfully
 *   - 401: Not authenticated
 */
apiRouter.get('/friends', requireAuth, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  // Get the user's friends
  const friends = await friendService.getFriends(req.user!.id);

  // Return friends list (exclude passwordHash)
  res.status(200).json({
    friends: friends.map(friend => ({
      id: friend.id,
      email: friend.email,
      username: friend.username,
      createdAt: friend.createdAt.toISOString()
    }))
  });
}));

// ============================================
// Feed Endpoints (Task 12.4)
// Requirements: 4.1
// ============================================

/**
 * GET /feed
 * Get the user's feed of posts based on visibility rules
 * Requirements: 4.1 - User can view feed of posts based on visibility rules
 * 
 * Request headers:
 *   - Authorization: Bearer <token> (optional)
 * 
 * Query parameters:
 *   - limit: number (optional, default 20) - Maximum number of posts to return
 *   - offset: number (optional, default 0) - Number of posts to skip for pagination
 * 
 * Response:
 *   - 200: Feed retrieved successfully
 *     - posts: Array of posts visible to the user
 *     - hasMore: Boolean indicating if more posts are available
 *     - total: Total number of posts matching visibility criteria
 * 
 * Visibility Rules:
 *   - Requirement 4.2: Shows public posts from all users
 *   - Requirement 4.3: Shows friends_only posts only from friends
 *   - Requirement 4.4: Orders posts by creation date (newest first)
 *   - Requirement 4.5: For unauthenticated users, shows only public posts
 *   - Requirement 4.6: Returns empty array if no posts match criteria
 */
apiRouter.get('/feed', optionalAuth, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  // Parse pagination parameters with defaults
  const limit = parseInt(req.query.limit as string) || 20;
  const offset = parseInt(req.query.offset as string) || 0;

  // Get the user ID (null for unauthenticated users)
  const userId = req.user?.id || null;

  // Get the feed
  const feedResult = await getFeed(userId, { limit, offset }, storage);

  // Return the feed with posts serialized
  res.status(200).json({
    posts: feedResult.posts.map(post => ({
      id: post.id,
      authorId: post.authorId,
      content: post.content,
      visibility: post.visibility,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
      isEdited: post.isEdited
    })),
    hasMore: feedResult.hasMore,
    total: feedResult.total
  });
}));

// Apply error handler
apiRouter.use(errorHandler);

export { errorHandler, asyncHandler, requireAuth, optionalAuth };
