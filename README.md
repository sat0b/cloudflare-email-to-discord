# Cloudflare Email to Discord

A Cloudflare Worker that receives emails from Cloudflare Email Routing and forwards them to Discord webhooks.

## Features

- Forward emails received via Cloudflare Email Routing to Discord channels
- Format and display sender, subject, content, and receipt time
- Quick and easy setup with minimal configuration

## Setup Instructions

1. Create a new worker in your Cloudflare account
2. Clone this repository
3. Create a webhook in your target Discord channel
4. Set up the webhook URL as an environment variable

```bash
# Set Discord webhook environment variable
npx wrangler secret put DISCORD_WEBHOOK_URL
```

5. Deploy the worker

```bash
npm run deploy
```

6. Configure Cloudflare Email Routing
   - Navigate to Email > Email Routing in your Cloudflare dashboard
   - Create a new rule to forward emails to your worker

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Deploy
npm run deploy
```

## Customization

You can customize the message format and error handling by editing `src/index.ts`.

## License

MIT
