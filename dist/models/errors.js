"use strict";
/**
 * Error types for AI Stories Sharing platform
 * Based on the error handling specification in the design document
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserNotFoundError = exports.NotFriendsError = exports.FriendRequestNotFoundError = exports.DuplicateFriendRequestError = exports.SelfFriendRequestError = exports.AccessDeniedError = exports.PostNotFoundError = exports.FileTooLargeError = exports.InvalidFormatError = exports.EmptyContentError = exports.ForbiddenError = exports.UnauthorizedError = exports.InvalidSessionError = exports.SessionExpiredError = exports.InvalidCredentialsError = exports.DuplicateUsernameError = exports.DuplicateEmailError = exports.AppError = void 0;
/**
 * Base application error class
 */
class AppError extends Error {
    constructor(code, message, statusCode) {
        super(message);
        this.code = code;
        this.statusCode = statusCode;
        this.name = 'AppError';
    }
}
exports.AppError = AppError;
// Authentication Errors
class DuplicateEmailError extends AppError {
    constructor() {
        super('DUPLICATE_EMAIL', 'Email already registered', 409);
        this.name = 'DuplicateEmailError';
    }
}
exports.DuplicateEmailError = DuplicateEmailError;
class DuplicateUsernameError extends AppError {
    constructor() {
        super('DUPLICATE_USERNAME', 'Username already taken', 409);
        this.name = 'DuplicateUsernameError';
    }
}
exports.DuplicateUsernameError = DuplicateUsernameError;
class InvalidCredentialsError extends AppError {
    constructor() {
        super('INVALID_CREDENTIALS', 'Invalid email or password', 401);
        this.name = 'InvalidCredentialsError';
    }
}
exports.InvalidCredentialsError = InvalidCredentialsError;
class SessionExpiredError extends AppError {
    constructor() {
        super('SESSION_EXPIRED', 'Session has expired', 401);
        this.name = 'SessionExpiredError';
    }
}
exports.SessionExpiredError = SessionExpiredError;
class InvalidSessionError extends AppError {
    constructor() {
        super('INVALID_SESSION', 'Invalid session token', 401);
        this.name = 'InvalidSessionError';
    }
}
exports.InvalidSessionError = InvalidSessionError;
// Post Errors
class UnauthorizedError extends AppError {
    constructor() {
        super('UNAUTHORIZED', 'Authentication required', 401);
        this.name = 'UnauthorizedError';
    }
}
exports.UnauthorizedError = UnauthorizedError;
class ForbiddenError extends AppError {
    constructor(message = 'Access denied') {
        super('FORBIDDEN', message, 403);
        this.name = 'ForbiddenError';
    }
}
exports.ForbiddenError = ForbiddenError;
class EmptyContentError extends AppError {
    constructor() {
        super('EMPTY_CONTENT', 'Content cannot be empty', 400);
        this.name = 'EmptyContentError';
    }
}
exports.EmptyContentError = EmptyContentError;
class InvalidFormatError extends AppError {
    constructor(message = 'Unsupported file format') {
        super('INVALID_FORMAT', message, 400);
        this.name = 'InvalidFormatError';
    }
}
exports.InvalidFormatError = InvalidFormatError;
class FileTooLargeError extends AppError {
    constructor(maxSize) {
        super('FILE_TOO_LARGE', `File exceeds maximum size of ${maxSize}`, 413);
        this.name = 'FileTooLargeError';
    }
}
exports.FileTooLargeError = FileTooLargeError;
class PostNotFoundError extends AppError {
    constructor() {
        super('POST_NOT_FOUND', 'Post not found', 404);
        this.name = 'PostNotFoundError';
    }
}
exports.PostNotFoundError = PostNotFoundError;
class AccessDeniedError extends AppError {
    constructor() {
        super('ACCESS_DENIED', 'You do not have access to this post', 403);
        this.name = 'AccessDeniedError';
    }
}
exports.AccessDeniedError = AccessDeniedError;
// Friend Errors
class SelfFriendRequestError extends AppError {
    constructor() {
        super('SELF_FRIEND_REQUEST', 'Cannot send friend request to yourself', 400);
        this.name = 'SelfFriendRequestError';
    }
}
exports.SelfFriendRequestError = SelfFriendRequestError;
class DuplicateFriendRequestError extends AppError {
    constructor() {
        super('DUPLICATE_REQUEST', 'Friend request already exists', 409);
        this.name = 'DuplicateFriendRequestError';
    }
}
exports.DuplicateFriendRequestError = DuplicateFriendRequestError;
class FriendRequestNotFoundError extends AppError {
    constructor() {
        super('REQUEST_NOT_FOUND', 'Friend request not found', 404);
        this.name = 'FriendRequestNotFoundError';
    }
}
exports.FriendRequestNotFoundError = FriendRequestNotFoundError;
class NotFriendsError extends AppError {
    constructor() {
        super('NOT_FRIENDS', 'Users are not friends', 400);
        this.name = 'NotFriendsError';
    }
}
exports.NotFriendsError = NotFriendsError;
class UserNotFoundError extends AppError {
    constructor() {
        super('USER_NOT_FOUND', 'User not found', 404);
        this.name = 'UserNotFoundError';
    }
}
exports.UserNotFoundError = UserNotFoundError;
//# sourceMappingURL=errors.js.map