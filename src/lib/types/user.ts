export type UserRole = 'member' | 'mentor' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  isVerified: boolean;
  fullName?: string;
  avatarUrl?: string;
  bio?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MentorProfile extends UserProfile {
  role: 'mentor';
  expertise: string[];
  yearsOfExperience: number;
  certifications?: string[];
  socialLinks?: {
    youtube?: string;
    instagram?: string;
    twitter?: string;
    website?: string;
  };
}

export interface AdminProfile extends UserProfile {
  role: 'admin';
  permissions: string[];
}

export type Profile = UserProfile | MentorProfile | AdminProfile;

export interface VerificationRequest {
  email: string;
  role: UserRole;
  fullName: string;
  additionalInfo?: {
    expertise?: string[];
    yearsOfExperience?: number;
    certifications?: string[];
    socialLinks?: MentorProfile['socialLinks'];
  };
}

export interface VerificationResponse {
  success: boolean;
  message: string;
  verificationToken?: string;
} 