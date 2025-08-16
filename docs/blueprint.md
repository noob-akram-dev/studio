# **App Name**: CodeShare

## Core Features:

- Room Code Generation: Generate a unique 4-digit room code for sharing.
- Room Code Entry: Allow users to enter a room code to join a specific chat room.
- Real-Time Messaging: Enable real-time text messaging within a chat room.
- Syntax Highlighting: Support the ability to format and display code snippets correctly with syntax highlighting. Make a tool available to the LLM, which may be triggered or not, which determines the programming language the code is written in, so it knows which language to highlight.
- Message Display: Implement a simple UI to display messages with clear distinctions between different users. Ensure message ordering is correct.
- In-Memory Chat Storage: The code in the chatroom persists for the duration of a session, after which the cache gets cleared.
- Copy Message: Add button to enable users to easily copy the entire message of a single other user with one click.

## Style Guidelines:

- Primary color: Deep maroon (#800000) to create a sophisticated and focused coding environment.
- Background color: Light pink (#FFB6C1) to provide a soft backdrop that reduces eye strain and enhances the visibility of code snippets.
- Accent color: Rose (#FF007F) to draw attention to interactive elements, like the 'send' button and room code display, while ensuring the user knows the important parts of the display.
- Body and headline font: 'Inter', a sans-serif font known for its readability and modern aesthetic, perfect for displaying both code and conversational text.
- Code font: 'Source Code Pro' monospace font for clear and precise rendering of code snippets.
- Use minimalistic icons for actions like 'copy' and 'send'. Keep icons consistent with the overall modern style.
- Subtle transitions on UI elements, such as the appearance of new messages. These animations enhance the user experience.