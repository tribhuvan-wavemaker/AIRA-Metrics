# AIRA-Metrics

LLM Analytics Dashboard with Google Sign-In authentication.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up Google OAuth:
   - Go to the [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Enable the Google Identity API
   - Create OAuth 2.0 credentials
   - Add the following to authorized JavaScript origins:
     - `http://localhost:5173` (for development)
     - `https://localhost:5173` (for HTTPS development)
     - Your production domain (for deployment)
     - `https://tribhuvan-wavemaker-fdlv.bolt.host` (for your deployed site)
   - Add the following to authorized redirect URIs:
     - `http://localhost:5173` (for development)
     - `https://localhost:5173` (for HTTPS development)
     - Your production domain (for deployment)
     - `https://tribhuvan-wavemaker-fdlv.bolt.host` (for your deployed site)

3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Add your Google Client ID to the `.env` file:
   ```
   VITE_GOOGLE_CLIENT_ID=276152746915-66md18k2d09glv5qia1dm6euh0gmqts6.apps.googleusercontent.com
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

## Features

- Google Sign-In authentication
- Real-time session monitoring
- Interactive analytics dashboard
- User and project filtering
- Session detail views
- Responsive design

## Environment Variables

- `VITE_GOOGLE_CLIENT_ID`: Your Google OAuth client ID
- `VITE_API_BASE_URL`: Base URL for the analytics API
