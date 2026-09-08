import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
// import { WebSocketServer } from 'ws';

// We will import routes once we create them
import { flexreadRouter } from './routes/flexread.js';
// import { ttsRouter } from './routes/tts';
// import { podcastRouter } from './routes/podcast';
// import { setupVoiceChat } from './routes/voice-chat';

// Comma-separated list of origins allowed to call this API. Required rather
// than defaulted, so a permissive setting can never reach production by
// accident. Example: FRONTEND_ORIGIN=https://resonance.example,http://localhost:5173
const allowedOrigins = (process.env.FRONTEND_ORIGIN ?? '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

if (allowedOrigins.length === 0) {
  throw new Error(
    'FRONTEND_ORIGIN is not set. Give it a comma-separated list of origins allowed to call this API.',
  );
}

const app = express();
const server = createServer(app);

// Sized to the article-length cap enforced in the routes. 10mb let a single
// request push megabytes of text into a paid model call.
app.use(express.json({ limit: '1mb' }));
app.use(cors({ origin: allowedOrigins, methods: ['GET', 'POST'], credentials: false }));

// Every /api route reaches a paid Gemini call, so cap what one client can
// spend. The endpoint is unauthenticated by design for the demo; this is what
// stops an open URL from draining the quota.
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 60,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});

// Health check stays outside the limiter so uptime probes never trip it.
app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api', apiLimiter);
app.use('/api/flexread', flexreadRouter);
// app.use('/api/tts', ttsRouter);
// app.use('/api/podcast', podcastRouter);

// Set up WebSocket server for Gemini Live
// const wss = new WebSocketServer({ server, path: '/api/voice-chat' });
// setupVoiceChat(wss);

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`🚀 Resonance Backend running on port ${PORT}`);
});
