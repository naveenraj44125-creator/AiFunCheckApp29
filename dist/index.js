"use strict";
/**
 * AI Stories Sharing - Main Application Entry Point
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const index_1 = require("./api/index");
const errors_1 = require("./models/errors");
const app = (0, express_1.default)();
exports.app = app;
const PORT = process.env.PORT || 3000;
// Middleware
app.use(express_1.default.json());
// Serve static files from public directory
app.use(express_1.default.static('public'));
// API routes (includes /api/health endpoint)
app.use('/api', index_1.apiRouter);
// Global error handler
app.use((err, req, res, next) => {
    if (err instanceof errors_1.AppError) {
        res.status(err.statusCode).json({
            error: err.code,
            message: err.message
        });
    }
    else {
        console.error('Unexpected error:', err);
        res.status(500).json({
            error: 'INTERNAL_ERROR',
            message: 'An unexpected error occurred'
        });
    }
});
// Start server
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`AI Stories Sharing server running on port ${PORT}`);
    });
}
//# sourceMappingURL=index.js.map