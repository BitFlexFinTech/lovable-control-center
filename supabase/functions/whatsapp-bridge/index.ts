import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const bridgeUrl = Deno.env.get('WHATSAPP_BRIDGE_URL');
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { action, sessionId, userId, ...params } = await req.json();
    
    console.log(`WhatsApp Bridge action: ${action}`, { sessionId, userId });

    // If no external bridge URL configured, use mock mode
    if (!bridgeUrl) {
      console.log('No WHATSAPP_BRIDGE_URL configured, using mock mode');
      return handleMockMode(supabase, action, sessionId, userId, params);
    }

    // Proxy to external bridge
    const bridgeResponse = await fetch(`${bridgeUrl}/api/whatsapp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, sessionId, userId, ...params }),
    });

    const bridgeData = await bridgeResponse.json();
    
    return new Response(JSON.stringify(bridgeData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('WhatsApp Bridge error:', error);
    return new Response(JSON.stringify({ error: error?.message || 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function handleMockMode(
  supabase: any, 
  action: string, 
  sessionId: string | undefined, 
  userId: string,
  params: any
) {
  switch (action) {
    case 'get-qr': {
      // Generate a mock QR code data (in real implementation, this comes from whatsapp-web.js)
      const mockSessionId = sessionId || crypto.randomUUID();
      const qrData = `whatsapp://session/${mockSessionId}?t=${Date.now()}`;
      
      // Create or update session in database
      const { error } = await supabase
        .from('whatsapp_sessions')
        .upsert({
          id: mockSessionId,
          user_id: userId,
          status: 'qr-pending',
          updated_at: new Date().toISOString(),
        }, { onConflict: 'id' });

      if (error) {
        console.error('Error creating session:', error);
        throw error;
      }

      return new Response(JSON.stringify({
        success: true,
        sessionId: mockSessionId,
        qrCode: qrData,
        expiresIn: 60,
        mode: 'mock',
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    case 'confirm-scan': {
      // Simulate QR code being scanned - connect the session
      const phoneNumber = params.phoneNumber || '+1 (555) 123-4567';
      
      const { error } = await supabase
        .from('whatsapp_sessions')
        .update({
          status: 'connected',
          phone_number: phoneNumber,
          last_connected_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', sessionId);

      if (error) throw error;

      // Create some demo chats for the connected session
      await createDemoChats(supabase, sessionId!);

      return new Response(JSON.stringify({
        success: true,
        status: 'connected',
        phoneNumber,
        mode: 'mock',
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    case 'get-status': {
      const { data, error } = await supabase
        .from('whatsapp_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (error) {
        return new Response(JSON.stringify({
          success: true,
          status: 'disconnected',
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({
        success: true,
        status: data.status,
        phoneNumber: data.phone_number,
        lastConnected: data.last_connected_at,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    case 'disconnect': {
      const { error } = await supabase
        .from('whatsapp_sessions')
        .update({
          status: 'disconnected',
          updated_at: new Date().toISOString(),
        })
        .eq('id', sessionId);

      if (error) throw error;

      return new Response(JSON.stringify({
        success: true,
        status: 'disconnected',
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    default:
      return new Response(JSON.stringify({ error: 'Unknown action' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
  }
}

async function createDemoChats(supabase: any, sessionId: string) {
  const demoContacts = [
    { name: 'John Smith', phone: '+1 (555) 234-5678', lastMessage: 'Thanks for the quick response!' },
    { name: 'Sarah Johnson', phone: '+1 (555) 345-6789', lastMessage: 'When will my order arrive?' },
    { name: 'Mike Williams', phone: '+1 (555) 456-7890', lastMessage: 'Perfect, thank you!' },
    { name: 'Emma Davis', phone: '+1 (555) 567-8901', lastMessage: 'Can I get a refund?' },
    { name: 'Alex Brown', phone: '+1 (555) 678-9012', lastMessage: 'Great service!' },
  ];

  for (const contact of demoContacts) {
    // Check if chat already exists
    const { data: existingChat } = await supabase
      .from('whatsapp_chats')
      .select('id')
      .eq('session_id', sessionId)
      .eq('contact_phone', contact.phone)
      .single();

    if (!existingChat) {
      const { data: chat, error: chatError } = await supabase
        .from('whatsapp_chats')
        .insert({
          session_id: sessionId,
          contact_name: contact.name,
          contact_phone: contact.phone,
          last_message_preview: contact.lastMessage,
          last_message_at: new Date().toISOString(),
          unread_count: Math.floor(Math.random() * 3),
        })
        .select()
        .single();

      if (chatError) {
        console.error('Error creating demo chat:', chatError);
        continue;
      }

      // Create some demo messages for each chat
      const demoMessages = [
        { content: `Hi! This is ${contact.name}. How can I help you today?`, direction: 'inbound' },
        { content: 'Hello! Thanks for reaching out.', direction: 'outbound' },
        { content: contact.lastMessage, direction: 'inbound' },
      ];

      for (const msg of demoMessages) {
        await supabase.from('whatsapp_messages').insert({
          chat_id: chat.id,
          content: msg.content,
          direction: msg.direction,
          status: 'read',
        });
      }
    }
  }
}
