import { useState } from 'react';
import { useUser } from '@/hooks/useUser';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export function VerificationRequests() {
  const {
    verificationRequests,
    isLoadingRequests,
    approveVerification,
    rejectVerification,
  } = useUser();
  const [rejectionReason, setRejectionReason] = useState('');

  if (isLoadingRequests) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-1/4" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!verificationRequests?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Verification Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <p>No pending verification requests.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Verification Requests</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Requested Role</TableHead>
              <TableHead>Additional Info</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {verificationRequests.map((request) => (
              <TableRow key={request.id}>
                <TableCell>{request.email}</TableCell>
                <TableCell>{request.fullName}</TableCell>
                <TableCell>{request.role}</TableCell>
                <TableCell>
                  {request.role === 'mentor' && (
                    <div className="space-y-1">
                      <p>
                        <strong>Expertise:</strong>{' '}
                        {request.additionalInfo?.expertise?.join(', ')}
                      </p>
                      <p>
                        <strong>Experience:</strong>{' '}
                        {request.additionalInfo?.yearsOfExperience} years
                      </p>
                      <p>
                        <strong>Certifications:</strong>{' '}
                        {request.additionalInfo?.certifications?.join(', ')}
                      </p>
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => approveVerification(request.id)}
                    >
                      Approve
                    </Button>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Rejection reason"
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                      />
                      <Button
                        variant="destructive"
                        onClick={() =>
                          rejectVerification({
                            requestId: request.id,
                            reason: rejectionReason,
                          })
                        }
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
} 