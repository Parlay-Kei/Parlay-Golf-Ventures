# Email Service Migration Guide

## Quick Reference

### When to Use Which Service

| Use Case | Service | Location |
|----------|---------|----------|
| React Components | `emailServiceClient` | Client-side |
| API Routes | `emailService` | Server-side |
| Server Functions | `emailService` | Server-side |

### Import Changes

```typescript
// ❌ Don't use in React components
import { emailService } from '@/lib/services/emailService';

// ✅ Use in React components  
import { emailServiceClient } from '@/lib/services/emailServiceClient';
```

### API Compatibility

Both services have identical APIs, so no code changes are needed beyond the import:

```typescript
// Works with both services
await emailServiceClient.sendApprovalNotification(email, title);
await emailServiceClient.sendRejectionNotification(email, title, reason);
await emailServiceClient.sendWelcomeEmail(email, name);
await emailServiceClient.sendBetaInvitation(email, code);
```

### Files Already Updated

The following files have been migrated:
- ✅ `src/components/contribution/moderation/ModerationQueue.tsx`
- ✅ `src/lib/api/contributions.ts`
- ✅ `src/lib/services/betaService.ts`

### Required Server Endpoint

The client service expects this API endpoint:

```typescript
POST /api/email/send
Content-Type: application/json

{
  "to": "user@example.com",
  "subject": "Email Subject", 
  "body": "Email body",
  "from": "noreply@parlaygolfventures.com",
  "html": "<html>...</html>"
}
```

### Testing

1. **Development**: Client service logs to console
2. **Production**: Client service calls API endpoint
3. **Server**: Original service sends via SendGrid

---

**Last Updated**: December 2024 