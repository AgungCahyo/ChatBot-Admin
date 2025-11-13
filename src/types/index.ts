// src/types/index.ts - FIXED TYPE DEFINITIONS

export interface BotStats {
  totalMessages: number;
  totalUsers: number;
  consultationRequests: number;
  conversionRate: number;
  activeNow: number;
  lastUpdated?: Date;
}

// ✅ FIXED: Add userName field
export interface Message {
  id: string;
  messageId: string;
  from: string;
  userName?: string; // ✅ NEW: Add optional userName field
  type: 'text' | 'interactive';
  textBody: string;
  keyword: string;
  timestamp: Date;
  date: string;
  hour: number;
  status: 'success' | 'error';
}

export interface User {
  id: string;
  name?: string;
  userId: string;
  firstSeen: Date;
  lastSeen: Date;
  messageCount: number;
  conversationCount: number;
  lastKeyword: string | null;
  tags: string[];
  status: 'active' | 'inactive' | 'converted';
}

export interface Consultation {
  id: string;
  from: string;
  message: string;
  timestamp: Date;
  date: string;
  status: 'pending' | 'contacted' | 'closed' | 'won' | 'lost';
  notified: boolean;
  notes?: string;
  followUpDate?: Date;
}

export interface KeywordStat {
  keyword: string;
  date?: string;
  count: number;
  conversions: number;
}

export interface ButtonClick {
  id: string;
  from: string;
  buttonId: string;
  buttonTitle: string;
  context: string | null;
  timestamp: Date;
  date: string;
}

export interface Conversion {
  id: string;
  from: string;
  fromKeyword: string;
  toKeyword: string;
  timestamp: Date;
  date: string;
}

export interface WorkingHours {
  enabled: boolean;
  start_hour: number;
  end_hour: number;
  timezone: string;
  days: number[];
}

// ✅ FIXED: Proper typing for system_messages (not string | Record)
export interface SystemMessages {
  offline_hours?: {
    message: string;
    greeting_with_name: boolean;
  };
  consultation_notification?: {
    template: string;
  };
  button_text?: {
    welcome_download: string;
    welcome_tips: string;
    welcome_consultation: string;
    mulai_tips: string;
    mulai_bonus: string;
    mulai_autopilot: string;
    tips_bonus: string;
    tips_autopilot: string;
    tips_consultation: string;
    bonus_autopilot: string;
    bonus_consultation: string;
    autopilot_consultation: string;
  };
  button_footer?: {
    welcome: string;
    mulai: string;
    tips: string;
    bonus: string;
    autopilot: string;
  };
  follow_up_messages?: {
    after_mulai: string;
    after_tips: string;
    after_bonus: string;
    after_autopilot: string;
  };
  list_menu?: {
    button_text: string;
    footer_text: string;
    sections: Array<{
      title: string;
      rows: Array<{
        id: string;
        title: string;
        description: string;
      }>;
    }>;
  };
}

// ✅ FIXED: Use proper SystemMessages type
export interface BotConfig {
  ebook_link: string;
  bonus_link: string;
  konsultan_wa: string;
  funnel: {
    [key: string]: {
      message: string;
      reaction: string;
    };
  };
  errors: {
    unsupported_type: string;
    general_error: string;
  };
  working_hours?: WorkingHours;
  system_messages?: SystemMessages; // ✅ FIXED: Use proper type instead of string | Record
  last_updated?: Date;
  updated_by?: string;
}

export interface HourlyActivity {
  hour: string;
  messages: number;
}

export interface StatCardProps {
  title: string;
  value: string | number | null;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: number;
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'pink' | 'cyan';
}

export interface BroadcastMessage {
  id: string;
  message: string;
  targetAudience: 'all' | 'active' | 'inactive' | 'converted' | 'custom';
  customUserIds?: string[];
  scheduledAt?: Date;
  sentAt?: Date;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed';
  totalRecipients: number;
  sentCount: number;
  failedCount: number;
  createdBy: string;
  createdAt: Date;
}

export interface BroadcastResult {
  success: number;
  failed: number;
  total: number;
  errors?: Array<{ userId: string; error: string }>;
}