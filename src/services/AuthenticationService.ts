/**
 * Authentication Service
 * Handles user registration, login, logout, and session management
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7
 */

import * as crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { User, Session } from '../models/types';
import { InMemoryStorage, storage } from '../storage/InMemoryStorage';
import {
  DuplicateEmailError,
  DuplicateUsernameError,
  InvalidCredentialsError,
  InvalidSessionError,
  SessionExpiredError
} from '../models/errors';

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
 * Password hashing configuration
 * Using PBKDF2 with SHA-512 for secure password hashing
 */
const HASH_CONFIG = {
  iterations: 100000,
  keyLength: 64,
  digest: 'sha512',
  saltLength: 32
};

/**
 * Hash a password using PBKDF2
 * Returns a string in format: salt:hash (both hex encoded)
 * Requirements: 1.7 - Secure password hashing
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(HASH_CONFIG.saltLength).toString('hex');
  const hash = crypto.pbkdf2Sync(
    password,
    salt,
    HASH_CONFIG.iterations,
    HASH_CONFIG.keyLength,
    HASH_CONFIG.digest
  ).toString('hex');
  
  return `${salt}:${hash}`;
}

/**
 * Verify a password against a stored hash
 * Requirements: 1.4 - Credential validation
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  const [salt, hash] = storedHash.split(':');
  if (!salt || !hash) {
    return false;
  }
  
  const verifyHash = crypto.pbkdf2Sync(
    password,
    salt,
    HASH_CONFIG.iterations,
    HASH_CONFIG.keyLength,
    HASH_CONFIG.digest
  ).toString('hex');
  
  // Use timing-safe comparison to prevent timing attacks
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(verifyHash, 'hex'));
}

/**
 * Generate a secure session token
 */
function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Session expiration time (24 hours)
 */
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000;

/**
 * Authentication Service Implementation
 */
export class AuthenticationService implements IAuthenticationService {
  private storage: InMemoryStorage;

  constructor(storageInstance: InMemoryStorage = storage) {
    this.storage = storageInstance;
  }

  /**
   * Register a new user
   * Requirements: 1.1 - Create user account with valid details
   * Requirements: 1.2 - Reject duplicate email
   * Requirements: 1.3 - Reject duplicate username
   * Requirements: 1.7 - Store password using secure hashing
   */
  async register(email: string, username: string, password: string): Promise<User> {
    // Validate input
    if (!email || !username || !password) {
      throw new Error('Email, username, and password are required');
    }

    // Check for duplicate email (case-insensitive)
    const existingByEmail = this.storage.getUserByEmail(email);
    if (existingByEmail) {
      throw new DuplicateEmailError();
    }

    // Check for duplicate username (case-insensitive)
    const existingByUsername = this.storage.getUserByUsername(username);
    if (existingByUsername) {
      throw new DuplicateUsernameError();
    }

    // Hash the password
    const passwordHash = hashPassword(password);

    // Create the user
    const user: User = {
      id: uuidv4(),
      email: email.toLowerCase().trim(),
      username: username.trim(),
      passwordHash,
      createdAt: new Date()
    };

    // Store the user
    this.storage.createUser(user);

    return user;
  }

  /**
   * Login a user with email and password
   * Requirements: 1.4 - Authenticate with valid credentials
   * Requirements: 1.5 - Reject invalid credentials
   */
  async login(email: string, password: string): Promise<Session> {
    // Find user by email
    const user = this.storage.getUserByEmail(email);
    if (!user) {
      throw new InvalidCredentialsError();
    }

    // Verify password
    if (!verifyPassword(password, user.passwordHash)) {
      throw new InvalidCredentialsError();
    }

    // Create session
    const session: Session = {
      id: uuidv4(),
      userId: user.id,
      token: generateSessionToken(),
      expiresAt: new Date(Date.now() + SESSION_DURATION_MS)
    };

    this.storage.createSession(session);

    return session;
  }

  /**
   * Logout a user by terminating their session
   * Requirements: 1.6 - Terminate session on logout
   */
  async logout(sessionId: string): Promise<void> {
    const deleted = this.storage.deleteSession(sessionId);
    if (!deleted) {
      throw new InvalidSessionError();
    }
  }

  /**
   * Validate a session and return the associated user
   * Returns null if session is invalid or expired
   */
  async validateSession(sessionId: string): Promise<User | null> {
    const session = this.storage.getSessionById(sessionId);
    
    if (!session) {
      return null;
    }

    // Check if session has expired
    if (new Date() > session.expiresAt) {
      // Clean up expired session
      this.storage.deleteSession(sessionId);
      return null;
    }

    // Get the user
    const user = this.storage.getUserById(session.userId);
    return user || null;
  }

  /**
   * Validate a session by token and return the associated user
   * Returns null if session is invalid or expired
   */
  async validateSessionByToken(token: string): Promise<User | null> {
    const session = this.storage.getSessionByToken(token);
    
    if (!session) {
      return null;
    }

    // Check if session has expired
    if (new Date() > session.expiresAt) {
      // Clean up expired session
      this.storage.deleteSession(session.id);
      return null;
    }

    // Get the user
    const user = this.storage.getUserById(session.userId);
    return user || null;
  }
}

// Export a default instance using the singleton storage
export const authenticationService = new AuthenticationService();
