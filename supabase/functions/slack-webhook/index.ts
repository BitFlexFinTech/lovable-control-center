import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SlackNotification {
  type: 'alert' | 'info' | 'success' | 'warning';
  title: string;
  message: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  fields?: { name: string; value: string }[];
  testMode?: boolean;
}

const severityColors: Record<string, string> = {
  low: '#36a64f',      // green
  medium: '#ffcc00',   // yellow
  high: '#ff9900',     // orange
  critical: '#ff0000', // red
};

const typeEmojis: Record<string, string> = {
  alert: '🚨',
  info: 'ℹ️',
  success: '✅',
  warning: '⚠️',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const webhookUrl = Deno.env.get('SLACK_WEBHOOK_URL');
    const { type, title, message, severity = 'low', fields, testMode }: SlackNotification = await req.json();

    // Validate required fields (not in test mode)
    if (!testMode && (!title || !message)) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing required fields: title, message',
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // Test mode - verify configuration status
    if (testMode) {
      const isConfigured = !!webhookUrl;
      console.log('Slack test mode - configured:', isConfigured);
      return new Response(JSON.stringify({
        success: true,
        message: isConfigured ? 'Slack webhook configured correctly' : 'Slack running in mock mode',
        testMode: true,
        mockMode: !isConfigured,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Mock mode - when no webhook URL is configured, log and return success
    if (!webhookUrl) {
      const emoji = typeEmojis[type] || 'ℹ️';
      console.log('[MOCK MODE] Slack notification would be sent:', {
        type,
        title: `${emoji} ${title}`,
        message,
        severity,
        fields,
      });
      return new Response(JSON.stringify({
        success: true,
        message: 'Slack notification logged (mock mode - no webhook URL)',
        mockMode: true,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Build Slack Block Kit message
    const emoji = typeEmojis[type] || 'ℹ️';
    const color = severityColors[severity] || '#36a64f';

    const slackPayload = {
      attachments: [{
        color,
        blocks: [
          {
            type: 'header',
            text: {
              type: 'plain_text',
              text: `${emoji} ${title}`,
              emoji: true,
            },
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: message,
            },
          },
          ...(fields && fields.length > 0 ? [{
            type: 'section',
            fields: fields.map(f => ({
              type: 'mrkdwn',
              text: `*${f.name}:*\n${f.value}`,
            })),
          }] : []),
          {
            type: 'context',
            elements: [{
              type: 'mrkdwn',
              text: `Control Center • ${new Date().toISOString()}`,
            }],
          },
        ],
      }],
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(slackPayload),
    });

    if (response.ok) {
      console.log('Slack notification sent:', title);
      return new Response(JSON.stringify({
        success: true,
        message: 'Slack notification sent',
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else {
      const errorText = await response.text();
      console.error('Slack webhook error:', response.status, errorText);
      return new Response(JSON.stringify({
        success: false,
        error: 'Failed to send Slack notification',
        details: errorText,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: response.status,
      });
    }
  } catch (error: unknown) {
    console.error('Slack function error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
