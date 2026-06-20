import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth';
import activitiesRoutes from './routes/activities';
import analyticsRoutes from './routes/analytics';
import insightsRoutes from './routes/insights';
import challengesRoutes from './routes/challenges';

dotenv.config();

const app = express();
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
app.use(
  helmet({
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
  })
);

// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Parse cookies
app.use(cookieParser());

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:5173', 'http://localhost:5174'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.use(express.json());

// API Rate Limiting for Auth Endpoints
const authRateLimiter = rateLimit({
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
app.use('/api/auth', authRoutes);
app.use('/api/activities', activitiesRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/insights', insightsRoutes);
app.use('/api/challenges', challengesRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
