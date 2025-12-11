import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailRequest {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  text?: string;
  testMode?: boolean;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const sendgridApiKey = Deno.env.get('SENDGRID_API_KEY');
    
    if (!sendgridApiKey) {
      console.error('SENDGRID_API_KEY not configured');
      return new Response(JSON.stringify({
        success: false,
        error: 'Email service not configured',
        code: 'SENDGRID_NOT_CONFIGURED',
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 503,
      });
    }

    const { to, subject, html, from, text, testMode }: EmailRequest = await req.json();

    // Validate required fields
    if (!to || !subject || !html) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing required fields: to, subject, html',
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // Test mode - just verify configuration
    if (testMode) {
      console.log('Email test mode - configuration verified');
      return new Response(JSON.stringify({
        success: true,
        message: 'Email service configured correctly',
        testMode: true,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Build SendGrid request
    const recipients = Array.isArray(to) ? to : [to];
    const emailData = {
      personalizations: [{
        to: recipients.map(email => ({ email })),
      }],
      from: { email: from || 'noreply@controlcenter.local' },
      subject,
      content: [
        { type: 'text/html', value: html },
        ...(text ? [{ type: 'text/plain', value: text }] : []),
      ],
    };

    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${sendgridApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData),
    });

    if (response.ok || response.status === 202) {
      console.log('Email sent successfully to:', recipients);
      return new Response(JSON.stringify({
        success: true,
        message: 'Email sent successfully',
        recipients: recipients.length,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else {
      const errorText = await response.text();
      console.error('SendGrid error:', response.status, errorText);
      return new Response(JSON.stringify({
        success: false,
        error: 'Failed to send email',
        details: errorText,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: response.status,
      });
    }
  } catch (error) {
    console.error('Email function error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
