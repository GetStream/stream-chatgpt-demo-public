import { StreamChat } from 'stream-chat';
import { App } from '@/components/App';

const STREAM_API_KEY = process.env.STREAM_API_KEY as string;
const STREAM_API_SECRET = process.env.STREAM_SECRET_KEY as string;

type Props = {
  searchParams: { [key: string]: string | undefined };
};

export default async function Home({ searchParams: params }: Props) {
  async function createToken(userId: string) {
    'use server';

    const client = StreamChat.getInstance(STREAM_API_KEY, STREAM_API_SECRET);
    const now = Date.now() / 1000;
    return client.createToken(userId, Math.round(now + 3 * 60 * 60)); // 3 hours
  }

  const userId = params['user_id'] || 'oliverlazoroski';
  const userName = params['user_name'] || 'Oliver Lazoroski';
  const token = await createToken(userId);

  return (
    <App
      apiKey={STREAM_API_KEY}
      token={token}
      userId={userId}
      userName={userName}
    />
  );
}
