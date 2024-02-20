import { Event, ExtendableGenerics, StreamChat } from 'stream-chat';
import { NextRequest, NextResponse } from 'next/server';
import { startAiBotStreaming } from '@/app/api/webhook/OpenAI';

const STREAM_API_KEY = process.env.STREAM_API_KEY as string;
const STREAM_API_SECRET = process.env.STREAM_SECRET_KEY as string;

if (!STREAM_API_KEY || !STREAM_API_SECRET) {
  throw new Error('Missing Stream API key or secret');
}

export async function GET(): Promise<NextResponse> {
  return new NextResponse('Hello world!', {
    headers: {
      'content-type': 'text/plain',
    },
  });
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const client = StreamChat.getInstance(STREAM_API_KEY, STREAM_API_SECRET);

  const rawBody = await request.text();
  const isValid = client.verifyWebhook(
    rawBody,
    request.headers.get('x-signature')!,
  );
  if (!isValid) {
    console.error('Webhook error: Invalid signature');
    return new NextResponse('Invalid signature', { status: 401 });
  }

  const body = JSON.parse(rawBody);
  if (!body) {
    console.error('Webhook error: Invalid JSON');
    return new NextResponse('Invalid JSON', { status: 400 });
  }

  const event = body as Event<ExtendableGenerics>;
  if (event.type !== 'message.new' && event.user_id !== 'ai-assistant') {
    // we are interested only in new messages, from regular users
    return new NextResponse(null, { status: 200 });
  }

  const channel = client.channel(event.channel_type!, event.channel_id!);
  const prompt = event.message?.text;

  if (channel && prompt) {
    // start GPT-3.5 streaming in async mode
    await startAiBotStreaming(client, channel, prompt).catch((error) => {
      console.error('An error occurred', error);
    });
  }

  return new NextResponse(null, { status: 200 });
}
