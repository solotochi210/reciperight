require('express-async-errors');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const passport = require('passport');

const ApiResponse = require('./utils/ApiResponse');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler.middleware');

// Configure passport strategies (no-op if Google credentials are absent).
require('./config/passport');

const authRoutes = require('./routes/auth.routes');
const recipeRoutes = require('./routes/recipe.routes');
const commentRoutes = require('./routes/comment.routes');
const ratingRoutes = require('./routes/rating.routes');
const savedRoutes = require('./routes/saved.routes');
const searchRoutes = require('./routes/search.routes');
const userRoutes = require('./routes/user.routes');
const mediaRoutes = require('./routes/media.routes');

const app = express();

app.set('trust proxy', 1);

// Security headers
app.use(helmet());

// CORS — whitelist the client origin, allow credentials for refresh cookie
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(
  cors({
    origin: clientUrl,
    credentials: true,
  })
);

// Body + cookie parsing
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// Passport (used by Google OAuth strategy)
app.use(passport.initialize());

// Root — browsers often hit :5000 directly; point them to the React app
app.get('/', (req, res) => {
  if (req.accepts('html')) {
    return res.redirect(clientUrl);
  }
  return ApiResponse.send(res, {
    data: {
      name: 'RecipeRight API',
      client: clientUrl,
      health: '/api/health',
      docs: 'All endpoints are under /api/*',
    },
    message: 'This is the API server. Open the client URL to use RecipeRight.',
  });
});

// Browsers request this automatically — silence the 404 noise
app.get('/favicon.ico', (_req, res) => res.status(204).end());

// Health check
app.get('/api/health', (req, res) =>
  ApiResponse.send(res, { data: { status: 'ok', uptime: process.uptime() }, message: 'RecipeRight API healthy' })
);

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/saved', savedRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/users', userRoutes);
app.use('/api/media', mediaRoutes);

// 404 + error handling (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
