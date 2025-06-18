# Parlay Golf Ventures Platform

## Project Overview

Parlay Golf Ventures (PGV) is a golf-focused educational and community platform designed to help golf enthusiasts improve their skills and connect with others in the golfing community.

## Key Features

### Academy Content
Provides educational content for golfers of all skill levels, including:
- Short game secrets
- Swing techniques
- Course management strategies
- Mental game improvement

### Community Feed
The Community Feed allows users to connect with other golfers, share their experiences, and engage in discussions. Key features include:
- Creating text posts to share with the community
- Liking posts from other users
- Commenting on posts to engage in discussions
- Sorting posts by latest, popular, or trending

### Subscription Tiers
Three subscription tiers with different access levels:
- Driven
- Aspiring
- Breakthrough

### User Contributions
Users can contribute content based on their role:
- Members: Swing videos, tutorial topics, personal stories
- Guests: Swing demos, ideas
- Mentors: Swing breakdowns, AI tutorials
- Content Creators: Edited clips, commentary, gear reviews, community highlights

### Beta Program
Manage beta access with:
- Invite code generation
- Beta user tracking
- Feedback collection

## Development

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account and project

### Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` and fill in your Supabase credentials
4. Run the development server: `npm run dev`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test` - Run tests
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run verify-supabase` - Verify Supabase tables and connection
- `npm run type-check` - Run TypeScript type checking

### Database Verification

To verify your Supabase connection and tables:

```bash
npm run verify-supabase
```

This script will:
- Test connection to Supabase
- Check authentication
- Verify all tables exist and are accessible
- Show sample data from each table
- Provide troubleshooting tips if issues are found

## Development Setup

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory
cd parlay-golf-ventures

# Step 3: Install the necessary dependencies
npm i

# Step 4: Start the development server
npm run dev
```

## Database Setup

This project uses Supabase for the database. To set up the required tables:

1. Create a Supabase project
2. Execute the SQL migration scripts in the `supabase/migrations` directory
3. Set up the appropriate environment variables in `.env`

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
VITE_STRIPE_SECRET_KEY=your_stripe_secret_key
VITE_ENABLE_ERROR_MONITORING=true
```

## Testing

This project uses Vitest and React Testing Library for automated testing. The testing setup includes:

- Unit tests for individual components and utilities
- Integration tests for component interactions
- Test coverage reporting

### Running Tests

To run tests, use the following commands:

```sh
# Run all tests
npm test

# Run tests in watch mode (for development)
npm run test:watch

# Generate test coverage report
npm run test:coverage

# Run specific test types
npm run test:unit
npm run test:integration
npm run test:e2e
```

### Test Structure

Tests are organized alongside the components and utilities they test:

- Component tests: `src/components/*/ComponentName.test.tsx`
- Utility tests: `src/lib/utils/utilityName.test.ts`

### Writing Tests

Use the test utilities provided in `src/test/utils.tsx` to render components with all necessary providers:

```tsx
import { render, screen } from '@/test/utils';
import { YourComponent } from './YourComponent';

describe('YourComponent', () => {
  it('should render correctly', () => {
    render(<YourComponent />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

## Contributing

Please follow the established code style and patterns when contributing to this project.
