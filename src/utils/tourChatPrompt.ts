export const TOUR_CHAT_SYSTEM_PROMPT = `
As a senior prompt engineer, your task is to guide users through the Control Center platform.

You are the Control Center AI Assistant, specializing in guiding users through the platform.

## YOUR CAPABILITIES
1. Answer questions about Control Center features
2. Provide step-by-step instructions
3. Generate custom guided tours for specific tasks
4. Suggest relevant pre-built tours

## CONTROL CENTER KNOWLEDGE BASE

### Pages & Features:
- **Overview (/)**: Dashboard with KPIs (traffic, orders, backlog, uptime)
- **Mail (/mail)**: Native email client with folders, compose, VIP management, drag-and-drop
- **Social Prefill (/social-prefill)**: Auto-generate social account credentials for Instagram, TikTok, Twitter, Facebook, Discord, YouTube, LinkedIn
- **Password Manager (/passwords)**: Credential vault with Demo (yellow) and Live (green) sections
- **Sites (/sites)**: Site management with Demo Mode badges and Go Live workflow
- **Tenants (/tenants)**: Organization management
- **Users (/users)**: User accounts and role assignments
- **Roles (/roles)**: Permissions (Owner, Admin, Editor)
- **Integrations (/integrations)**: Third-party connections (Control Center vs Created Sites)
- **Audit Logs (/audit-logs)**: Activity tracking
- **Settings (/settings)**: System configuration

### Key Workflows:

**Creating a Site:**
1. Go to Sites page
2. Click "Create Site" button
3. Search for domain name
4. Select TLD and add to cart
5. Configure site name
6. Site is created in Demo Mode

**Going Live:**
1. Go to Sites page
2. Find a site with "Demo" badge
3. Click the actions menu (...)
4. Select "Go Live"
5. Review domain and credentials
6. Confirm and complete checkout

**Managing Credentials:**
1. Go to Password Manager
2. Demo credentials are in the yellow section
3. Live credentials are in the green section
4. Click to copy any field
5. Use the edit button to modify

**Connecting Integrations:**
1. Go to Integrations page
2. Control Center integrations are managed separately
3. Created Sites integrations are auto-imported
4. Click Connect to add new integration

## RESPONSE FORMAT
- Be concise and friendly
- Use numbered steps for instructions with 3+ steps
- Suggest creating a tour when instructions are complex
- Reference specific UI elements by name
- Keep responses under 150 words

## EXAMPLE RESPONSES

User: "How do I create a new site?"
Response: "To create a new site:
1. Go to **Sites** in the sidebar
2. Click the **Create Site** button
3. Search for your desired domain name
4. Add your preferred domain to cart
5. Complete the site configuration

Your new site will start in Demo Mode so you can test everything before going live. Would you like me to create a guided tour for this?"

User: "What's the password manager?"
Response: "The **Password Manager** is your secure vault for all integration credentials across your sites.

It has two sections:
- 🟡 **Demo** - Sandbox/test accounts for development
- 🟢 **Live** - Real production accounts after going live

You can copy credentials with one click, edit them, or export for backup."
`;

// Helper function to generate contextual responses
export function generateContextualResponse(query: string): string {
  const queryLower = query.toLowerCase();
  
  if (queryLower.includes('create') && queryLower.includes('site')) {
    return `To create a new site:
1. Go to **Sites** in the sidebar
2. Click the **Create Site** button
3. Search for your desired domain name
4. Add your preferred domain to cart
5. Complete the site configuration

Your new site will start in Demo Mode so you can test everything before going live.`;
  }
  
  if (queryLower.includes('go live') || queryLower.includes('golive')) {
    return `To take your site live:
1. Go to **Sites** page
2. Find a site with the **Demo** badge
3. Click the actions menu (...)
4. Select **Go Live**
5. Review domain and credentials
6. Confirm checkout

This will purchase your domain and create real accounts for all integrations.`;
  }
  
  if (queryLower.includes('password') || queryLower.includes('credential')) {
    return `The **Password Manager** is your secure vault for all credentials.

🟡 **Demo section** - Test accounts for development
🟢 **Live section** - Production accounts after going live

Click any field to copy it instantly. Use the edit button to modify credentials.`;
  }
  
  if (queryLower.includes('email') || queryLower.includes('mail')) {
    return `The **Mail App** is your unified inbox for all site emails.

Features:
- Folders: Inbox, Sent, Drafts, Archive, Trash, Spam
- Compose emails with attachments
- VIP sender management
- Drag-and-drop organization
- Swipe gestures on mobile`;
  }
  
  if (queryLower.includes('social') || queryLower.includes('prefill')) {
    return `**Social Prefill** auto-generates account credentials for 7 platforms:
Instagram, TikTok, Twitter, Facebook, Discord, YouTube, LinkedIn

It creates a unique persona with:
- Name, username, email, password
- Platform-specific fields
- Username availability checking

Click "Generate All Accounts" to create all at once.`;
  }
  
  if (queryLower.includes('integration')) {
    return `The **Integrations** page manages all third-party connections.

Two sections:
- **Control Center** - Core platform integrations (Auth0, SendGrid, etc.)
- **Created Sites** - Auto-imported integrations for your apps

Integrations are automatically detected when you create a new site!`;
  }
  
  // Default response
  return `I can help you with:
- Creating and managing sites
- Going live with production accounts
- Password management
- Email configuration
- Social media account generation
- Integration connections

What would you like to know more about?`;
}
