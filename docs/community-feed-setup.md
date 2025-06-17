# Community Feed Setup Guide

## Overview

The Community Feed feature allows users to connect with other golfers, share their experiences, and engage in discussions. This document provides instructions for setting up the database tables required for the Community Feed functionality.

## Current Implementation Status

The Community Feed is currently implemented using a mock API for demonstration purposes. To enable the actual database functionality, you need to create the required tables in your Supabase database.

## Database Setup Instructions

### 1. Execute the SQL Script

The SQL script for creating the necessary tables is located at `db/community_tables.sql`. You can execute this script in your Supabase SQL Editor.

1. Log in to your Supabase dashboard
2. Navigate to the SQL Editor
3. Copy the contents of `db/community_tables.sql`
4. Paste into the SQL Editor and run the script

### 2. Update API Implementation

After creating the database tables, you need to switch from the mock API to the real implementation:

1. Open files that import from `community-api-mock.ts`:
   - `src/pages/Community.tsx`
   - `src/components/CommunityPost.tsx`

2. Update the import statements to use `community-api.ts` instead of `community-api-mock.ts`

## Database Schema

The Community Feed uses the following tables:

### community_posts

Stores user posts in the community feed.

```sql
CREATE TABLE IF NOT EXISTS community_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### post_likes

Stores likes on community posts.

```sql
CREATE TABLE IF NOT EXISTS post_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);
```

### post_comments

Stores comments on community posts.

```sql
CREATE TABLE IF NOT EXISTS post_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Security Considerations

The SQL script includes Row Level Security (RLS) policies to ensure proper data protection:

- Anyone can read posts, likes, and comments
- Users can only create, update, or delete their own posts, likes, and comments

## Troubleshooting

If you encounter issues with the database setup:

1. Verify that the `profiles` table exists and has the expected structure
2. Check that RLS policies are correctly applied
3. Ensure that foreign key relationships are properly established
4. Verify that the `uuid_generate_v4()` function is available in your database

## Future Enhancements

Potential enhancements for the Community Feed feature:

1. Add support for image uploads in posts
2. Implement post sharing functionality
3. Add user mentions and notifications
4. Create a moderation system for community content
5. Add topic/category tagging for posts
