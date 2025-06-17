import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@/test/utils';
import { BetaBanner } from './BetaBanner';
import { betaService } from '@/lib/services/betaService';

// Mock the betaService
vi.mock('@/lib/services/betaService', () => ({
  betaService: {
    getCurrentBetaStatus: vi.fn(),
  },
}));

describe('BetaBanner Component', () => {
  beforeEach(() => {
    // Clear mocks before each test
    vi.clearAllMocks();
    
    // Clear localStorage
    localStorage.clear();
  });

  it('should not render when beta mode is disabled', () => {
    // Mock betaService to return false for getCurrentBetaStatus
    vi.mocked(betaService.getCurrentBetaStatus).mockReturnValue(false);
    
    render(<BetaBanner />);
    
    // The banner should not be in the document
    expect(screen.queryByText(/Welcome to the Parlay Golf Ventures beta!/i)).not.toBeInTheDocument();
  });

  it('should render when beta mode is enabled', () => {
    // Mock betaService to return true for getCurrentBetaStatus
    vi.mocked(betaService.getCurrentBetaStatus).mockReturnValue(true);
    
    render(<BetaBanner />);
    
    // The banner should be in the document
    expect(screen.getByText(/Welcome to the Parlay Golf Ventures beta!/i)).toBeInTheDocument();
    expect(screen.getByText(/Share your feedback/i)).toBeInTheDocument();
  });

  it('should not render when dismissed via localStorage', () => {
    // Mock betaService to return true for getCurrentBetaStatus
    vi.mocked(betaService.getCurrentBetaStatus).mockReturnValue(true);
    
    // Set localStorage to indicate the banner has been dismissed
    localStorage.setItem('beta_banner_dismissed', 'true');
    
    render(<BetaBanner />);
    
    // The banner should not be in the document
    expect(screen.queryByText(/Welcome to the Parlay Golf Ventures beta!/i)).not.toBeInTheDocument();
  });
});
