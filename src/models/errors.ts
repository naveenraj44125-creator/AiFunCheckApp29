/**
 * Error types for AI Stories Sharing platform
 * Based on the error handling specification in the design document
 */

/**
 * Base application error class
 */
export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number
  ) {
    super(message);
    this.name = 'AppError';
  }
}

// Authentication Errors
export class DuplicateEmailError extends AppError {
  constructor() {
    super('DUPLICATE_EMAIL', 'Email already registered', 409);
    this.name = 'DuplicateEmailError';
  }
}

export class DuplicateUsernameError extends AppError {
  constructor() {
    super('DUPLICATE_USERNAME', 'Username already taken', 409);
    this.name = 'DuplicateUsernameError';
  }
}

export class InvalidCredentialsError extends AppError {
  constructor() {
    super('INVALID_CREDENTIALS', 'Invalid email or password', 401);
    this.name = 'InvalidCredentialsError';
  }
}

export class SessionExpiredError extends AppError {
  constructor() {
    super('SESSION_EXPIRED', 'Session has expired', 401);
    this.name = 'SessionExpiredError';
  }
}

export class InvalidSessionError extends AppError {
  constructor() {
    super('INVALID_SESSION', 'Invalid session token', 401);
    this.name = 'InvalidSessionError';
  }
}

// Post Errors
export class UnauthorizedError extends AppError {
  constructor() {
    super('UNAUTHORIZED', 'Authentication required', 401);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Access denied') {
    super('FORBIDDEN', message, 403);
    this.name = 'ForbiddenError';
  }
}

export class EmptyContentError extends AppError {
  constructor() {
    super('EMPTY_CONTENT', 'Content cannot be empty', 400);
    this.name = 'EmptyContentError';
  }
}

export class InvalidFormatError extends AppError {
  constructor(message: string = 'Unsupported file format') {
    super('INVALID_FORMAT', message, 400);
    this.name = 'InvalidFormatError';
  }
}

export class FileTooLargeError extends AppError {
  constructor(maxSize: string) {
    super('FILE_TOO_LARGE', `File exceeds maximum size of ${maxSize}`, 413);
    this.name = 'FileTooLargeError';
  }
}

export class PostNotFoundError extends AppError {
  constructor() {
    super('POST_NOT_FOUND', 'Post not found', 404);
    this.name = 'PostNotFoundError';
  }
}

export class AccessDeniedError extends AppError {
  constructor() {
    super('ACCESS_DENIED', 'You do not have access to this post', 403);
    this.name = 'AccessDeniedError';
  }
}

// Friend Errors
export class SelfFriendRequestError extends AppError {
  constructor() {
    super('SELF_FRIEND_REQUEST', 'Cannot send friend request to yourself', 400);
    this.name = 'SelfFriendRequestError';
  }
}

export class DuplicateFriendRequestError extends AppError {
  constructor() {
    super('DUPLICATE_REQUEST', 'Friend request already exists', 409);
    this.name = 'DuplicateFriendRequestError';
  }
}

export class FriendRequestNotFoundError extends AppError {
  constructor() {
    super('REQUEST_NOT_FOUND', 'Friend request not found', 404);
    this.name = 'FriendRequestNotFoundError';
  }
}

export class NotFriendsError extends AppError {
  constructor() {
    super('NOT_FRIENDS', 'Users are not friends', 400);
    this.name = 'NotFriendsError';
  }
}

export class UserNotFoundError extends AppError {
  constructor() {
    super('USER_NOT_FOUND', 'User not found', 404);
    this.name = 'UserNotFoundError';
  }
}
