export type ContributorType = 'member' | 'guest' | 'mentor' | 'creator';

export type ContributionStatus = 'pending' | 'approved' | 'rejected';

export type MemberContributionType = 'swing-video' | 'tutorial-topic' | 'personal-story';
export type GuestContributionType = 'swing-demo' | 'idea';
export type MentorContributionType = 'swing-breakdown' | 'ai-tutorial';
export type ContentCreatorType = 'edited-clip' | 'commentary' | 'gear-review' | 'community-highlight';

export interface BaseContribution {
  id: string;
  title: string;
  description: string;
  contributorId: string;
  contributorType: ContributorType;
  status: ContributionStatus;
  createdAt: Date;
  updatedAt: Date;
  tags?: string[];
  isPublic: boolean;
  rejectionReason?: string;
}

export interface MemberContribution extends BaseContribution {
  contributorType: 'member';
  contributionType: MemberContributionType;
  videoUrl?: string;
  swingType?: 'driver' | 'iron' | 'wedge' | 'putting';
  difficultyLevel?: 'beginner' | 'intermediate' | 'advanced';
}

export interface GuestContribution extends BaseContribution {
  contributorType: 'guest';
  contributionType: GuestContributionType;
  videoUrl?: string;
  category?: string;
  impact?: 'low' | 'medium' | 'high';
}

export interface MentorContribution extends BaseContribution {
  contributorType: 'mentor';
  contributionType: MentorContributionType;
  targetSwingId?: string;
  videoUrl?: string;
  analysisType?: 'technical' | 'conceptual' | 'both';
  difficultyLevel?: 'beginner' | 'intermediate' | 'advanced';
  keyPoints?: string[];
  aiModel?: string;
  promptUsed?: string;
}

export interface ContentCreatorContribution extends BaseContribution {
  contributorType: 'creator';
  contributionType: ContentCreatorType;
  videoUrl?: string;
  gearBrand?: string;
  gearModel?: string;
  gearType?: 'driver' | 'iron' | 'wedge' | 'putter' | 'ball' | 'accessory';
  rating?: number;
  pros?: string[];
  cons?: string[];
  featuredCommunityMember?: string;
  highlightType?: 'achievement' | 'improvement' | 'community' | 'other';
}

export type Contribution = 
  | MemberContribution 
  | GuestContribution 
  | MentorContribution 
  | ContentCreatorContribution;