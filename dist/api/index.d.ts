/**
 * API Routes
 * Express router for all API endpoints
 * Task 12: API Layer Implementation
 */
import { Request, Response, NextFunction } from 'express';
import { User } from '../models/types';
export declare const apiRouter: import("express-serve-static-core").Router;
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
declare function errorHandler(err: Error, req: Request, res: Response, next: NextFunction): void;
/**
 * Async handler wrapper to catch errors
 */
declare function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<void>): (req: Request, res: Response, next: NextFunction) => void;
/**
 * Authentication middleware - requires valid session
 * Extracts user from session token and attaches to request
 * Throws UnauthorizedError if not authenticated
 */
declare const requireAuth: (req: Request, res: Response, next: NextFunction) => void;
/**
 * Optional authentication middleware
 * Extracts user from session token if present, but doesn't require it
 */
declare const optionalAuth: (req: Request, res: Response, next: NextFunction) => void;
export { errorHandler, asyncHandler, requireAuth, optionalAuth };
//# sourceMappingURL=index.d.ts.map