/**
 * Cloudflare Worker for Email to Discord forwarding
 *
 * - This worker receives emails from Cloudflare Email Routing and forwards them to Discord
 * - You need to set up a Discord webhook and configure the DISCORD_WEBHOOK_URL environment variable
 * - You can set the LANGUAGE environment variable to "en" or "ja" for English or Japanese messages
 */

import { simpleParser } from 'mailparser';

export interface Env {
  // Discord webhook environment variable
  DISCORD_WEBHOOK_URL: string;
  // Language setting: "en" for English, "ja" for Japanese
  LANGUAGE?: string;
  // Email forwarding destinations (comma-separated list of email addresses)
  FORWARD_EMAIL_ADDRESSES?: string;
}

// Cloudflare email-related type definitions
interface EmailMessage {
  readonly from: string;
  readonly to: string;
  readonly headers: Headers;
  readonly raw: ReadableStream;

  forward(email: string): Promise<void>;
}

// Text content for different languages
const translations = {
  en: {
    unknownSender: 'Unknown sender',
    noSubject: 'No subject',
    unknownDate: 'Unknown date',
    noContent: 'No content',
    newEmailReceived: 'New Email Received',
    from: 'From',
    to: 'To',
    received: 'Received',
    truncated: '...(truncated)',
    viaCloudflare: 'Via Cloudflare Email Routing',
    serviceRunning: 'Email to Discord forwarding service is running. Processing emails from Cloudflare Email Routing.',
    errorProcessing: 'Error processing email:',
    unknownRecipient: 'Unknown recipient',
  },
  ja: {
    unknownSender: '不明な送信者',
    noSubject: '件名なし',
    unknownDate: '日時不明',
    noContent: '本文なし',
    newEmailReceived: '新しいメールを受信しました',
    from: '送信者',
    to: '宛先',
    received: '受信日時',
    truncated: '...(以下省略)',
    viaCloudflare: 'Cloudflare Email Routing経由',
    serviceRunning: 'Email to Discord転送サービスが稼働中です。Cloudflare Email Routingからのメールを処理します。',
    errorProcessing: 'メール処理中にエラーが発生しました:',
    unknownRecipient: '不明な宛先',
  },
};

export default {
  // Email handler
  async email(message: EmailMessage, env: Env, ctx: ExecutionContext): Promise<void> {
    try {
      // Determine language (default to English if not set)
      const lang = env.LANGUAGE === 'ja' ? 'ja' : 'en';
      const t = translations[lang];
      const locale = lang === 'ja' ? 'ja-JP' : 'en-US';

      // Forward email to additional email addresses if configured
      if (env.FORWARD_EMAIL_ADDRESSES) {
        const emailAddresses = env.FORWARD_EMAIL_ADDRESSES.split(',').map((email) => email.trim());
        for (const email of emailAddresses) {
          if (email) {
            await message.forward(email);
          }
        }
      }

      // Parse email content
      const rawEmail = await streamToString(message.raw);
      const parsedEmail = await simpleParser(rawEmail);

      // Format email information
      const from = parsedEmail.from?.text || t.unknownSender;
      const subject = parsedEmail.subject || t.noSubject;
      const date = parsedEmail.date?.toLocaleString(locale) || t.unknownDate;
      const textContent = parsedEmail.text || t.noContent;
      const to = message.to || t.unknownRecipient;

      // Create Discord message
      const discordMessage = {
        content: `**${t.newEmailReceived}**`,
        embeds: [
          {
            title: subject,
            description: textContent.length > 4000 ? textContent.substring(0, 4000) + t.truncated : textContent,
            color: 0x00bfff,
            fields: [
              { name: t.from, value: from, inline: true },
              { name: t.to, value: to, inline: true },
              { name: t.received, value: date, inline: true },
            ],
            footer: { text: t.viaCloudflare },
          },
        ],
      };

      // Post to Discord webhook
      await fetch(env.DISCORD_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(discordMessage),
      });
    } catch (error) {
      const lang = env.LANGUAGE === 'ja' ? 'ja' : 'en';
      console.error(`${translations[lang].errorProcessing}`, error);
    }
  },

  // HTTP request handler (returns simple response)
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const lang = env.LANGUAGE === 'ja' ? 'ja' : 'en';
    return new Response(translations[lang].serviceRunning);
  },
};

// Utility function to convert ReadableStream to String
async function streamToString(stream: ReadableStream): Promise<string> {
  const reader = stream.getReader();
  let result = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    result += new TextDecoder().decode(value);
  }

  return result;
}
