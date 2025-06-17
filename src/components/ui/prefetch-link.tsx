/**
 * PrefetchLink Component
 * 
 * A wrapper around React Router's Link component that adds route prefetching
 * when users hover over or focus on links, improving navigation performance.
 */

import React from 'react';
import { Link, LinkProps } from 'react-router-dom';
import { usePrefetch } from '@/lib/utils/routePrefetching';

interface PrefetchLinkProps extends LinkProps {
  prefetch?: boolean;
  children: React.ReactNode;
}

export function PrefetchLink({
  to,
  prefetch = true,
  children,
  ...props
}: PrefetchLinkProps) {
  // Always call usePrefetch unconditionally
  const prefetchResult = usePrefetch(to.toString());
  const prefetchProps = prefetch ? prefetchResult : {};

  return (
    <Link
      to={to}
      {...prefetchProps}
      {...props}
    >
      {children}
    </Link>
  );
}

export default PrefetchLink;
