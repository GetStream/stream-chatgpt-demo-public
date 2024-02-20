## Getting Started

1. Clone the repository
2. Run `yarn install` to install the dependencies
3. Create a `.env.local` file, copy the contents of `.env.example` and fill in the required values
4. Run `yarn dev` to start the development server
5. With Ngrok, create a tunnel to the development server - `ngrok http 3000`
6. In Stream's dashboard, update the webhook URL to the ngrok URL: `https://<ngrok-url>/api/webhook`
7. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
