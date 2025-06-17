import { describe, it, expect, vi, beforeEach } from 'vitest';
import { metricsService } from './metricsService';
import { supabase } from '@/lib/supabase';

// Mock the supabase client
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn(),
              maybeSingle: vi.fn()
            })),
            single: vi.fn(),
            maybeSingle: vi.fn()
          })),
          single: vi.fn(),
          maybeSingle: vi.fn()
        })),
        order: vi.fn(() => ({
          limit: vi.fn().mockResolvedValue({ data: [], error: null })
        }))
      })),
      update: vi.fn(() => ({
        eq: vi.fn().mockResolvedValue({ data: null, error: null })
      })),
      insert: vi.fn().mockResolvedValue({ data: null, error: null })
    }))
  }
}));

// Mock the error handler
vi.mock('@/lib/utils/errorHandler', () => ({
  handleApiError: vi.fn()
}));

describe('metricsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('trackView', () => {
    it('should track a view for content', async () => {
      // Setup spy on the trackMetric method
      const trackMetricSpy = vi.spyOn(metricsService, 'trackMetric');
      
      // Call the method
      await metricsService.trackView('123', 'contribution', 'user-456');
      
      // Verify the correct data was passed to trackMetric
      expect(trackMetricSpy).toHaveBeenCalledWith({
        contentId: '123',
        contentType: 'contribution',
        metricType: 'view',
        userId: 'user-456',
        value: 1
      });
    });
  });

  describe('trackTimeSpent', () => {
    it('should track time spent on content', async () => {
      // Setup spy on the trackMetric method
      const trackMetricSpy = vi.spyOn(metricsService, 'trackMetric');
      
      // Call the method
      await metricsService.trackTimeSpent('123', 'contribution', 60, 'user-456');
      
      // Verify the correct data was passed to trackMetric
      expect(trackMetricSpy).toHaveBeenCalledWith({
        contentId: '123',
        contentType: 'contribution',
        metricType: 'time_spent',
        userId: 'user-456',
        value: 60
      });
    });
  });

  describe('trackInteraction', () => {
    it('should track a like interaction', async () => {
      // Setup spy on the trackMetric method
      const trackMetricSpy = vi.spyOn(metricsService, 'trackMetric');
      
      // Call the method
      await metricsService.trackInteraction('123', 'contribution', 'like', 'user-456');
      
      // Verify the correct data was passed to trackMetric
      expect(trackMetricSpy).toHaveBeenCalledWith({
        contentId: '123',
        contentType: 'contribution',
        metricType: 'like',
        userId: 'user-456',
        value: 1,
        metadata: undefined
      });
    });
  });

  describe('getViewCount', () => {
    it('should return view count for content', async () => {
      // Mock the Supabase response
      const mockSingle = vi.fn().mockResolvedValue({
        data: { value: 42 },
        error: null
      });
      
      // Setup the mock chain
      const fromMock = vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: mockSingle
              }))
            }))
          }))
        }))
      }));
      
      // Replace the from method in the supabase mock
      vi.spyOn(supabase, 'from').mockImplementation(fromMock);
      
      // Call the method
      const count = await metricsService.getViewCount('123', 'contribution');
      
      // Verify the result
      expect(count).toBe(42);
      expect(fromMock).toHaveBeenCalledWith('content_metrics');
    });

    it('should return 0 if no record found', async () => {
      // Mock the Supabase response for a 404 error
      const mockSingle = vi.fn().mockResolvedValue({
        data: null,
        error: { code: 'PGRST404' }
      });
      
      // Setup the mock chain
      const fromMock = vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: mockSingle
              }))
            }))
          }))
        }))
      }));
      
      // Replace the from method in the supabase mock
      vi.spyOn(supabase, 'from').mockImplementation(fromMock);
      
      // Call the method
      const count = await metricsService.getViewCount('123', 'contribution');
      
      // Verify the result
      expect(count).toBe(0);
    });
  });

  describe('getInteractionCount', () => {
    it('should return interaction count for content', async () => {
      // Mock the Supabase response
      const mockSingle = vi.fn().mockResolvedValue({
        data: { value: 15 },
        error: null
      });
      
      // Setup the mock chain
      const fromMock = vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: mockSingle
              }))
            }))
          }))
        }))
      }));
      
      // Replace the from method in the supabase mock
      vi.spyOn(supabase, 'from').mockImplementation(fromMock);
      
      // Call the method
      const count = await metricsService.getInteractionCount('123', 'contribution', 'like');
      
      // Verify the result
      expect(count).toBe(15);
    });
  });

  describe('getTopContent', () => {
    it('should return top content by views', async () => {
      // Mock data for top content
      const mockTopContent = [
        { content_id: '123', value: 100 },
        { content_id: '456', value: 75 },
        { content_id: '789', value: 50 }
      ];
      
      // Mock the Supabase response
      const mockLimit = vi.fn().mockResolvedValue({
        data: mockTopContent,
        error: null
      });
      
      // Setup the mock chain
      const fromMock = vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              order: vi.fn(() => ({
                limit: mockLimit
              }))
            }))
          }))
        }))
      }));
      
      // Replace the from method in the supabase mock
      vi.spyOn(supabase, 'from').mockImplementation(fromMock);
      
      // Call the method
      const topContent = await metricsService.getTopContent('contribution', 3);
      
      // Verify the result
      expect(topContent).toEqual(mockTopContent);
    });
  });
});
