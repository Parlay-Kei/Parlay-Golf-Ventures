import { useState } from 'react';
import { useUser } from '@/hooks/useUser';
import { UserRole, VerificationRequest } from '@/lib/types/user';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

export function VerificationRequestForm() {
  const { requestVerification } = useUser();
  const [formData, setFormData] = useState<VerificationRequest>({
    email: '',
    role: 'member',
    fullName: '',
    additionalInfo: {},
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    requestVerification(formData);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Request Verification</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Requested Role</Label>
            <Select
              value={formData.role}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, role: value as UserRole }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="member">Member</SelectItem>
                <SelectItem value="mentor">Mentor</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.role === 'mentor' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="expertise">Expertise</Label>
                <Input
                  id="expertise"
                  name="expertise"
                  value={formData.additionalInfo?.expertise?.join(', ')}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      additionalInfo: {
                        ...prev.additionalInfo,
                        expertise: e.target.value.split(',').map((s) => s.trim()),
                      },
                    }))
                  }
                  placeholder="Enter expertise areas, separated by commas"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="yearsOfExperience">Years of Experience</Label>
                <Input
                  id="yearsOfExperience"
                  name="yearsOfExperience"
                  type="number"
                  value={formData.additionalInfo?.yearsOfExperience}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      additionalInfo: {
                        ...prev.additionalInfo,
                        yearsOfExperience: parseInt(e.target.value),
                      },
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="certifications">Certifications</Label>
                <Textarea
                  id="certifications"
                  name="certifications"
                  value={formData.additionalInfo?.certifications?.join('\n')}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      additionalInfo: {
                        ...prev.additionalInfo,
                        certifications: e.target.value.split('\n'),
                      },
                    }))
                  }
                  placeholder="Enter certifications, one per line"
                />
              </div>
            </>
          )}

          <Button type="submit" className="w-full">
            Submit Request
          </Button>
        </form>
      </CardContent>
    </Card>
  );
} 