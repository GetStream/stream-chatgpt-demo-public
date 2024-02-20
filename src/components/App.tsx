'use client';

import { useMemo } from 'react';
import type { User } from 'stream-chat';
import {
  Channel,
  ChannelHeader,
  Chat,
  MessageInput,
  MessageList,
  Thread,
  Window,
} from 'stream-chat-react';
import { useCreateChatClient } from '@/hooks/useCreateChatClient';
import { StreamedMessage } from '@/components/StreamedMessage';
import { ChannelListWithSearch } from '@/components/ChannelListWithSearch';

export const App = (props: {
  apiKey: string;
  token: string;
  userId: string;
  userName: string;
}) => {
  const { apiKey, token, userId, userName } = props;

  const user: User = useMemo(
    () => ({
      id: userId,
      name: userName,
      image: `https://getstream.io/random_png/?name=${userName}`,
    }),
    [userId, userName],
  );

  const client = useCreateChatClient({
    apiKey,
    tokenOrProvider: token,
    userData: user,
  });

  if (!client) return <div>Setting up client & connection...</div>;

  return (
    <div id="root" className="str-chat">
      <Chat client={client}>
        <ChannelListWithSearch userId={userId} />
        <Channel>
          <Window>
            <ChannelHeader />
            <MessageList
              markReadOnScrolledToBottom={true}
              Message={StreamedMessage}
            />
            <MessageInput />
          </Window>
          <Thread />
        </Channel>
      </Chat>
    </div>
  );
};
