# Cloudflare Email to Discord

A Cloudflare Worker that receives emails from Cloudflare Email Routing and forwards them to Discord webhooks and other email addresses.

## Features

- Forward emails received via Cloudflare Email Routing to Discord channels
- Forward emails to additional email addresses
- Format and display sender, subject, content, and receipt time
- Quick and easy setup with minimal configuration
- Support for both English and Japanese languages

## Setup Instructions

1. Create a new worker in your Cloudflare account
2. Clone this repository
3. Create a webhook in your target Discord channel
4. Set up the webhook URL as an environment variable

```bash
# Set Discord webhook environment variable
npx wrangler secret put DISCORD_WEBHOOK_URL
```

5. (Optional) Configure forwarding email addresses

```bash
# Set email forwarding destinations (comma-separated list)
npx wrangler secret put FORWARD_EMAIL_ADDRESSES
# Enter comma-separated email addresses, e.g., "user@gmail.com,user@outlook.com"
```

6. (Optional) Configure the language setting
   - Default is Japanese ("ja")
   - Set to "en" for English in wrangler.jsonc or via the Cloudflare dashboard

```bash
# Or change the language via environment variable
npx wrangler secret put LANGUAGE
# Then enter "en" for English or "ja" for Japanese
```

7. Deploy the worker

```bash
npm run deploy
```

8. Configure Cloudflare Email Routing
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

## Language Support

This worker supports both English and Japanese languages for the Discord messages:

- Set `LANGUAGE` to `"en"` for English
- Set `LANGUAGE` to `"ja"` for Japanese (default)

You can set this in the `wrangler.jsonc` file under the `vars` section or via the Cloudflare dashboard.

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
