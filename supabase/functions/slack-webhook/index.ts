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
    
    if (!webhookUrl) {
      console.error('SLACK_WEBHOOK_URL not configured');
      return new Response(JSON.stringify({
        success: false,
        error: 'Slack webhook not configured',
        code: 'SLACK_NOT_CONFIGURED',
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 503,
      });
    }

    const { type, title, message, severity = 'low', fields, testMode }: SlackNotification = await req.json();

    // Validate required fields
    if (!title || !message) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing required fields: title, message',
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // Test mode - just verify configuration
    if (testMode) {
      console.log('Slack test mode - configuration verified');
      return new Response(JSON.stringify({
        success: true,
        message: 'Slack webhook configured correctly',
        testMode: true,
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
  } catch (error) {
    console.error('Slack function error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
