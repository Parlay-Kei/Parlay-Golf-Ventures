# Parlay Golf Ventures Platform Architecture Overview

This document provides a comprehensive overview of the Parlay Golf Ventures platform architecture, including site structure, user experience flows, and technical implementation details.

## Contents

1. [Site Structure Map](./site-structure-map.md) - Visual representation of the platform's pages and sections
2. [User Experience Flow Map](./user-experience-flow-map.md) - Diagram of user navigation paths through the platform
3. [Technical Architecture Map](./technical-architecture-map.md) - Overview of the technical components and their relationships

## Platform Summary

The Parlay Golf Ventures platform is a comprehensive golf education and community platform with three main areas:

- **Public Area**: Accessible to all visitors, featuring marketing content, free resources, and authentication
- **Member Area**: Accessible to logged-in users, providing personalized dashboard, profile management, and premium content
- **Admin Area**: Restricted to administrators, offering platform management tools, analytics, and settings

## Key Features

### For Users
- Academy content access with short game secrets
- Tournament participation
- Community engagement
- Profile management
- Membership management
- Content contribution

### For Administrators
- Comprehensive dashboard with real-time statistics
- User management tools
- Content moderation and publishing
- Analytics and reporting
- System settings and configuration
- Beta program management

## Technical Implementation

### Frontend
- React with TypeScript
- React Router for navigation
- Code splitting and lazy loading for performance
- Suspense for improved loading experience

### Backend
- Supabase for database and authentication
- Express server for SSR capabilities
- Vite for development and build optimization

### Performance Optimizations
- Selective server-side rendering
- Component-level code splitting
- Mock data for development and fallbacks
- Error boundaries and graceful degradation

## Recent Enhancements

- Improved admin dashboard with modern UI and comprehensive metrics
- Enhanced routing structure with optimized Suspense usage
- Implemented mock data system for development and error handling
- Fixed navigation issues for admin routes

## Future Development Areas

- Enhanced analytics capabilities
- Expanded user management features
- Content moderation workflow improvements
- Tournament management tools
- Performance monitoring and optimization
