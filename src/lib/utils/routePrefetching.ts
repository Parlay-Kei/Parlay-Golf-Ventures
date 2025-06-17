/**
 * Route Prefetching Utility
 * 
 * This utility provides functions for prefetching routes when users hover over links
 * or when the browser is idle, improving navigation performance.
 */

// Map to track which routes have already been prefetched
const prefetchedRoutes = new Set<string>();

/**
 * Prefetch a specific route module
 * @param route The route to prefetch
 * @returns A promise that resolves when the route is prefetched
 */
export const prefetchRoute = async (route: string): Promise<void> => {
  // Skip if already prefetched
  if (prefetchedRoutes.has(route)) {
    return;
  }

  try {
    // Map route to its corresponding module
    const moduleMap: Record<string, () => Promise<unknown>> = {
      '/': () => import('@/pages/Index'),
      '/upload': () => import('@/pages/Upload'),
      '/academy': () => import('@/pages/Academy'),
      '/academy/short-game-secrets': () => import('@/pages/ShortGameSecrets'),
      '/academy/dashboard': () => import('@/pages/AcademyDashboard'),
      '/academy/schedule-review': () => import('@/pages/ScheduleMentorReview'),
      '/signup': () => import('@/pages/SignUp'),
      '/login': () => import('@/pages/Login'),
      '/join-community': () => import('@/pages/CommunitySignUp'),
      '/join-free': () => import('@/pages/JoinFree'),
      '/membership': () => import('@/pages/Membership'),
      '/membership/subscribe': () => import('@/pages/Subscription'),
      '/subscription-new': () => import('@/pages/SubscriptionNew'),
      '/dashboard': () => import('@/pages/Dashboard'),
      '/profile': () => import('@/pages/Profile'),
      '/coming-soon': () => import('@/pages/ComingSoon'),
      '/community': () => import('@/pages/Community'),
      '/search': () => import('@/pages/Search'),
      '/admin/academy': () => import('@/pages/AdminDashboard'),
      '/tournament': () => import('@/pages/HybridTournament'),
      '/news': () => import('@/pages/News'),
      '/request-password-reset': () => import('@/pages/RequestPasswordReset'),
      '/reset-password': () => import('@/pages/ResetPassword'),
      '/verify-email': () => import('@/pages/VerifyEmail'),
      '/billing': () => import('@/pages/BillingManagement'),
      '/beta/feedback': () => import('@/pages/beta/Feedback'),
      '/admin/login': () => import('@/pages/AdminLogin'),
      '/admin/dashboard': () => import('@/pages/admin/Dashboard'),
      '/admin/beta-invites': () => import('@/pages/admin/BetaInvites'),
      '/performance-demo': () => import('@/components/examples/PerformanceDemo'),
      // Add other routes as needed
    };

    // Check if we have a module for this route
    const importModule = moduleMap[route];
    if (!importModule) {
      console.warn(`No module found for route: ${route}`);
      return;
    }

    // Prefetch the module
    await importModule();
    
    // Mark as prefetched
    prefetchedRoutes.add(route);
    
    console.log(`Prefetched route: ${route}`);
  } catch (error) {
    console.error(`Error prefetching route ${route}:`, error);
  }
};

/**
 * Prefetch routes when the browser is idle
 * @param routes Array of routes to prefetch
 */
export const prefetchRoutesWhenIdle = (routes: string[]): void => {
  const win = window as unknown as { requestIdleCallback?: (cb: IdleRequestCallback) => void };
  if ('requestIdleCallback' in win && typeof win.requestIdleCallback === 'function') {
    win.requestIdleCallback(() => {
      routes.forEach(route => prefetchRoute(route));
    });
  } else {
    setTimeout(() => {
      routes.forEach(route => prefetchRoute(route));
    }, 1000);
  }
};

/**
 * React hook for prefetching a route on hover
 * @param route The route to prefetch
 * @returns Hover event handlers for prefetching
 */
export const usePrefetch = (route: string) => {
  return {
    onMouseEnter: () => prefetchRoute(route),
    onFocus: () => prefetchRoute(route),
  };
};

/**
 * Prefetch common routes that users are likely to navigate to
 */
export const prefetchCommonRoutes = (): void => {
  // Define common routes that most users will navigate to
  const commonRoutes = [
    '/login',
    '/signup',
    '/dashboard',
    '/academy',
    '/membership',
  ];

  // Prefetch when browser is idle
  prefetchRoutesWhenIdle(commonRoutes);
};
