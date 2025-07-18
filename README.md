# 1012 Run Club Website

A modern, responsive website for 1012 Run Club built with Next.js, TypeScript, and Tailwind CSS.

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

1. Navigate to the website directory:

```bash
cd website
```

2. Install dependencies:

```bash
npm install
```

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the website.

## Project Structure

```
website/
├── src/
│   ├── app/           # App Router pages
│   │   ├── layout.tsx # Root layout
│   │   ├── page.tsx   # Home page
│   │   └── globals.css
│   └── components/    # Reusable components
│       ├── Navigation.tsx
│       ├── EventCard.tsx
│       └── FeatureCard.tsx
├── public/           # Static assets
├── package.json
└── next.config.ts
```

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Deployment

This website can be easily deployed to platforms like:

- Vercel (recommended for Next.js)
- Netlify
- GitHub Pages
- Any static hosting service

## Contributing

Feel free to contribute to improve the website for 1012 Run Club!
