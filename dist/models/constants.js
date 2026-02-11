"use strict";
/**
 * Constants for AI Stories Sharing platform
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_VISIBILITY = exports.MAX_PAGE_LIMIT = exports.DEFAULT_PAGE_LIMIT = exports.SESSION_DURATION_MS = exports.MAX_VIDEO_SIZE = exports.MAX_IMAGE_SIZE = exports.VIDEO_EXTENSIONS = exports.IMAGE_EXTENSIONS = exports.SUPPORTED_VIDEO_FORMATS = exports.SUPPORTED_IMAGE_FORMATS = void 0;
// Supported media formats
exports.SUPPORTED_IMAGE_FORMATS = ['image/jpeg', 'image/png', 'image/gif'];
exports.SUPPORTED_VIDEO_FORMATS = ['video/mp4', 'video/webm'];
// File extensions mapping
exports.IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif'];
exports.VIDEO_EXTENSIONS = ['.mp4', '.webm'];
// File size limits (in bytes)
exports.MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
exports.MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB
// Session configuration
exports.SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours
// Pagination defaults
exports.DEFAULT_PAGE_LIMIT = 20;
exports.MAX_PAGE_LIMIT = 100;
// Default visibility for new posts
exports.DEFAULT_VISIBILITY = 'friends_only';
//# sourceMappingURL=constants.js.map