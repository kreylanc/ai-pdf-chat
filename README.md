# AI PDF Chat - Fullstack Saas Platform

Chat with your documents in seconds with the help of AI.

[![Frontend Roadmap](https://github.com/kreylanc/ai-pdf-chat/assets/50169945/030c45c7-e215-410f-863f-69761b212df4)](https://ai-pdf-chat.vercel.app/)

## Tech Stack

- **Framework:** [Next.js](https://nextjs.org)
- **Styling:** [Tailwind CSS](https://tailwindcss.com)
- **Authentication and User Management:** [Kinde](https://kinde.com/)
- **UI Component:** [shadcn/ui](https://ui.shadcn.com)
- **ORM:** [Prisma](https://www.prisma.io/)
- **Database:** [PlanetScale](https://planetscale.com/)
- **Typesafety:** [tRPC](https://trpc.io/)
- **Validation:** [zod](https://zod.dev/)
- **File Uploads:** [uploadthing](https://uploadthing.com)
- **Payments infrastructure:** [Stripe](https://stripe.com)
- **Vector DB:** [Pinecone](https://www.pinecone.io/)
- **LLM Integration:** [Langchain](https://www.langchain.com/)

## Features

- 🛠️ Complete SaaS Built From Scratch
- 💻 Beautiful Landing Page & Pricing Page Included
- 💳 Free & Pro Plan Using Stripe
- 📄 A Beautiful And Highly Functional PDF Viewer
- 🔄 Streaming API Responses in Real-Time
- 🔒 Authentication Using Kinde
- 🎨 Clean, Modern UI Using 'shadcn-ui'
- 🚀 Optimistic UI Updates for a Great UX
- ⚡ Infinite Message Loading for Performance
- 📤 Intuitive Drag n’ Drop Uploads
- ✨ Instant Loading States
- 🔧 Modern Data Fetching Using tRPC & Zod
- 🧠 LangChain for Infinite AI Memory
- 🌲 Pinecone as our Vector Storage
- 📊 Prisma as our ORM
- 🔤 100% written in TypeScript
- 🎁 ...much more

## Screenshots

**Dashboard Page**

![dashboard](https://github.com/kreylanc/ai-pdf-chat/assets/50169945/b3db5134-fea6-4cf2-85b6-b5be8305ac5b)

**PDF Rendering and Chat Page**

- Desktop view

![chat and pdf view](https://github.com/kreylanc/ai-pdf-chat/assets/50169945/1c7a18b9-f640-4a75-b951-0d298f0f3329)

- Mobile View

![image](https://github.com/kreylanc/ai-pdf-chat/assets/50169945/27b8c3c9-a9ae-4df3-8c1c-5f2467a1a81a)


## Running Locally

1. Clone the repository

```bash
git clone https://github.com/kreylanc/ai-pdf-chat.git
```

2. Install dependencies using pnpm (or delete the pnpm-lock file and use any other package manager)

```bash
pnpm install
```

3. Add the following variables to your .env file

```bash
# Variables from Kinde
KINDE_CLIENT_ID=
KINDE_CLIENT_SECRET=
KINDE_ISSUER_URL=https://<KINDE-PROJECT-NAME>.kinde.com
KINDE_SITE_URL=http://localhost:3000
KINDE_POST_LOGOUT_REDIRECT_URL=http://localhost:3000
KINDE_POST_LOGIN_REDIRECT_URL=http://localhost:3000/dashboard

# Database URL from PlanetScale for Prisma
DATABASE_URL=

# Uploadthing for storing PDF files
UPLOADTHING_SECRET=
UPLOADTHING_APP_ID=

# OpenAI for language model
OPENAI_API_KEY=

# Stripe for payment processing
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Pinecone for long-term vector storage
PINECONE_API_KEY=
PINECONE_ENVIRONMENT=
```

4. Push the schema to database

```bash
npx prisma db push
```

5. Start the development server

```bash
pnpm dev
```

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
