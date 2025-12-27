
# Grandmaster AI Chess ♟️

A sophisticated 3D-styled chess experience featuring drag-and-drop mechanics and an advanced AI opponent powered by **Google Gemini**.

![Chess Board](https://images.unsplash.com/photo-1529699211952-734e80c4d42b?q=80&w=2071&auto=format&fit=crop)

## Features

- **Gemini Powered AI**: Play against an AI that adapts its strategy based on board state.
- **3D Visuals**: Custom CSS-based 3D piece rendering and board perspective.
- **AI Advisor**: Ask the Grandmaster for tactical advice and move explanations during your turn.
- **Move History**: Full standard algebraic notation ledger.
- **Responsive Design**: Works on desktop and tablets.
- **Presentation deck**: Take a look at the deck **Play_Chess_with_AI_deck** to get a feel of the gameplay and key features!

## Prerequisites

- Node.js (v18 or higher)
- A Google Cloud / AI Studio API Key with access to `gemini-3-flash-preview`.

## Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/Play_Chess_with_AI.git
   cd Play_Chess_with_AI
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure API Key**
   
   *   Rename the `.env.example` file to `.env`.
   *   Open `.env` and paste your Gemini API Key.
   
   ```env
   API_KEY=AIzaSy...YourKeyHere
   ```
   
   > **Note:** The API key is never sent to a backend server (other than Google's API) but it is exposed in the client-side build. Do not host this publicly without adding backend proxy protection if you are worried about quota theft.

4. **Run the game**
   ```bash
   npm run dev
   ```

5. Open your browser to `http://localhost:5173`.

## Technologies

- React 19
- TypeScript
- Vite
- Google GenAI SDK
- Chess.js (Logic)
- TailwindCSS (Styling)

## License

MIT
