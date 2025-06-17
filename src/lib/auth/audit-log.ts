import { createClient } from '@supabase/supabase-js';
import { headers } from 'next/headers';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export type AuditAction =
  | 'login'
  | 'logout'
  | 'password_reset'
  | 'email_verification'
  | 'role_change'
  | 'verification_request'
  | 'verification_approval'
  | 'verification_rejection'
  | 'profile_update'
  | 'content_create'
  | 'content_update'
  | 'content_delete';

export const auditLogger = {
  async log(
    action: AuditAction,
    details: Record<string, unknown>,
    userId?: string
  ) {
    try {
      const headersList = headers();
      const ip = headersList.get('x-forwarded-for') || 'unknown';
      const userAgent = headersList.get('user-agent') || 'unknown';

      const { error } = await supabase.from('audit_logs').insert({
        user_id: userId,
        action,
        details: {
          ...details,
          ip_address: ip,
          user_agent: userAgent,
          timestamp: new Date().toISOString(),
        },
      });

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error logging audit event:', error);
      return { success: false, error };
    }
  },

  async getLogs(filters: {
    userId?: string;
    action?: AuditAction;
    startDate?: Date;
    endDate?: Date;
  }) {
    try {
      let query = supabase.from('audit_logs').select('*');

      if (filters.userId) {
        query = query.eq('user_id', filters.userId);
      }

      if (filters.action) {
        query = query.eq('action', filters.action);
      }

      if (filters.startDate) {
        query = query.gte('created_at', filters.startDate.toISOString());
      }

      if (filters.endDate) {
        query = query.lte('created_at', filters.endDate.toISOString());
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return { success: true, logs: data };
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      return { success: false, error };
    }
  },

  async getLogById(logId: string) {
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('id', logId)
        .single();

      if (error) throw error;
      return { success: true, log: data };
    } catch (error) {
      console.error('Error fetching audit log:', error);
      return { success: false, error };
    }
  },
}; 