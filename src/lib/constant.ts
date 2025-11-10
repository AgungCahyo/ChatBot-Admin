// ============================================================================
// src/lib/constants.ts - Dashboard Constants
// ============================================================================

export const CHART_COLORS = [
  '#3b82f6', // blue-500
  '#10b981', // green-500
  '#f59e0b', // amber-500
  '#ef4444', // red-500
  '#8b5cf6', // violet-500
  '#ec4899', // pink-500
  '#06b6d4', // cyan-500
  '#f97316', // orange-500
] as const;

export const STATUS_COLORS = {
  // User status
  active: 'bg-green-100 text-green-700 border-green-200',
  inactive: 'bg-gray-100 text-gray-700 border-gray-200',
  converted: 'bg-blue-100 text-blue-700 border-blue-200',
  
  // Consultation status
  pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  contacted: 'bg-blue-100 text-blue-700 border-blue-200',
  won: 'bg-green-100 text-green-700 border-green-200',
  lost: 'bg-red-100 text-red-700 border-red-200',
  closed: 'bg-gray-100 text-gray-700 border-gray-200',
} as const;

export const DATE_FORMAT_OPTIONS = {
  short: { day: 'numeric', month: 'short' } as const,
  long: { day: 'numeric', month: 'long', year: 'numeric' } as const,
  time: { hour: '2-digit', minute: '2-digit' } as const,
} as const;

export const API_ENDPOINTS = {
  botStatus: '/api/bot-status',
  health: 'https://advancedcb.onrender.com/webhook/health',
} as const;

export const FUNNEL_STAGES = [
  'welcome',
  'mulai',
  'tips',
  'bonus',
  'autopilot',
  'konsultasi',
] as const;

export const RATE_LIMITS = {
  messagesPerUser: 60,
  windowMs: 5000,
  cacheSize: 1000,
} as const;

export const PAGINATION = {
  messages: 50,
  users: 100,
  consultations: 50,
} as const;