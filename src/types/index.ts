// src/types/index.ts

export interface BotStats {
  totalMessages: number;
  totalUsers: number;
  consultationRequests: number;
  conversionRate: number;
  activeNow: number;
  lastUpdated?: Date;
}

export interface Message {
  id: string;
  messageId: string;
  from: string;
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