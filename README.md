# Coach-Athlete Workout Management App

A professional workout management platform connecting coaches and athletes. Create, assign, and track workouts with ease.

## Features

### Coach Dashboard
- **Athlete Management**: Add and invite athletes to your program
- **Workout Builder**: Create custom workouts with exercise library
- **Assignment System**: Schedule workouts for specific athletes
- **Progress Tracking**: Monitor athlete completion rates and performance
- **Exercise Library**: Comprehensive database with instructions

### Athlete Portal
- **Workout Calendar**: View assigned workouts by date
- **Exercise Details**: Clear instructions and demonstrations
- **Progress Logging**: Mark exercises complete and log performance
- **History Tracking**: View past workout records
- **Mobile Optimized**: Perfect for gym use

## Tech Stack

- **Framework**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS + Lucide Icons
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with credentials
- **Deployment**: Vercel

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd coach-athlete-app
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.local.example .env.local
# Edit .env.local with your database credentials
```

4. Set up the database
```bash
npx prisma migrate dev
npx prisma generate
npm run db:seed
```

5. Start the development server
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## Demo Accounts

### Coach Account
- Email: `coach@demo.com`
- Password: `password`

### Athlete Account
- Email: `athlete@demo.com`
- Password: `password`

## Deployment

### Vercel Deployment

1. Install Vercel CLI
```bash
npm i -g vercel
```

2. Deploy to Vercel
```bash
vercel
```

3. Set up Vercel Postgres
```bash
vercel storage create postgres
```

4. Configure environment variables in Vercel dashboard:
   - `NEXTAUTH_SECRET`: Generate with `openssl rand -base64 32`
   - `NEXTAUTH_URL`: Your production domain
   - `DATABASE_URL`: Provided by Vercel Postgres

5. Run database migrations in production:
```bash
npx prisma migrate deploy
npm run db:seed
```

## Project Structure

```
src/
├── app/                 # Next.js App Router
│   ├── api/            # API routes
│   ├── auth/           # Authentication pages
│   ├── dashboard/      # Main application
│   └── globals.css     # Global styles
├── components/         # React components
│   ├── dashboard/      # Dashboard components
│   └── providers/      # Context providers
├── lib/                # Utilities
│   ├── auth.ts         # NextAuth configuration
│   └── prisma.ts       # Database client
└── types/              # TypeScript definitions
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.