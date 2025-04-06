/**
 * Cloudflare Worker for Email to Discord forwarding
 *
 * - This worker receives emails from Cloudflare Email Routing and forwards them to Discord
 * - You need to set up a Discord webhook and configure the DISCORD_WEBHOOK_URL environment variable
 */

import { simpleParser } from 'mailparser';

export interface Env {
	// Discord webhook environment variable
	DISCORD_WEBHOOK_URL: string;
}

// Cloudflare email-related type definitions
interface EmailMessage {
	readonly from: string;
	readonly to: string;
	readonly headers: Headers;
	readonly raw: ReadableStream;
}

export default {
	// Email handler
	async email(message: EmailMessage, env: Env, ctx: ExecutionContext): Promise<void> {
		try {
			// Parse email content
			const rawEmail = await streamToString(message.raw);
			const parsedEmail = await simpleParser(rawEmail);

			// Format email information
			const from = parsedEmail.from?.text || 'Unknown sender';
			const subject = parsedEmail.subject || 'No subject';
			const date = parsedEmail.date?.toLocaleString('en-US') || 'Unknown date';
			const textContent = parsedEmail.text || 'No content';

			// Create Discord message
			const discordMessage = {
				content: `**New Email Received**`,
				embeds: [
					{
						title: subject,
						description: textContent.length > 4000 ? textContent.substring(0, 4000) + '...(truncated)' : textContent,
						color: 0x00bfff,
						fields: [
							{ name: 'From', value: from, inline: true },
							{ name: 'Received', value: date, inline: true },
						],
						footer: { text: 'Via Cloudflare Email Routing' },
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
			console.error('Error processing email:', error);
		}
	},

	// HTTP request handler (returns simple response)
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		return new Response('Email to Discord forwarding service is running. Processing emails from Cloudflare Email Routing.');
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
