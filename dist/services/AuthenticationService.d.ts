/**
 * Authentication Service
 * Handles user registration, login, logout, and session management
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7
 */
import { User, Session } from '../models/types';
import { InMemoryStorage } from '../storage/InMemoryStorage';
/**
 * Authentication Service Interface
 */
export interface IAuthenticationService {
    register(email: string, username: string, password: string): Promise<User>;
    login(email: string, password: string): Promise<Session>;
    logout(sessionId: string): Promise<void>;
    validateSession(sessionId: string): Promise<User | null>;
}
/**
 * Hash a password using PBKDF2
 * Returns a string in format: salt:hash (both hex encoded)
 * Requirements: 1.7 - Secure password hashing
 */
export declare function hashPassword(password: string): string;
/**
 * Verify a password against a stored hash
 * Requirements: 1.4 - Credential validation
 */
export declare function verifyPassword(password: string, storedHash: string): boolean;
/**
 * Authentication Service Implementation
 */
export declare class AuthenticationService implements IAuthenticationService {
    private storage;
    constructor(storageInstance?: InMemoryStorage);
    /**
     * Register a new user
     * Requirements: 1.1 - Create user account with valid details
     * Requirements: 1.2 - Reject duplicate email
     * Requirements: 1.3 - Reject duplicate username
     * Requirements: 1.7 - Store password using secure hashing
     */
    register(email: string, username: string, password: string): Promise<User>;
    /**
     * Login a user with email and password
     * Requirements: 1.4 - Authenticate with valid credentials
     * Requirements: 1.5 - Reject invalid credentials
     */
    login(email: string, password: string): Promise<Session>;
    /**
     * Logout a user by terminating their session
     * Requirements: 1.6 - Terminate session on logout
     */
    logout(sessionId: string): Promise<void>;
    /**
     * Validate a session and return the associated user
     * Returns null if session is invalid or expired
     */
    validateSession(sessionId: string): Promise<User | null>;
    /**
     * Validate a session by token and return the associated user
     * Returns null if session is invalid or expired
     */
    validateSessionByToken(token: string): Promise<User | null>;
}
export declare const authenticationService: AuthenticationService;
//# sourceMappingURL=AuthenticationService.d.ts.map