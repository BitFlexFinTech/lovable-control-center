import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { to, message, chatId } = await req.json();

    if (!to || !message) {
      return new Response(JSON.stringify({ error: 'Missing required fields: to, message' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const accessToken = Deno.env.get('WHATSAPP_ACCESS_TOKEN');
    const phoneNumberId = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID');

    if (!accessToken || !phoneNumberId) {
      console.log('WhatsApp API credentials not configured, using mock mode');
      
      // Store message in database (mock mode)
      if (chatId) {
        const { data: newMessage, error: messageError } = await supabase
          .from('whatsapp_messages')
          .insert({
            chat_id: chatId,
            direction: 'outbound',
            content: message,
            status: 'sent',
          })
          .select()
          .single();

        if (messageError) {
          console.error('Error storing message:', messageError);
          throw messageError;
        }

        // Update chat's last message timestamp
        await supabase
          .from('whatsapp_chats')
          .update({ last_message_at: new Date().toISOString() })
          .eq('id', chatId);

        return new Response(JSON.stringify({ 
          success: true, 
          mock: true,
          message: newMessage,
          note: 'Message stored locally. Configure WHATSAPP_ACCESS_TOKEN and WHATSAPP_PHONE_NUMBER_ID for real delivery.'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      return new Response(JSON.stringify({ 
        success: true, 
        mock: true,
        note: 'WhatsApp API not configured. Configure WHATSAPP_ACCESS_TOKEN and WHATSAPP_PHONE_NUMBER_ID.'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Send via WhatsApp Cloud API
    const whatsappResponse = await fetch(
      `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: to.replace(/\D/g, ''), // Remove non-digits
          type: 'text',
          text: { body: message },
        }),
      }
    );

    const result = await whatsappResponse.json();

    if (!whatsappResponse.ok) {
      console.error('WhatsApp API error:', result);
      throw new Error(result.error?.message || 'Failed to send message');
    }

    console.log('Message sent successfully:', result);

    // Store message in database
    if (chatId) {
      await supabase
        .from('whatsapp_messages')
        .insert({
          chat_id: chatId,
          wa_message_id: result.messages?.[0]?.id,
          direction: 'outbound',
          content: message,
          status: 'sent',
        });

      await supabase
        .from('whatsapp_chats')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', chatId);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      messageId: result.messages?.[0]?.id 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Send message error:', error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
