import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
// import { WebSocketServer } from 'ws';

// We will import routes once we create them
import { flexreadRouter } from './routes/flexread.js';
// import { ttsRouter } from './routes/tts';
// import { podcastRouter } from './routes/podcast';
// import { setupVoiceChat } from './routes/voice-chat';

const app = express();
const server = createServer(app);

// Keep the limit high since we might pass large article texts
app.use(express.json({ limit: '10mb' }));
app.use(cors());

// Basic health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

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
