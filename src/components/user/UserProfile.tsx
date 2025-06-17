import { useState } from 'react';
import { useUser } from '@/hooks/useUser';
import { UserRole } from '@/lib/types/user';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

interface UserProfileProps {
  userId: string;
}

export function UserProfile({ userId }: UserProfileProps) {
  const { profile, isLoadingProfile, updateRole } = useUser(userId);
  const [isEditing, setIsEditing] = useState(false);
  const [editedRole, setEditedRole] = useState<UserRole | undefined>();

  if (isLoadingProfile) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-1/4" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!profile) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Profile Not Found</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Unable to load user profile.</p>
        </CardContent>
      </Card>
    );
  }

  const handleRoleUpdate = () => {
    if (editedRole) {
      updateRole({ userId, role: editedRole });
      setIsEditing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Profile</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Email</Label>
          <Input value={profile.email} disabled />
        </div>

        <div className="space-y-2">
          <Label>Role</Label>
          {isEditing ? (
            <div className="flex gap-2">
              <Select
                value={editedRole || profile.role}
                onValueChange={(value) => setEditedRole(value as UserRole)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="mentor">Mentor</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleRoleUpdate}>Save</Button>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Input value={profile.role} disabled />
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                Edit
              </Button>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label>Verification Status</Label>
          <Input
            value={profile.isVerified ? 'Verified' : 'Not Verified'}
            disabled
          />
        </div>
      </CardContent>
    </Card>
  );
} 