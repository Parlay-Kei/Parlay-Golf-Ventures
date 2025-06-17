/**
 * Metrics Service
 * 
 * This service tracks user engagement metrics for content across the platform.
 * It provides methods for tracking views, time spent, and interactions.
 */

import { supabase } from '@/lib/supabase';
import { handleApiError } from '@/lib/utils/errorHandler';

// Define metric types
export type MetricType = 'view' | 'like' | 'comment' | 'share' | 'time_spent';

// Define content types
export type ContentType = 'contribution' | 'academy' | 'article';

/**
 * Interface for tracking metrics
 */
export interface MetricData {
  contentId: string;
  contentType: ContentType;
  metricType: MetricType;
  userId?: string;
  value?: number;
  metadata?: Record<string, unknown>;
}

/**
 * Metrics service for tracking user engagement
 */
export const metricsService = {
  /**
   * Track a content view
   * @param contentId ID of the content being viewed
   * @param contentType Type of content (contribution, academy, article)
   * @param userId Optional user ID of the viewer
   */
  async trackView(contentId: string, contentType: ContentType, userId?: string): Promise<void> {
    return this.trackMetric({
      contentId,
      contentType,
      metricType: 'view',
      userId,
      value: 1
    });
  },

  /**
   * Track time spent on content
   * @param contentId ID of the content
   * @param contentType Type of content
   * @param seconds Number of seconds spent
   * @param userId Optional user ID
   */
  async trackTimeSpent(contentId: string, contentType: ContentType, seconds: number, userId?: string): Promise<void> {
    return this.trackMetric({
      contentId,
      contentType,
      metricType: 'time_spent',
      userId,
      value: seconds
    });
  },

  /**
   * Track a content interaction (like, comment, share)
   * @param contentId ID of the content
   * @param contentType Type of content
   * @param metricType Type of interaction
   * @param userId Optional user ID
   * @param metadata Optional additional data
   */
  async trackInteraction(
    contentId: string, 
    contentType: ContentType, 
    metricType: 'like' | 'comment' | 'share', 
    userId?: string,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    return this.trackMetric({
      contentId,
      contentType,
      metricType,
      userId,
      value: 1,
      metadata
    });
  },

  /**
   * Get view count for content
   * @param contentId ID of the content
   * @param contentType Type of content
   */
  async getViewCount(contentId: string, contentType: ContentType): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('content_metrics')
        .select('value')
        .eq('content_id', contentId)
        .eq('content_type', contentType)
        .eq('metric_type', 'view')
        .single();

      if (error) {
        // If no record found, return 0
        if (error.code === 'PGRST404') {
          return 0;
        }
        throw error;
      }

      return data?.value || 0;
    } catch (error) {
      // In development mode or if table doesn't exist, return a random number
      if (import.meta.env.MODE === 'development') {
        return Math.floor(Math.random() * 100) + 1;
      }
      
      handleApiError(error, 'Failed to get view count', false);
      return 0;
    }
  },

  /**
   * Get interaction counts for content
   * @param contentId ID of the content
   * @param contentType Type of content
   * @param metricType Type of interaction
   */
  async getInteractionCount(contentId: string, contentType: ContentType, metricType: MetricType): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('content_metrics')
        .select('value')
        .eq('content_id', contentId)
        .eq('content_type', contentType)
        .eq('metric_type', metricType)
        .single();

      if (error) {
        // If no record found, return 0
        if (error.code === 'PGRST404') {
          return 0;
        }
        throw error;
      }

      return data?.value || 0;
    } catch (error) {
      // In development mode or if table doesn't exist, return a random number
      if (import.meta.env.MODE === 'development') {
        return Math.floor(Math.random() * 50);
      }
      
      handleApiError(error, `Failed to get ${metricType} count`, false);
      return 0;
    }
  },

  /**
   * Get top content by views
   * @param contentType Type of content
   * @param limit Number of items to return
   */
  async getTopContent(contentType: ContentType, limit: number = 5): Promise<Array<{ content_id: string; value: number }>> {
    try {
      const { data, error } = await supabase
        .from('content_metrics')
        .select('content_id, value')
        .eq('content_type', contentType)
        .eq('metric_type', 'view')
        .order('value', { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data as Array<{ content_id: string; value: number }>) || [];
    } catch (error) {
      handleApiError(error, 'Failed to get top content', false);
      return [];
    }
  },

  /**
   * Track a metric
   * @param metricData Metric data to track
   */
  async trackMetric(metricData: MetricData): Promise<void> {
    try {
      // In development mode, just log the metric
      if (import.meta.env.MODE === 'development') {
        console.log('Tracking metric:', metricData);
        return;
      }

      // Check if a record already exists
      const { data: existingData, error: queryError } = await supabase
        .from('content_metrics')
        .select('id, value')
        .eq('content_id', metricData.contentId)
        .eq('content_type', metricData.contentType)
        .eq('metric_type', metricData.metricType)
        .maybeSingle();

      if (queryError && queryError.code !== 'PGRST404') throw queryError;

      if (existingData) {
        // Update existing record
        const newValue = (existingData.value || 0) + (metricData.value || 1);
        const { error: updateError } = await supabase
          .from('content_metrics')
          .update({ 
            value: newValue,
            updated_at: new Date().toISOString(),
            metadata: metricData.metadata
          })
          .eq('id', existingData.id);

        if (updateError) throw updateError;
      } else {
        // Insert new record
        const { error: insertError } = await supabase
          .from('content_metrics')
          .insert({
            content_id: metricData.contentId,
            content_type: metricData.contentType,
            metric_type: metricData.metricType,
            user_id: metricData.userId,
            value: metricData.value || 1,
            metadata: metricData.metadata,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (insertError) throw insertError;
      }
    } catch (error) {
      handleApiError(error, 'Failed to track metric', false);
    }
  }
};
