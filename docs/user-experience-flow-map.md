# Parlay Golf Ventures User Experience Flow Map

```mermaid
flowchart TD
    Start([User Enters Site]) --> PublicHome[Public Home Page]
    
    %% Authentication Flows
    PublicHome --> Login{Login?}
    Login -->|Yes| Auth[Authentication]
    Login -->|No| SignUp[Sign Up]
    SignUp --> Auth
    Auth --> MemberDash[Member Dashboard]
    
    %% Public Navigation
    PublicHome --> PublicNav{Navigate To}
    PublicNav -->|Academy| Academy[Academy Section]
    PublicNav -->|Tournament| Tournament[Tournament Page]
    PublicNav -->|News| News[News Section]
    PublicNav -->|Contribute| Contribute[Contribution Options]
    
    %% Academy Flow
    Academy --> AcademyContent[View Content]
    Academy --> ScheduleReview[Schedule Mentor Review]
    
    %% Member Navigation
    MemberDash --> MemberNav{Member Navigation}
    MemberNav -->|Profile| Profile[Edit Profile]
    MemberNav -->|Community| Community[Community Section]
    MemberNav -->|Membership| Membership[Membership Options]
    MemberNav -->|Billing| Billing[Billing Management]
    
    %% Contribution Flow
    Contribute --> ContribType{Contribution Type}
    ContribType -->|Member| MemberContrib[Member Contribution]
    ContribType -->|Guest| GuestContrib[Guest Contribution]
    ContribType -->|Mentor| MentorContrib[Mentor Contribution]
    ContribType -->|Creator| CreatorContrib[Content Creator]
    
    %% Admin Flow
    Auth --> AdminCheck{Is Admin?}
    AdminCheck -->|Yes| AdminDash[Admin Dashboard]
    AdminCheck -->|No| MemberDash
    
    %% Admin Navigation
    AdminDash --> AdminNav{Admin Navigation}
    AdminNav -->|Users| UserManagement[User Management]
    AdminNav -->|Content| ContentManagement[Content Management]
    AdminNav -->|Communications| Communications[Communications]
    AdminNav -->|Tournaments| TournamentManagement[Tournament Management]
    AdminNav -->|Analytics| Analytics[Analytics Dashboard]
    AdminNav -->|Settings| Settings[Settings Management]
    AdminNav -->|Beta| BetaInvites[Beta Invites]
    
    %% Analytics Flow
    Analytics --> AnalyticsView{View Analytics}
    AnalyticsView -->|Overview| AnalyticsOverview[Analytics Overview]
    AnalyticsView -->|Users| UserAnalytics[User Analytics]
    AnalyticsView -->|Content| ContentAnalytics[Content Analytics]
    AnalyticsView -->|Engagement| EngagementAnalytics[Engagement Analytics]
    
    %% Settings Flow
    Settings --> SettingsType{Settings Type}
    SettingsType -->|Profile| ProfileSettings[Profile Settings]
    SettingsType -->|Security| SecuritySettings[Security Settings]
    SettingsType -->|Notifications| NotificationSettings[Notification Settings]
    SettingsType -->|Appearance| AppearanceSettings[Appearance Settings]
    SettingsType -->|General| GeneralSettings[General Settings]
    
    %% Logout Flow
    MemberDash --> Logout[Logout]
    AdminDash --> Logout
    Logout --> PublicHome
    
    classDef publicFlow fill:#d4f1f9,stroke:#05386B,stroke-width:1px;
    classDef memberFlow fill:#c5e8b7,stroke:#05386B,stroke-width:1px;
    classDef adminFlow fill:#ffcccc,stroke:#05386B,stroke-width:1px;
    classDef decisionFlow fill:#ffe066,stroke:#05386B,stroke-width:1px;
    classDef startEndFlow fill:#f8f9fa,stroke:#05386B,stroke-width:2px;
    
    class Start,PublicHome,Academy,Tournament,News,Contribute,AcademyContent,ScheduleReview,SignUp publicFlow;
    class MemberDash,Profile,Community,Membership,Billing,MemberContrib,GuestContrib,MentorContrib,CreatorContrib memberFlow;
    class AdminDash,UserManagement,ContentManagement,Communications,TournamentManagement,Analytics,Settings,BetaInvites,AnalyticsOverview,UserAnalytics,ContentAnalytics,EngagementAnalytics,ProfileSettings,SecuritySettings,NotificationSettings,AppearanceSettings,GeneralSettings adminFlow;
    class Login,AdminCheck,MemberNav,AdminNav,ContribType,AnalyticsView,SettingsType,PublicNav decisionFlow;
    class Auth,Logout startEndFlow;
```

## Legend

- **Blue Nodes**: Public Flow - Actions available to all users
- **Green Nodes**: Member Flow - Actions requiring member login
- **Red Nodes**: Admin Flow - Actions requiring admin privileges
- **Yellow Nodes**: Decision Points - User choices that determine flow direction
- **Gray Nodes**: Entry/Exit Points - Start and end of user journeys
