/**
 * Error types for AI Stories Sharing platform
 * Based on the error handling specification in the design document
 */
/**
 * Base application error class
 */
export declare class AppError extends Error {
    code: string;
    statusCode: number;
    constructor(code: string, message: string, statusCode: number);
}
export declare class DuplicateEmailError extends AppError {
    constructor();
}
export declare class DuplicateUsernameError extends AppError {
    constructor();
}
export declare class InvalidCredentialsError extends AppError {
    constructor();
}
export declare class SessionExpiredError extends AppError {
    constructor();
}
export declare class InvalidSessionError extends AppError {
    constructor();
}
export declare class UnauthorizedError extends AppError {
    constructor();
}
export declare class ForbiddenError extends AppError {
    constructor(message?: string);
}
export declare class EmptyContentError extends AppError {
    constructor();
}
export declare class InvalidFormatError extends AppError {
    constructor(message?: string);
}
export declare class FileTooLargeError extends AppError {
    constructor(maxSize: string);
}
export declare class PostNotFoundError extends AppError {
    constructor();
}
export declare class AccessDeniedError extends AppError {
    constructor();
}
export declare class SelfFriendRequestError extends AppError {
    constructor();
}
export declare class DuplicateFriendRequestError extends AppError {
    constructor();
}
export declare class FriendRequestNotFoundError extends AppError {
    constructor();
}
export declare class NotFriendsError extends AppError {
    constructor();
}
export declare class UserNotFoundError extends AppError {
    constructor();
}
//# sourceMappingURL=errors.d.ts.map