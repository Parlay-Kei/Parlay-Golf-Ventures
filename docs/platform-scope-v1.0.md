# Parlay Golf Ventures (PGV) Platform - Scope Document

**Version: 1.0**  
**Date: April 18, 2025**

## 1. Introduction

This document provides a comprehensive overview of the Parlay Golf Ventures (PGV) platform in its current state. It serves as a reference for understanding the system architecture, features, and components, as well as a baseline for tracking future changes and enhancements.

### 1.1 Platform Overview

Parlay Golf Ventures is a comprehensive golf education and community platform designed to help golfers of all skill levels improve their game through structured learning paths, expert guidance, and community interaction. The platform offers tiered subscription plans with varying levels of access to premium content and features.

### 1.2 Target Audience

- Golf enthusiasts of all skill levels
- Aspiring professional golfers
- Golf coaches and instructors
- Golf community members seeking connection with fellow players

## 2. Core Components

### 2.1 Authentication System

- **Technology**: Supabase Auth
- **Features**:
  - Email/password authentication
  - Social login options
  - Password reset functionality
  - Email verification
  - Session management
  - Protected routes for authenticated users

### 2.2 Database

- **Technology**: PostgreSQL via Supabase
- **Key Tables**:
  - `profiles`: User profile information
  - `subscriptions`: User subscription details
  - `customers`: Stripe customer information
  - `payment_methods`: User payment methods
  - `invoices`: Billing history
  - `community_posts`: Community feed posts
  - `post_likes`: Post likes tracking
  - `post_comments`: Post comments
  - `content_categories`: Content categorization
  - `search_view`: Combined view for content search
  - `courses`: Course information
  - `lessons`: Lesson content
  - `user_lesson_progress`: Tracking user progress through lessons
  - `user_course_progress`: Tracking user progress through courses
  - `content_tags`: Content tagging for search
  - `popular_tags`: Frequently used tags
  - `content_notifications`: User notifications for upcoming content

### 2.3 Frontend

- **Framework**: React with TypeScript
- **Build Tool**: Vite
- **UI Components**: Custom components built with Shadcn/UI
- **Styling**: Tailwind CSS
- **State Management**: React Context API and local state
- **Routing**: React Router

### 2.4 API Layer

- **Backend**: Supabase Functions and REST API
- **Authentication**: JWT-based authentication
- **Data Access**: Row-Level Security (RLS) policies

### 2.5 Payment Processing

- **Provider**: Stripe
- **Features**:
  - Subscription management
  - Payment processing
  - Webhook handling for subscription events
  - Customer portal integration
  - Invoice management
  - Payment method management

## 3. Feature Inventory

### 3.1 User Management

#### 3.1.1 Authentication
- Sign up with email/password
- Login with email/password
- Password reset functionality
- Email verification
- Session persistence

#### 3.1.2 User Profile
- View and edit personal information
- Change password
- Upload and manage avatar
- View subscription status

### 3.2 Content Access

#### 3.2.1 Academy
- Short Game Secrets course
- Lesson tracking
- Content organization by categories
- Tier-based content access restrictions

#### 3.2.2 Coming Soon
- Preview of upcoming content
- Visual indicators for content accessibility based on subscription tier

### 3.3 Subscription Management

#### 3.3.1 Subscription Plans
- Multiple tier options (Free, Driven, Aspiring, Breakthrough)
- Feature comparison chart
- Pricing information

#### 3.3.2 Checkout Process
- Stripe integration
- Secure payment processing
- Subscription status tracking

#### 3.3.3 Billing Management
- View subscription details
- Cancel subscription
- View payment methods
- Access billing history
- View invoices

### 3.4 Dashboard

- Quick access to key platform features
- Progress tracking
- Subscription status display
- Recommended content

### 3.5 Community Features

#### 3.5.1 Community Feed
- View community posts
- Create new posts
- Like/unlike posts
- Comment on posts
- Sort posts by latest, popular, or trending
- Pagination with load more functionality

### 3.6 Search Functionality

- Search across all content types
- Filter by content type, tier, category, and tags
- Enhanced search results with visual cards
- Highlighting of search terms in results
- Pagination of search results

## 4. User Flows

### 4.1 Onboarding

1. User discovers platform
2. User signs up for an account
3. User verifies email
4. User completes profile information
5. User selects subscription tier
6. User completes payment process
7. User gains access to tier-specific content

### 4.2 Content Consumption

1. User navigates to Academy section
2. User browses available content
3. User selects content to view
4. System checks user's subscription tier
5. If accessible, content is displayed
6. If not accessible, user is prompted to upgrade subscription

### 4.3 Community Interaction

1. User navigates to Community section
2. User views existing posts
3. User can create new posts, like posts, or comment on posts
4. User can sort posts by different criteria

## 5. Technical Architecture

### 5.1 Frontend Architecture

- **Component Structure**: Modular components organized by feature
- **State Management**: Context providers for auth, features, and global state
- **Routing**: Nested routes with protected paths for authenticated content
- **API Integration**: Custom API modules for different data domains

### 5.2 Backend Architecture

- **Database Design**: Relational schema with foreign key relationships
- **Security**: Row-Level Security policies for data protection
- **API Design**: RESTful endpoints with consistent error handling

### 5.3 Deployment

- **Hosting**: Web application deployed to cloud hosting
- **Database**: Supabase PostgreSQL instance
- **CI/CD**: Automated deployment pipeline (planned)

## 6. Current Limitations and Known Issues

- Mobile responsiveness improvements needed in some areas
- Limited analytics for user behavior tracking
- Webhook testing in local development environment

## 7. Future Roadmap

### 7.1 Short-term (Next 3 Months)

- Enhance mobile responsiveness across all pages
- Add user analytics tracking
- Improve content recommendation algorithm
- Add support for image uploads in community posts

### 7.2 Medium-term (3-6 Months)

#### Phase 2.5: Secure & Fortify
- Add submission rate-limiting to prevent spam
- Enable email notifications (on approve/reject)
- Setup basic error monitoring (e.g., Sentry or LogRocket)
- Implement detailed content view pages for individual contributions
- Add user engagement metrics tracking

#### Phase 3A: User Experience Expansion
- Convert feed into mobile-first PWA or lightweight native app
- Add likes, shares, comment threads
- Let users follow contributors for updates
- Enhance media handling with direct file uploads
- Implement notification system for content updates

#### Phase 3B: Monetization & Creator Tools
- Enable tip jars (Stripe Connect for creators)
- Build creator dashboard for submissions, views, followers
- Offer paid "Boost" to push great content to front page
- Implement advanced search functionality for the Community Content Hub
- Create a moderation system for community content

### 7.3 Long-term (6+ Months)

- Implement live streaming capabilities
- Develop mobile applications
- Create an instructor marketplace
- Implement AI-driven swing analysis

## 8. Appendix

### 8.1 Technology Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS, Shadcn/UI
- **Backend**: Supabase, PostgreSQL
- **Authentication**: Supabase Auth
- **Payment Processing**: Stripe
- **Hosting**: Cloud hosting platform

### 8.2 Key Dependencies

- `@tanstack/react-query`: Data fetching and caching
- `react-router-dom`: Routing
- `framer-motion`: Animations
- `date-fns`: Date formatting
- `lucide-react`: Icon library

### 8.3 Environment Variables

- `VITE_SUPABASE_URL`: Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Supabase anonymous key
- `VITE_STRIPE_PUBLIC_KEY`: Stripe public key

---

## Document Revision History

| Version | Date | Description |
|---------|------|-------------|
| 1.0 | April 18, 2025 | Initial document creation |

---

*This document is maintained by the Parlay Golf Ventures (PGV) development team and should be updated as the platform evolves.*
