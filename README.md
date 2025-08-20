# 🤖 AI Assistant with Tool Calling

A modern, full-stack AI assistant application built with Next.js 15, featuring real-time conversations, tool calling capabilities, and a beautiful glassmorphism UI design.

![AI Assistant](https://img.shields.io/badge/Next.js-15.5.0-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)
![Prisma](https://img.shields.io/badge/Prisma-5.0-2D3748?style=for-the-badge&logo=prisma)

## ✨ Features

### 🎨 **Modern UI/UX**
- **Glassmorphism Design** with backdrop blur effects
- **Responsive Layout** optimized for desktop and mobile
- **Animated Background** with floating gradient orbs
- **Dark Theme** with purple/cyan gradient accents
- **Split-screen Login** with feature showcase

### 🤖 **AI Capabilities**
- **OpenAI GPT Integration** for intelligent conversations
- **Tool Calling Support** for real-time data access
- **Context-aware Responses** with conversation history
- **Streaming Responses** for real-time interaction

### 🔧 **Built-in Tools**
- **📊 Stock Market Data** - Real-time stock prices via Alpha Vantage API
- **🌤️ Weather Information** - Current weather data via OpenWeather API
- **🏎️ Formula 1 Updates** - Race schedules and information via Ergast API

### 🔐 **Authentication & Security**
- **NextAuth.js v5** with OAuth providers
- **Google OAuth** integration
- **GitHub OAuth** integration
- **Secure session management**
- **Database-backed user sessions**

### 💾 **Data Management**
- **PostgreSQL Database** with Prisma ORM
- **Chat History** persistence
- **User Management** with profile data
- **Message Threading** and organization

## 🚀 Quick Start

### Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher)
- **npm** or **yarn** package manager
- **PostgreSQL** database
- **Git** for version control

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/ai-assistant.git
cd ai-assistant
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Environment Setup

Create a `.env.local` file in the root directory with the following variables:

```env
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/ai_assistant"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secure-secret-key-here"

# OpenAI API
OPENAI_API_KEY="sk-your-openai-api-key-here"

# OAuth Providers
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

# External APIs (Optional - for tool functionality)
OPENWEATHER_API_KEY="your-openweather-api-key"
ALPHA_VANTAGE_API_KEY="your-alpha-vantage-api-key"
```

### 4. Database Setup

Set up your PostgreSQL database and run the migrations:

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push
```

### 5. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your application running! 🎉

## 📋 Detailed Setup Guide

### Database Configuration

#### Option 1: Local PostgreSQL
1. Install PostgreSQL on your system
2. Create a new database:
   ```sql
   CREATE DATABASE ai_assistant;
   ```
3. Update `DATABASE_URL` in `.env.local` with your credentials

#### Option 2: Cloud Database (Recommended)
Use services like:
- **Vercel Postgres**
- **PlanetScale**
- **Supabase**
- **Railway**

### OAuth Provider Setup

#### Google OAuth Setup
1. Visit the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Google+ API
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client IDs**
5. Set authorized redirect URIs:
   - Development: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://yourdomain.com/api/auth/callback/google`
6. Copy Client ID and Client Secret to your `.env.local`

#### GitHub OAuth Setup
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **New OAuth App**
3. Fill in the application details:
   - **Application name**: AI Assistant
   - **Homepage URL**: `http://localhost:3000` (or your domain)
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
4. Copy Client ID and Client Secret to your `.env.local`

### External API Configuration

#### OpenAI API Key
1. Visit [OpenAI Platform](https://platform.openai.com/)
2. Create an account or sign in
3. Go to **API Keys** section
4. Generate a new API key
5. Add to your `.env.local` as `OPENAI_API_KEY`

#### Weather API (Optional)
1. Sign up at [OpenWeatherMap](https://openweathermap.org/api)
2. Get your free API key
3. Add to your `.env.local` as `OPENWEATHER_API_KEY`

#### Stock Market API (Optional)
1. Sign up at [Alpha Vantage](https://www.alphavantage.co/support/#api-key)
2. Get your free API key
3. Add to your `.env.local` as `ALPHA_VANTAGE_API_KEY`

## 🏗️ Project Structure

```
ai-assistant/
├── prisma/
│   └── schema.prisma          # Database schema
├── public/
│   └── favicon.ico           # Static assets
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/         # NextAuth endpoints
│   │   │   ├── chat/         # Chat API route
│   │   │   └── chats/        # Chat management APIs
│   │   ├── chat/
│   │   │   └── page.tsx      # Main chat interface
│   │   ├── globals.css       # Global styles
│   │   ├── layout.tsx        # Root layout
│   │   └── page.tsx          # Landing/login page
│   ├── components/
│   │   ├── chat/
│   │   │   └── ChatInterface.tsx  # Chat component
│   │   ├── ui/               # Reusable UI components
│   │   └── providers.tsx     # Context providers
│   ├── lib/
│   │   ├── tools/            # AI tool implementations
│   │   ├── auth.ts           # Authentication config
│   │   ├── db.ts             # Database client
│   │   └── utils.ts          # Utility functions
│   └── types/
│       └── next-auth.d.ts    # Type definitions
├── .env.local                # Environment variables
├── package.json
└── README.md
```

## 🛠️ Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Database
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to database
```

## 🎨 UI Components

The application uses a modern design system built with:

- **Tailwind CSS** for styling
- **Radix UI** for accessible components
- **Lucide React** for icons
- **Custom glassmorphism** effects

### Key Design Features:
- Responsive grid layouts
- Smooth animations and transitions
- Accessibility-first component design
- Dark theme with gradient accents

## 🤖 AI Tool System

The assistant supports extensible tool calling for real-time data:

### Weather Tool
```typescript
// Get current weather for any location
const weather = await getWeather("New York");
```

### Stock Market Tool
```typescript
// Get real-time stock prices
const stock = await getStockPrice("AAPL");
```

### Formula 1 Tool
```typescript
// Get upcoming F1 race information
const race = await getF1Matches();
```

### Adding Custom Tools

1. Create a new file in `src/lib/tools/`
2. Implement your tool function
3. Add tool definition to the chat API
4. Create corresponding UI component in `src/components/ui/tools/`

## 🚀 Deployment

### Vercel (Recommended)

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Deploy:
   ```bash
   vercel --prod
   ```

3. Set environment variables in Vercel dashboard

### Other Platforms

The application can be deployed to:
- **Netlify**
- **Railway**
- **DigitalOcean App Platform**
- **AWS Amplify**

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## 🔧 Configuration

### Tailwind CSS
Customize the design system in `tailwind.config.js`:

```javascript
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Your custom theme extensions
    },
  },
  plugins: [],
}
```

### Database Schema
Modify the database schema in `prisma/schema.prisma` and run:

```bash
npm run db:push
```

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Verify PostgreSQL is running
   - Check DATABASE_URL format
   - Ensure database exists

2. **OAuth Authentication Issues**
   - Verify callback URLs are correct
   - Check client ID/secret configuration
   - Ensure NEXTAUTH_SECRET is set

3. **API Key Issues**
   - Verify all API keys are valid
   - Check rate limits
   - Ensure environment variables are loaded

4. **Build Errors**
   - Clear `.next` folder: `rm -rf .next`
   - Reinstall dependencies: `npm install`
   - Check TypeScript errors: `npm run lint`

### Getting Help

- 📚 [Next.js Documentation](https://nextjs.org/docs)
- 🔐 [NextAuth.js Documentation](https://next-auth.js.org/)
- 🗄️ [Prisma Documentation](https://www.prisma.io/docs)
- 🤖 [OpenAI API Documentation](https://platform.openai.com/docs)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [OpenAI](https://openai.com/) for the GPT API
- [Vercel](https://vercel.com/) for Next.js and deployment platform
- [Prisma](https://www.prisma.io/) for the excellent ORM
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [Radix UI](https://www.radix-ui.com/) for accessible components

## 📞 Support

If you have any questions or need help with setup, please:

1. Check the [Issues](https://github.com/yourusername/ai-assistant/issues) page
2. Create a new issue with detailed information
3. Join our [Discord community](https://discord.gg/yourinvite)

---

<div align="center">
  <p>Made with ❤️ by [Your Name]</p>
  <p>⭐ Star this repo if you find it helpful!</p>
</div>