import OpenAI from 'openai';
import { Channel, StreamChat } from 'stream-chat';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
  throw new Error('Please provide OPENAI_API_KEY env variable');
}

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

async function* chatGptGenerator(prompt: string) {
  const completion = await openai.completions.create(
    {
      prompt,
      model: 'gpt-3.5-turbo-instruct',
      max_tokens: 300,
      temperature: 0.7,
      stream: true,
    },
    { stream: true },
  );

  for await (const chunk of completion) {
    for (const choice of chunk.choices) {
      const chunk = choice.text;
      yield chunk;
    }
  }
}

async function* staticGenerator() {
  const response =
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. ' +
    'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. ' +
    'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris ' +
    'nisi ut aliquip ex ea commodo consequat. ' +
    'Duis aute irure dolor in reprehenderit in voluptate velit esse ' +
    'cillum dolore eu fugiat nulla pariatur. ' +
    'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui ' +
    'officia deserunt mollit anim id est laborum.';

  const chunks = response.match(/.{1,50}/g) || [];
  for (const chunk of chunks) {
    yield chunk;
  }
}

export async function startAiBotStreaming(
  client: StreamChat,
  channel: Channel,
  prompt: string,
) {
  // 1. create an empty message and mark it with 'isGptStreamed' custom property
  const message = await channel.sendMessage({
    user_id: 'ai-assistant',
    type: 'regular',
    // 1.1 flag to indicate the ui to render a streamed message
    isGptStreamed: true,
  });

  // give some time for the ui to render the streamed message
  // and attaches the event listeners
  await sleep(300);

  // 2. Listen for new response chunks from GPT. Send them as custom events
  // to the UI once they become available.
  let text = '';
  const useStatic = prompt === 'lorem';
  const chunks = useStatic ? staticGenerator() : chatGptGenerator(prompt);
  for await (const chunk of chunks) {
    await channel.sendEvent({
      // @ts-expect-error - non-standard event, StreamedMessage subscribes to it
      type: 'gpt_chunk',
      user_id: 'ai-assistant',
      message_id: message.message.id,
      chunk,
    });
    text += chunk;
  }

  // 3. Once chunks are sent and full response (text) is aggregated,
  // update the message created in step 1 to include the full response.
  // This way, the response will be stored in the Stream API, and we can
  // use it later without having to go to ChatGPT again.
  await client.updateMessage(
    {
      id: message.message.id,
      // 3.1 flag to indicate the ui to stop rendering the streamed message
      isGptStreamed: false,
      // 3.2 store the full text in the message
      text,
    },
    'ai-assistant',
  );
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
