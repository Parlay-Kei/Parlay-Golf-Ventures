@echo off
REM PGV Phase 1 GitHub Issues Creation Script
REM Ensure you are authenticated and in your repo directory

gh issue create --title "Setup Stripe Products by Tier" --body-file "setup_stripe_products_by_tier.md" --label "billing,Phase 1" --milestone "Launch Ready Core"
gh issue create --title "Integrate Stripe Checkout Flow" --body-file "integrate_stripe_checkout_flow.md" --label "billing,frontend" --milestone "Launch Ready Core"
gh issue create --title "Store Subscription Status in Supabase" --body-file "store_subscription_status_in_supabase.md" --label "backend,supabase" --milestone "Launch Ready Core"
gh issue create --title "Webhook for Cancel/Upgrade Logic" --body-file "webhook_for_cancel_upgrade_logic.md" --label "backend,webhook,billing" --milestone "Launch Ready Core"
gh issue create --title "Show Current Tier & Renewal Date (Dashboard)" --body-file "show_current_tier_renewal_date_dashboard.md" --label "frontend,dashboard,Phase 1" --milestone "Launch Ready Core"
gh issue create --title "Quick Links to Academy / Upload" --body-file "quick_links_to_academy_upload.md" --label "frontend,ui" --milestone "Launch Ready Core"
gh issue create --title "Password Reset Page" --body-file "password_reset_page.md" --label "auth,frontend" --milestone "Launch Ready Core"
gh issue create --title "Email Verification Handling" --body-file "email_verification_handling.md" --label "auth,supabase" --milestone "Launch Ready Core"
gh issue create --title "Create Basic User Profile Page" --body-file "create_basic_user_profile_page.md" --label "profile,frontend,supabase" --milestone "Launch Ready Core"
gh issue create --title "Academy Search Bar Implementation" --body-file "academy_search_bar_implementation.md" --label "frontend,content" --milestone "Launch Ready Core"
gh issue create --title "Locked Page Design (Coming Soon)" --body-file "locked_page_design_coming_soon.md" --label "ui,access,membership" --milestone "Launch Ready Core"
gh issue create --title "Community Feed MVP" --body-file "community_feed_mvp.md" --label "community,Phase 1" --milestone "Launch Ready Core"