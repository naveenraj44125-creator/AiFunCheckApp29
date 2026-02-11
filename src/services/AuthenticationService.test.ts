/**
 * Unit tests for AuthenticationService
 * Tests for Task 2.1: User registration with password hashing
 * Tests for Task 2.3: Login and session management
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7
 */

import { AuthenticationService, hashPassword, verifyPassword } from './AuthenticationService';
import { InMemoryStorage } from '../storage/InMemoryStorage';
import { DuplicateEmailError, DuplicateUsernameError, InvalidCredentialsError, InvalidSessionError } from '../models/errors';

describe('AuthenticationService', () => {
  let storage: InMemoryStorage;
  let authService: AuthenticationService;

  beforeEach(() => {
    // Create fresh storage for each test
    storage = new InMemoryStorage();
    authService = new AuthenticationService(storage);
  });

  describe('register', () => {
    /**
     * Requirement 1.1: Create user account with valid details
     */
    it('should create a new user with valid registration details', async () => {
      const email = 'test@example.com';
      const username = 'testuser';
      const password = 'securePassword123';

      const user = await authService.register(email, username, password);

      expect(user).toBeDefined();
      expect(user.id).toBeDefined();
      expect(user.email).toBe(email.toLowerCase());
      expect(user.username).toBe(username);
      expect(user.createdAt).toBeInstanceOf(Date);
    });

    /**
     * Requirement 1.1: User can be retrieved after registration
     */
    it('should store user that can be retrieved by email', async () => {
      const email = 'test@example.com';
      const username = 'testuser';
      const password = 'securePassword123';

      const registeredUser = await authService.register(email, username, password);
      const retrievedUser = storage.getUserByEmail(email);

      expect(retrievedUser).toBeDefined();
      expect(retrievedUser?.id).toBe(registeredUser.id);
      expect(retrievedUser?.email).toBe(email.toLowerCase());
      expect(retrievedUser?.username).toBe(username);
    });

    /**
     * Requirement 1.1: User can be retrieved by username
     */
    it('should store user that can be retrieved by username', async () => {
      const email = 'test@example.com';
      const username = 'testuser';
      const password = 'securePassword123';

      const registeredUser = await authService.register(email, username, password);
      const retrievedUser = storage.getUserByUsername(username);

      expect(retrievedUser).toBeDefined();
      expect(retrievedUser?.id).toBe(registeredUser.id);
    });

    /**
     * Requirement 1.2: Reject duplicate email
     */
    it('should reject registration with already-used email', async () => {
      const email = 'test@example.com';
      
      await authService.register(email, 'user1', 'password1');

      await expect(
        authService.register(email, 'user2', 'password2')
      ).rejects.toThrow(DuplicateEmailError);
    });

    /**
     * Requirement 1.2: Email check should be case-insensitive
     */
    it('should reject registration with same email in different case', async () => {
      await authService.register('Test@Example.com', 'user1', 'password1');

      await expect(
        authService.register('test@example.com', 'user2', 'password2')
      ).rejects.toThrow(DuplicateEmailError);
    });

    /**
     * Requirement 1.3: Reject duplicate username
     */
    it('should reject registration with already-used username', async () => {
      const username = 'testuser';
      
      await authService.register('user1@example.com', username, 'password1');

      await expect(
        authService.register('user2@example.com', username, 'password2')
      ).rejects.toThrow(DuplicateUsernameError);
    });

    /**
     * Requirement 1.3: Username check should be case-insensitive
     */
    it('should reject registration with same username in different case', async () => {
      await authService.register('user1@example.com', 'TestUser', 'password1');

      await expect(
        authService.register('user2@example.com', 'testuser', 'password2')
      ).rejects.toThrow(DuplicateUsernameError);
    });

    /**
     * Requirement 1.7: Password should be hashed
     */
    it('should store password as hash, not plaintext', async () => {
      const password = 'securePassword123';
      
      const user = await authService.register('test@example.com', 'testuser', password);

      expect(user.passwordHash).toBeDefined();
      expect(user.passwordHash).not.toBe(password);
      expect(user.passwordHash).toContain(':'); // Format: salt:hash
    });

    /**
     * Requirement 1.7: Hashed password should be verifiable
     */
    it('should create a password hash that can be verified', async () => {
      const password = 'securePassword123';
      
      const user = await authService.register('test@example.com', 'testuser', password);

      expect(verifyPassword(password, user.passwordHash)).toBe(true);
      expect(verifyPassword('wrongPassword', user.passwordHash)).toBe(false);
    });

    /**
     * Input validation: should require email
     */
    it('should reject registration with empty email', async () => {
      await expect(
        authService.register('', 'testuser', 'password')
      ).rejects.toThrow('Email, username, and password are required');
    });

    /**
     * Input validation: should require username
     */
    it('should reject registration with empty username', async () => {
      await expect(
        authService.register('test@example.com', '', 'password')
      ).rejects.toThrow('Email, username, and password are required');
    });

    /**
     * Input validation: should require password
     */
    it('should reject registration with empty password', async () => {
      await expect(
        authService.register('test@example.com', 'testuser', '')
      ).rejects.toThrow('Email, username, and password are required');
    });

    /**
     * Email normalization: should trim and lowercase email
     */
    it('should normalize email by trimming and lowercasing', async () => {
      const user = await authService.register('  Test@Example.COM  ', 'testuser', 'password');

      expect(user.email).toBe('test@example.com');
    });

    /**
     * Username normalization: should trim username
     */
    it('should trim username whitespace', async () => {
      const user = await authService.register('test@example.com', '  testuser  ', 'password');

      expect(user.username).toBe('testuser');
    });
  });

  describe('hashPassword', () => {
    /**
     * Requirement 1.7: Password hashing produces different output each time (due to salt)
     */
    it('should produce different hashes for the same password', () => {
      const password = 'testPassword123';
      
      const hash1 = hashPassword(password);
      const hash2 = hashPassword(password);

      expect(hash1).not.toBe(hash2);
    });

    /**
     * Requirement 1.7: Hash format should include salt
     */
    it('should produce hash in salt:hash format', () => {
      const hash = hashPassword('testPassword');
      
      const parts = hash.split(':');
      expect(parts).toHaveLength(2);
      expect(parts[0].length).toBeGreaterThan(0); // salt
      expect(parts[1].length).toBeGreaterThan(0); // hash
    });
  });

  describe('verifyPassword', () => {
    /**
     * Requirement 1.7: Correct password should verify
     */
    it('should return true for correct password', () => {
      const password = 'testPassword123';
      const hash = hashPassword(password);

      expect(verifyPassword(password, hash)).toBe(true);
    });

    /**
     * Requirement 1.7: Incorrect password should not verify
     */
    it('should return false for incorrect password', () => {
      const password = 'testPassword123';
      const hash = hashPassword(password);

      expect(verifyPassword('wrongPassword', hash)).toBe(false);
    });

    /**
     * Edge case: should handle invalid hash format
     */
    it('should return false for invalid hash format', () => {
      expect(verifyPassword('password', 'invalidhash')).toBe(false);
      expect(verifyPassword('password', '')).toBe(false);
    });
  });

  describe('login', () => {
    /**
     * Requirement 1.4: Authenticate with valid credentials and create session
     */
    it('should create a session when logging in with valid credentials', async () => {
      const email = 'test@example.com';
      const password = 'securePassword123';

      await authService.register(email, 'testuser', password);
      const session = await authService.login(email, password);

      expect(session).toBeDefined();
      expect(session.id).toBeDefined();
      expect(session.token).toBeDefined();
      expect(session.expiresAt).toBeInstanceOf(Date);
      expect(session.expiresAt.getTime()).toBeGreaterThan(Date.now());
    });

    /**
     * Requirement 1.4: Session should be associated with the correct user
     */
    it('should create session with correct userId', async () => {
      const email = 'test@example.com';
      const password = 'securePassword123';

      const user = await authService.register(email, 'testuser', password);
      const session = await authService.login(email, password);

      expect(session.userId).toBe(user.id);
    });

    /**
     * Requirement 1.4: Session should be stored and retrievable
     */
    it('should store session that can be retrieved', async () => {
      const email = 'test@example.com';
      const password = 'securePassword123';

      await authService.register(email, 'testuser', password);
      const session = await authService.login(email, password);

      const storedSession = storage.getSessionById(session.id);
      expect(storedSession).toBeDefined();
      expect(storedSession?.id).toBe(session.id);
      expect(storedSession?.token).toBe(session.token);
    });

    /**
     * Requirement 1.4: Login should work with case-insensitive email
     */
    it('should authenticate with email in different case', async () => {
      await authService.register('test@example.com', 'testuser', 'password123');

      const session = await authService.login('TEST@EXAMPLE.COM', 'password123');

      expect(session).toBeDefined();
      expect(session.id).toBeDefined();
    });

    /**
     * Requirement 1.5: Reject login with non-existent email
     */
    it('should reject login with non-existent email', async () => {
      await expect(
        authService.login('nonexistent@example.com', 'password')
      ).rejects.toThrow(InvalidCredentialsError);
    });

    /**
     * Requirement 1.5: Reject login with wrong password
     */
    it('should reject login with incorrect password', async () => {
      await authService.register('test@example.com', 'testuser', 'correctPassword');

      await expect(
        authService.login('test@example.com', 'wrongPassword')
      ).rejects.toThrow(InvalidCredentialsError);
    });

    /**
     * Requirement 1.5: Error message should not reveal which credential is wrong
     */
    it('should throw same error for wrong email and wrong password', async () => {
      await authService.register('test@example.com', 'testuser', 'password123');

      // Wrong email
      let wrongEmailError: InvalidCredentialsError | null = null;
      try {
        await authService.login('wrong@example.com', 'password123');
      } catch (e) {
        wrongEmailError = e as InvalidCredentialsError;
      }

      // Wrong password
      let wrongPasswordError: InvalidCredentialsError | null = null;
      try {
        await authService.login('test@example.com', 'wrongpassword');
      } catch (e) {
        wrongPasswordError = e as InvalidCredentialsError;
      }

      expect(wrongEmailError).not.toBeNull();
      expect(wrongPasswordError).not.toBeNull();
      expect(wrongEmailError!.code).toBe(wrongPasswordError!.code);
      expect(wrongEmailError!.message).toBe(wrongPasswordError!.message);
    });

    /**
     * Multiple sessions: User can have multiple active sessions
     */
    it('should allow multiple sessions for the same user', async () => {
      await authService.register('test@example.com', 'testuser', 'password123');

      const session1 = await authService.login('test@example.com', 'password123');
      const session2 = await authService.login('test@example.com', 'password123');

      expect(session1.id).not.toBe(session2.id);
      expect(session1.token).not.toBe(session2.token);

      // Both sessions should be valid
      const user1 = await authService.validateSession(session1.id);
      const user2 = await authService.validateSession(session2.id);

      expect(user1).toBeDefined();
      expect(user2).toBeDefined();
      expect(user1?.id).toBe(user2?.id);
    });
  });

  describe('logout', () => {
    /**
     * Requirement 1.6: Terminate session on logout
     */
    it('should terminate session when logging out', async () => {
      await authService.register('test@example.com', 'testuser', 'password123');
      const session = await authService.login('test@example.com', 'password123');

      // Session should exist before logout
      expect(storage.getSessionById(session.id)).toBeDefined();

      await authService.logout(session.id);

      // Session should be deleted after logout
      expect(storage.getSessionById(session.id)).toBeUndefined();
    });

    /**
     * Requirement 1.6: Session should be invalid after logout
     */
    it('should invalidate session after logout', async () => {
      await authService.register('test@example.com', 'testuser', 'password123');
      const session = await authService.login('test@example.com', 'password123');

      await authService.logout(session.id);

      const user = await authService.validateSession(session.id);
      expect(user).toBeNull();
    });

    /**
     * Requirement 1.6: Logout should only affect the specified session
     */
    it('should only terminate the specified session, not other sessions', async () => {
      await authService.register('test@example.com', 'testuser', 'password123');

      const session1 = await authService.login('test@example.com', 'password123');
      const session2 = await authService.login('test@example.com', 'password123');

      await authService.logout(session1.id);

      // Session 1 should be invalid
      const user1 = await authService.validateSession(session1.id);
      expect(user1).toBeNull();

      // Session 2 should still be valid
      const user2 = await authService.validateSession(session2.id);
      expect(user2).toBeDefined();
    });

    /**
     * Error handling: Logout with invalid session ID should throw error
     */
    it('should throw error when logging out with invalid session ID', async () => {
      await expect(
        authService.logout('non-existent-session-id')
      ).rejects.toThrow(InvalidSessionError);
    });

    /**
     * Error handling: Double logout should throw error
     */
    it('should throw error when logging out an already logged out session', async () => {
      await authService.register('test@example.com', 'testuser', 'password123');
      const session = await authService.login('test@example.com', 'password123');

      await authService.logout(session.id);

      await expect(
        authService.logout(session.id)
      ).rejects.toThrow(InvalidSessionError);
    });
  });

  describe('validateSession', () => {
    /**
     * Session validation: Valid session should return user
     */
    it('should return user for valid session', async () => {
      const registeredUser = await authService.register('test@example.com', 'testuser', 'password123');
      const session = await authService.login('test@example.com', 'password123');

      const user = await authService.validateSession(session.id);

      expect(user).toBeDefined();
      expect(user?.id).toBe(registeredUser.id);
      expect(user?.email).toBe(registeredUser.email);
      expect(user?.username).toBe(registeredUser.username);
    });

    /**
     * Session validation: Invalid session ID should return null
     */
    it('should return null for invalid session ID', async () => {
      const user = await authService.validateSession('non-existent-session-id');

      expect(user).toBeNull();
    });

    /**
     * Session validation: Expired session should return null
     */
    it('should return null for expired session', async () => {
      await authService.register('test@example.com', 'testuser', 'password123');
      const session = await authService.login('test@example.com', 'password123');

      // Manually expire the session by modifying it in storage
      const storedSession = storage.getSessionById(session.id);
      if (storedSession) {
        storedSession.expiresAt = new Date(Date.now() - 1000); // Set to past
        storage.createSession(storedSession); // Update in storage
      }

      const user = await authService.validateSession(session.id);

      expect(user).toBeNull();
    });

    /**
     * Session validation: Expired session should be cleaned up
     */
    it('should clean up expired session when validating', async () => {
      await authService.register('test@example.com', 'testuser', 'password123');
      const session = await authService.login('test@example.com', 'password123');

      // Manually expire the session
      const storedSession = storage.getSessionById(session.id);
      if (storedSession) {
        storedSession.expiresAt = new Date(Date.now() - 1000);
        storage.createSession(storedSession);
      }

      // Validate should return null and clean up
      await authService.validateSession(session.id);

      // Session should be deleted from storage
      expect(storage.getSessionById(session.id)).toBeUndefined();
    });

    /**
     * Session validation: Logged out session should return null
     */
    it('should return null for logged out session', async () => {
      await authService.register('test@example.com', 'testuser', 'password123');
      const session = await authService.login('test@example.com', 'password123');

      await authService.logout(session.id);

      const user = await authService.validateSession(session.id);

      expect(user).toBeNull();
    });
  });

  describe('validateSessionByToken', () => {
    /**
     * Token validation: Valid token should return user
     */
    it('should return user for valid session token', async () => {
      const registeredUser = await authService.register('test@example.com', 'testuser', 'password123');
      const session = await authService.login('test@example.com', 'password123');

      const user = await authService.validateSessionByToken(session.token);

      expect(user).toBeDefined();
      expect(user?.id).toBe(registeredUser.id);
    });

    /**
     * Token validation: Invalid token should return null
     */
    it('should return null for invalid session token', async () => {
      const user = await authService.validateSessionByToken('invalid-token');

      expect(user).toBeNull();
    });

    /**
     * Token validation: Expired session token should return null
     */
    it('should return null for expired session token', async () => {
      await authService.register('test@example.com', 'testuser', 'password123');
      const session = await authService.login('test@example.com', 'password123');

      // Manually expire the session
      const storedSession = storage.getSessionById(session.id);
      if (storedSession) {
        storedSession.expiresAt = new Date(Date.now() - 1000);
        storage.createSession(storedSession);
      }

      const user = await authService.validateSessionByToken(session.token);

      expect(user).toBeNull();
    });
  });
});
