# Parlay Golf Ventures - User Flow Diagram

```mermaid
flowchart TD
  A[Landing Page /] --> B[Sign Up /signup]
  B --> C[Dashboard /dashboard]
  C --> D[Academy Overview /academy]
  C --> E[Upload Swing /upload-swing]
  C --> F[Community Feed /community]
  C --> G[Profile /profile]
  C --> H[Membership Page /membership]
  C --> I[Contribute Hub /contribute]

  D --> D1[Start Academy Module]
  D1 --> D2[Track Progress]
  D2 --> D3[Get Recommendations]

  E --> E1[Upload Form]
  E1 --> E2[Processing]
  E2 --> E3[Pending Feedback]
  E3 --> E4[Receive AI/Mentor Feedback]

  F --> F1[View Posts]
  F --> F2[Filter by Role / Tier]
  F --> F3[Engage with Other Users]

  G --> G1[Update Profile Info]
  G --> G2[Manage Password & Avatar]
  G --> G3[View Subscription Status]

  I --> I1[Select Contribution Type]
  I1 --> I2[Submit Form]
  I2 --> I3[Submission Confirmation]
```

## Overview

This diagram illustrates the primary user flows within the Parlay Golf Ventures platform. It shows the main navigation paths and key interaction points for users.

## Key User Journeys

### New User Onboarding
- Landing Page → Sign Up → Dashboard

### Learning Journey
- Dashboard → Academy Overview → Start Module → Track Progress → Get Recommendations

### Skill Improvement
- Dashboard → Upload Swing → Upload Form → Processing → Pending Feedback → Receive AI/Mentor Feedback

### Community Engagement
- Dashboard → Community Feed → View Posts/Filter/Engage

### Profile Management
- Dashboard → Profile → Update Info/Manage Password/View Subscription

### Content Contribution
- Dashboard → Contribute Hub → Select Type → Submit Form → Confirmation

## Route Structure

The diagram maps to the following routes in the application:

| User Flow Node | Route Path |
|----------------|------------|
| Landing Page | `/` |
| Sign Up | `/signup` |
| Dashboard | `/dashboard` |
| Academy Overview | `/academy` |
| Upload Swing | `/upload-swing` |
| Community Feed | `/community` |
| Profile | `/profile` |
| Membership Page | `/membership` |
| Contribute Hub | `/contribute` |

## Implementation Status

Some routes are currently redirecting to the Coming Soon page during development:

- `/upload-swing` → `/coming-soon`
- `/contribute` → `/coming-soon`

The core navigation structure is implemented, with feature-specific flows being developed incrementally.
