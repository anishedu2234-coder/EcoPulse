"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const auth_1 = __importDefault(require("./routes/auth"));
const activities_1 = __importDefault(require("./routes/activities"));
const analytics_1 = __importDefault(require("./routes/analytics"));
const insights_1 = __importDefault(require("./routes/insights"));
const challenges_1 = __importDefault(require("./routes/challenges"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Trust proxy (necessary if running behind reverse proxies like Heroku, Nginx, Cloudflare)
app.set('trust proxy', 1);
// HTTPS Redirect Middleware (Enforced in Production)
app.use((req, res, next) => {
    if (process.env.NODE_ENV === 'production') {
        // Check standard header or req.secure
        const isSecure = req.secure || req.headers['x-forwarded-proto'] === 'https';
        if (!isSecure) {
            return res.redirect(`https://${req.headers.host}${req.url}`);
        }
    }
    next();
});
// Configure Helmet with secure HSTS and custom CSP (Content Security Policy)
app.use((0, helmet_1.default)({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: [
                "'self'",
                "'unsafe-inline'",
                "https://fonts.googleapis.com"
            ],
            fontSrc: [
                "'self'",
                "https://fonts.gstatic.com"
            ],
            imgSrc: ["'self'", "data:", "https://images.unsplash.com", "http://localhost:5000"],
            connectSrc: ["'self'", "http://localhost:5000", "https://api.ecopulse.com"], // add production api endpoint if needed
            upgradeInsecureRequests: [],
        },
    },
    hsts: {
        maxAge: 31536000, // 1 year in seconds
        includeSubDomains: true,
        preload: true,
    },
}));
// Serve static uploads
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
// Parse cookies
app.use((0, cookie_parser_1.default)());
// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:5173', 'http://localhost:5174'];
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        }
        else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
}));
app.use(express_1.default.json());
// API Rate Limiting for Auth Endpoints
const authRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: { error: 'Too many authentication attempts. Please try again after 15 minutes.' },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
// Apply rate limiter specifically to registration and login
app.use('/api/auth/register', authRateLimiter);
app.use('/api/auth/login', authRateLimiter);
// Routes
app.use('/api/auth', auth_1.default);
app.use('/api/activities', activities_1.default);
app.use('/api/analytics', analytics_1.default);
app.use('/api/insights', insights_1.default);
app.use('/api/challenges', challenges_1.default);
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
//# sourceMappingURL=index.js.map