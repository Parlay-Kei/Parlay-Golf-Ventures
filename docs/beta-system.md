# Parlay Golf Ventures - Beta Access System

## Overview

The Beta Access System for Parlay Golf Ventures provides a controlled way to manage early access to the platform. It includes features for:

- Invite-only access control
- Beta user management
- Feedback collection
- Beta request handling

## Components

### 1. Beta Service

The core service that manages beta access functionality is located at:
`src/lib/services/betaService.ts`

This service provides methods for:
- Generating and validating invite codes
- Creating and sending invites
- Checking beta access status
- Managing beta users

### 2. Database Tables

The beta system uses the following database tables:

- **beta_invites**: Stores invite codes and their status
- **beta_users**: Tracks users who have beta access
- **beta_feedback**: Stores feedback from beta users
- **beta_requests**: Manages requests for beta access

Migration files are located in:
- `src/db/migrations/beta_tables.sql`
- `src/db/migrations/beta_feedback_table.sql`
- `src/db/migrations/beta_requests_table.sql`

### 3. User Interface Components

#### Beta Banner
`src/components/beta/BetaBanner.tsx`

Displays a banner at the top of the site indicating beta status.

#### Beta Access Form
`src/components/auth/BetaAccessForm.tsx`

Handles invite code verification during signup.

#### Beta Feedback Form
`src/components/beta/BetaFeedbackForm.tsx`

Allows beta users to provide structured feedback.

#### Beta Signup Form
`src/components/beta/BetaSignupForm.tsx`

Lets visitors request beta access by submitting their email.

### 4. Admin Interface

The beta system includes an admin interface for managing invites at:
`src/pages/admin/BetaInvites.tsx`

This interface allows administrators to:
- View all beta invites and their status
- Create new invites
- Send invites to users
- Bulk invite users

## Configuration

The beta system is configured through environment variables in the `.env` file:

```
# Beta Settings
# Set to 'true' to enable beta features and invite-only access
VITE_BETA_MODE=true
```

## User Flow

1. **Request Access**: Visitors can request beta access through the signup form on the homepage
2. **Admin Approval**: Admins review requests and generate invite codes
3. **Invitation**: System sends email invitations with unique codes
4. **Signup**: Users sign up with their invite code
5. **Feedback**: Beta users can provide feedback through the feedback form

## Managing Beta Users

### Creating Invites

Admins can create invites in two ways:

1. **Individual Invites**: Create a single invite for a specific email
2. **Bulk Invites**: Upload a list of emails to create multiple invites at once

### Tracking Usage

The system tracks:

- When invites are created
- When invites are sent
- When invites are claimed
- When users provide feedback

## Security

The beta system implements several security measures:

- Row-Level Security (RLS) policies in the database
- Role-based access control for admin functions
- Secure invite code generation
- Expiration dates for invite codes

## Turning Off Beta Mode

To disable beta mode and open the platform to all users:

1. Set `VITE_BETA_MODE=false` in the `.env` file
2. Deploy the updated environment

When beta mode is disabled, the system will:
- Hide the beta banner
- Skip the invite code verification during signup
- Hide beta-specific UI elements
- Continue to allow existing beta users to access the platform
