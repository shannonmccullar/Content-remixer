# Content Remixer

A modern web application that takes long-form text content and remixes it into various short-form formats using AI.

## Features

- 📝 Paste long-form text content
- 🤖 AI-powered content remixing
- 📱 Multiple output formats (summary, social media, bullet points)
- ⚡ Fast development with Vite
- 🎨 Beautiful UI with TailwindCSS
- 🔒 Type-safe with TypeScript

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **TypeScript** - Type safety
- **TailwindCSS** - Styling
- **Axios** - HTTP client
- **OpenAI API** - AI content generation
- **Vercel** - Deployment (planned)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- OpenAI API key

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd content-remixer
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp env.example .env.local
```

Edit `.env.local` and add your OpenAI API key:
```
VITE_OPENAI_API_KEY=your_actual_api_key_here
```

4. Start the development server:
```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:5173`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Usage

1. Paste your long-form text content into the text area
2. Click "Remix Content" to generate short-form versions
3. View the AI-generated remixed content in the output section

## Project Structure

```
src/
├── components/     # React components
├── services/       # API services
├── types/          # TypeScript type definitions
├── App.tsx         # Main application component
└── index.css       # Global styles (TailwindCSS)
```

## Deployment

This project is configured for easy deployment on Vercel:

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add your environment variables in Vercel dashboard
4. Deploy!

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License
