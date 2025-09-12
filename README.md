
# Code Yapp: Private & Ephemeral Chat

Code Yapp is a real-time chat application with a strong focus on privacy, security, and developer collaboration. It provides temporary, anonymous chat rooms that are automatically deleted after 2 hours, ensuring that your conversations leave no trace.

## Core Features

- **Ephemeral Chat Rooms**: Every room and its contents are permanently deleted 2 hours after creation.
- **Anonymous & Secure**: No sign-up required. Users are assigned random anonymous names. Rooms can be public or private (password-protected).
- **Developer Focused**: Automatic programming language detection and syntax highlighting for code snippets shared in the chat.
- **Real-Time Experience**: See new messages, active user lists, and typing indicators instantly.
- **Admin Controls**: The first person to join a room becomes the admin, with the ability to kick users or delete the room.
- **Progressive Web App (PWA)**: Installable on both mobile and desktop for a native-like experience.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Database**: [Redis](https://redis.io/) for high-speed, ephemeral data storage.
- **Real-time Engine**: [Server-Sent Events (SSE)](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events) for pushing live updates from the server.
- **AI**: [Genkit](https://firebase.google.com/docs/genkit) with Google's Gemini model for language detection.
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with [ShadCN UI](https://ui.shadcn.com/) components.
- **Deployment**: Configured for [Firebase App Hosting](https://firebase.google.com/docs/app-hosting).

---

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

You will need the following software installed on your machine:

- [Node.js](https://nodejs.org/) (v20 or later)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Redis](https://redis.io/docs/latest/operate/oss_and_stack/install/): You need a Redis instance running. You can install it locally or use a cloud provider like [Redis Cloud](https://redis.com/try-free/).

### Installation & Setup

1.  **Clone the Repository**
    ```bash
    git clone <your-repository-url>
    cd <repository-folder>
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Set Up Environment Variables**

    Create a `.env` file in the root of your project by copying the example:
    
    Now, open the `.env` file and add the following required variables:

    ```env
    # The connection URL for your Redis instance.
    # If you are running Redis locally, the default is usually:
    REDIS_URL="redis://127.0.0.1:6379"

    # Your API key for Google's Gemini model.
    # Get this from Google AI Studio: https://aistudio.google.com/app/apikey
    GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
    ```

### Running the Application

This project requires two terminal sessions to run concurrently: one for the Next.js frontend and one for the Genkit AI service.

1.  **Terminal 1: Start the Genkit Service**

    This command starts the Genkit service that handles AI-powered language detection.
    ```bash
    npm run genkit:watch
    ```
    Keep this terminal running. It will watch for changes in your AI flows.

2.  **Terminal 2: Start the Next.js Development Server**

    This command starts the main web application.
    ```bash
    npm run dev
    ```

3.  **Open the App**

    Open your browser and navigate to `http://localhost:9002`. You should now see the Code Yapp homepage.

You are all set! You can now create rooms, send messages, and test the application in your local environment.
