"use strict";
/**
 * Authentication Service
 * Handles user registration, login, logout, and session management
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticationService = exports.AuthenticationService = void 0;
exports.hashPassword = hashPassword;
exports.verifyPassword = verifyPassword;
const crypto = __importStar(require("crypto"));
const uuid_1 = require("uuid");
const InMemoryStorage_1 = require("../storage/InMemoryStorage");
const errors_1 = require("../models/errors");
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
function hashPassword(password) {
    const salt = crypto.randomBytes(HASH_CONFIG.saltLength).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, HASH_CONFIG.iterations, HASH_CONFIG.keyLength, HASH_CONFIG.digest).toString('hex');
    return `${salt}:${hash}`;
}
/**
 * Verify a password against a stored hash
 * Requirements: 1.4 - Credential validation
 */
function verifyPassword(password, storedHash) {
    const [salt, hash] = storedHash.split(':');
    if (!salt || !hash) {
        return false;
    }
    const verifyHash = crypto.pbkdf2Sync(password, salt, HASH_CONFIG.iterations, HASH_CONFIG.keyLength, HASH_CONFIG.digest).toString('hex');
    // Use timing-safe comparison to prevent timing attacks
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(verifyHash, 'hex'));
}
/**
 * Generate a secure session token
 */
function generateSessionToken() {
    return crypto.randomBytes(32).toString('hex');
}
/**
 * Session expiration time (24 hours)
 */
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000;
/**
 * Authentication Service Implementation
 */
class AuthenticationService {
    constructor(storageInstance = InMemoryStorage_1.storage) {
        this.storage = storageInstance;
    }
    /**
     * Register a new user
     * Requirements: 1.1 - Create user account with valid details
     * Requirements: 1.2 - Reject duplicate email
     * Requirements: 1.3 - Reject duplicate username
     * Requirements: 1.7 - Store password using secure hashing
     */
    async register(email, username, password) {
        // Validate input
        if (!email || !username || !password) {
            throw new Error('Email, username, and password are required');
        }
        // Check for duplicate email (case-insensitive)
        const existingByEmail = this.storage.getUserByEmail(email);
        if (existingByEmail) {
            throw new errors_1.DuplicateEmailError();
        }
        // Check for duplicate username (case-insensitive)
        const existingByUsername = this.storage.getUserByUsername(username);
        if (existingByUsername) {
            throw new errors_1.DuplicateUsernameError();
        }
        // Hash the password
        const passwordHash = hashPassword(password);
        // Create the user
        const user = {
            id: (0, uuid_1.v4)(),
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
    async login(email, password) {
        // Find user by email
        const user = this.storage.getUserByEmail(email);
        if (!user) {
            throw new errors_1.InvalidCredentialsError();
        }
        // Verify password
        if (!verifyPassword(password, user.passwordHash)) {
            throw new errors_1.InvalidCredentialsError();
        }
        // Create session
        const session = {
            id: (0, uuid_1.v4)(),
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
    async logout(sessionId) {
        const deleted = this.storage.deleteSession(sessionId);
        if (!deleted) {
            throw new errors_1.InvalidSessionError();
        }
    }
    /**
     * Validate a session and return the associated user
     * Returns null if session is invalid or expired
     */
    async validateSession(sessionId) {
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
    async validateSessionByToken(token) {
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
exports.AuthenticationService = AuthenticationService;
// Export a default instance using the singleton storage
exports.authenticationService = new AuthenticationService();
//# sourceMappingURL=AuthenticationService.js.map