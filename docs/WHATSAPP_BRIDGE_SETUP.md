# WhatsApp Bridge Setup Guide

This guide explains how to deploy the external WhatsApp Bridge service for real WhatsApp integration.

## Overview

The WhatsApp integration uses a two-tier architecture:

1. **Control Center** (Lovable app) - The frontend dashboard
2. **WhatsApp Bridge** (External Node.js service) - Handles the actual WhatsApp Web connection

The bridge is required because:
- `whatsapp-web.js` needs Puppeteer/Chromium for browser automation
- Supabase Edge Functions are stateless and don't support long-running connections
- WhatsApp Web requires a persistent session

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Control Center │────▶│  Supabase Edge   │────▶│ WhatsApp Bridge │
│   (Frontend)    │     │    Function      │     │  (Node.js)      │
└─────────────────┘     └──────────────────┘     └────────┬────────┘
                                                          │
                               ┌──────────────────────────┘
                               ▼
                        ┌─────────────┐
                        │ WhatsApp    │
                        │ Web API     │
                        └─────────────┘
```

## Bridge Server Code

Create a new Node.js project for the bridge:

### package.json
```json
{
  "name": "whatsapp-bridge",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "node index.js",
    "dev": "node --watch index.js"
  },
  "dependencies": {
    "whatsapp-web.js": "^1.23.0",
    "express": "^4.18.2",
    "qrcode": "^1.5.3",
    "cors": "^2.8.5",
    "@supabase/supabase-js": "^2.38.4"
  }
}
```

### index.js
```javascript
import express from 'express';
import cors from 'cors';
import qrcode from 'qrcode';
import { Client, LocalAuth } from 'whatsapp-web.js';
import { createClient } from '@supabase/supabase-js';

const app = express();
app.use(cors());
app.use(express.json());

// Supabase client for pushing data
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Store active sessions
const sessions = new Map();

// Create WhatsApp client for a user
function createWhatsAppClient(sessionId) {
  const client = new Client({
    authStrategy: new LocalAuth({ clientId: sessionId }),
    puppeteer: {
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    },
  });

  return client;
}

// API endpoint for Control Center
app.post('/api/whatsapp', async (req, res) => {
  const { action, sessionId, userId, ...params } = req.body;

  try {
    switch (action) {
      case 'get-qr': {
        const newSessionId = sessionId || crypto.randomUUID();
        
        // Create WhatsApp client
        const client = createWhatsAppClient(newSessionId);
        sessions.set(newSessionId, { client, userId, status: 'initializing' });

        let qrData = null;

        client.on('qr', async (qr) => {
          qrData = await qrcode.toDataURL(qr);
          sessions.get(newSessionId).qr = qrData;
          sessions.get(newSessionId).status = 'qr-ready';
          
          // Update session in Supabase
          await supabase.from('whatsapp_sessions').upsert({
            id: newSessionId,
            user_id: userId,
            status: 'qr-pending',
            updated_at: new Date().toISOString(),
          });
        });

        client.on('ready', async () => {
          const info = client.info;
          sessions.get(newSessionId).status = 'connected';
          
          // Update session as connected
          await supabase.from('whatsapp_sessions').update({
            status: 'connected',
            phone_number: info.wid.user,
            last_connected_at: new Date().toISOString(),
          }).eq('id', newSessionId);
        });

        client.on('message', async (msg) => {
          // Store incoming messages in Supabase
          const contact = await msg.getContact();
          
          // Find or create chat
          let { data: chat } = await supabase
            .from('whatsapp_chats')
            .select('id')
            .eq('session_id', newSessionId)
            .eq('contact_phone', msg.from)
            .single();

          if (!chat) {
            const { data: newChat } = await supabase.from('whatsapp_chats').insert({
              session_id: newSessionId,
              contact_name: contact.pushname || contact.name || msg.from,
              contact_phone: msg.from,
            }).select().single();
            chat = newChat;
          }

          // Insert message
          await supabase.from('whatsapp_messages').insert({
            chat_id: chat.id,
            content: msg.body,
            direction: 'inbound',
            status: 'read',
            wa_message_id: msg.id._serialized,
          });

          // Update chat preview
          await supabase.from('whatsapp_chats').update({
            last_message_preview: msg.body.substring(0, 100),
            last_message_at: new Date().toISOString(),
          }).eq('id', chat.id);

          // Increment unread
          await supabase.rpc('increment_unread', { chat_uuid: chat.id });
        });

        client.initialize();

        // Wait for QR or timeout
        await new Promise((resolve) => setTimeout(resolve, 5000));
        
        const session = sessions.get(newSessionId);
        
        res.json({
          success: true,
          sessionId: newSessionId,
          qrCode: session?.qr || null,
          status: session?.status || 'initializing',
          expiresIn: 60,
        });
        break;
      }

      case 'send-message': {
        const session = sessions.get(sessionId);
        if (!session || session.status !== 'connected') {
          throw new Error('Session not connected');
        }

        const chatId = params.to.includes('@c.us') ? params.to : `${params.to}@c.us`;
        const msg = await session.client.sendMessage(chatId, params.message);

        res.json({
          success: true,
          messageId: msg.id._serialized,
        });
        break;
      }

      case 'disconnect': {
        const session = sessions.get(sessionId);
        if (session) {
          await session.client.logout();
          sessions.delete(sessionId);
        }

        await supabase.from('whatsapp_sessions').update({
          status: 'disconnected',
          updated_at: new Date().toISOString(),
        }).eq('id', sessionId);

        res.json({ success: true, status: 'disconnected' });
        break;
      }

      case 'get-status': {
        const session = sessions.get(sessionId);
        res.json({
          success: true,
          status: session?.status || 'disconnected',
          qrCode: session?.qr || null,
        });
        break;
      }

      default:
        res.status(400).json({ error: 'Unknown action' });
    }
  } catch (error) {
    console.error('Bridge error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', sessions: sessions.size });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`WhatsApp Bridge running on port ${PORT}`);
});
```

## Deployment Options

### Option 1: Railway (Recommended)
1. Create a new Railway project
2. Connect your GitHub repo with the bridge code
3. Add environment variables:
   - `SUPABASE_URL` - Your Supabase project URL
   - `SUPABASE_SERVICE_ROLE_KEY` - Service role key
4. Deploy automatically

### Option 2: Render
1. Create a new Web Service
2. Use Docker with Puppeteer support:
   ```dockerfile
   FROM node:18-slim
   
   RUN apt-get update && apt-get install -y \
       chromium \
       fonts-liberation \
       libappindicator3-1 \
       libasound2 \
       libatk-bridge2.0-0 \
       libatk1.0-0 \
       libcups2 \
       libdbus-1-3 \
       libdrm2 \
       libgbm1 \
       libgtk-3-0 \
       libnspr4 \
       libnss3 \
       libxcomposite1 \
       libxdamage1 \
       libxrandr2 \
       xdg-utils \
       --no-install-recommends \
     && rm -rf /var/lib/apt/lists/*
   
   WORKDIR /app
   COPY package*.json ./
   RUN npm install
   COPY . .
   
   ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
   
   CMD ["npm", "start"]
   ```

### Option 3: Self-hosted VPS
1. Set up a Linux VPS (Ubuntu recommended)
2. Install Node.js 18+ and Chromium
3. Use PM2 for process management
4. Set up nginx as reverse proxy

## Configuration

After deploying the bridge, add the secret to your Supabase project:

1. Get your bridge URL (e.g., `https://your-bridge.railway.app`)
2. Add the secret `WHATSAPP_BRIDGE_URL` to your Supabase project

The `whatsapp-bridge` edge function will automatically proxy requests to your bridge.

## Mock Mode

If `WHATSAPP_BRIDGE_URL` is not configured, the system runs in **mock mode**:
- QR codes are simulated
- Demo chats and messages are created in the database
- All data persists in Supabase
- Real-time updates work via Supabase Realtime

This allows testing the full UI without deploying the external bridge.

## Security Considerations

1. **Bridge Authentication**: Add an API key check between the edge function and bridge
2. **Session Isolation**: Each user has their own WhatsApp session
3. **Data Encryption**: Consider encrypting sensitive data in Supabase
4. **Rate Limiting**: Implement rate limiting on the bridge API
5. **Monitoring**: Set up logging and alerts for connection issues

## Troubleshooting

### QR Code not appearing
- Check bridge logs for Puppeteer errors
- Ensure Chromium is installed correctly
- Verify the bridge URL is accessible

### Messages not syncing
- Check Supabase RLS policies
- Verify service role key has correct permissions
- Check real-time subscription is active

### Session disconnecting
- WhatsApp may require re-authentication periodically
- Implement session recovery logic
- Store session data for reconnection
