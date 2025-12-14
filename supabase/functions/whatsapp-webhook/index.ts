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

    // Handle webhook verification (GET request from WhatsApp)
    if (req.method === 'GET') {
      const url = new URL(req.url);
      const mode = url.searchParams.get('hub.mode');
      const token = url.searchParams.get('hub.verify_token');
      const challenge = url.searchParams.get('hub.challenge');

      const verifyToken = Deno.env.get('WHATSAPP_WEBHOOK_VERIFY_TOKEN') || 'control-center-verify';

      if (mode === 'subscribe' && token === verifyToken) {
        console.log('Webhook verified successfully');
        return new Response(challenge, { 
          status: 200,
          headers: { 'Content-Type': 'text/plain' }
        });
      } else {
        console.log('Webhook verification failed');
        return new Response('Forbidden', { status: 403 });
      }
    }

    // Handle incoming messages (POST request)
    if (req.method === 'POST') {
      const body = await req.json();
      console.log('Received webhook payload:', JSON.stringify(body, null, 2));

      // Parse WhatsApp Cloud API webhook format
      const entry = body.entry?.[0];
      const changes = entry?.changes?.[0];
      const value = changes?.value;

      if (value?.messages) {
        for (const message of value.messages) {
          const from = message.from;
          const messageId = message.id;
          const timestamp = message.timestamp;
          const text = message.text?.body;

          console.log(`Received message from ${from}: ${text}`);

          // Find or create chat
          const { data: existingChat } = await supabase
            .from('whatsapp_chats')
            .select('id')
            .eq('contact_phone', from)
            .single();

          let chatId = existingChat?.id;

          if (!chatId) {
            const { data: newChat, error: chatError } = await supabase
              .from('whatsapp_chats')
              .insert({
                contact_phone: from,
                contact_name: value.contacts?.[0]?.profile?.name || from,
                last_message_at: new Date().toISOString(),
                unread_count: 1,
              })
              .select('id')
              .single();

            if (chatError) {
              console.error('Error creating chat:', chatError);
            } else {
              chatId = newChat?.id;
            }
          } else {
            // Update existing chat
            await supabase
              .from('whatsapp_chats')
              .update({
                last_message_at: new Date().toISOString(),
                unread_count: supabase.rpc('increment_unread', { chat_id: chatId }),
              })
              .eq('id', chatId);
          }

          // Store message
          if (chatId) {
            const { error: messageError } = await supabase
              .from('whatsapp_messages')
              .insert({
                chat_id: chatId,
                wa_message_id: messageId,
                direction: 'inbound',
                content: text,
                status: 'received',
              });

            if (messageError) {
              console.error('Error storing message:', messageError);
            }
          }
        }
      }

      // Handle status updates
      if (value?.statuses) {
        for (const status of value.statuses) {
          console.log(`Message ${status.id} status: ${status.status}`);

          await supabase
            .from('whatsapp_messages')
            .update({ status: status.status })
            .eq('wa_message_id', status.id);
        }
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response('Method not allowed', { status: 405 });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Webhook error:', error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
