export interface Booking {
  id: string
  userId: string
  userName: string
  arenaType: 'indoor' | 'outdoor'
  date: string
  startTime: string
  endTime: string
  status: 'pending' | 'approved' | 'rejected'
  purpose?: string
  templateType?: string
  rakeRequired: boolean
  sharedRiding?: boolean
  currentRiders?: number
  maxRiders?: number
  bookingType?: 'member' | 'lesson' | 'maintenance' | 'course' | 'event'
  isSubscription?: boolean
  subscriptionEndDate?: string
  parentSubscriptionId?: string
  createdAt: string
  updatedAt: string
}

export interface User {
  id: string
  email: string
  displayName?: string
  passwordHash?: string
  role: 'member' | 'admin'
  horseName?: string
  status: 'pending' | 'approved' | 'rejected'
  approvedBy?: string
  approvedAt?: string
  createdAt: string
  updatedAt: string
}

export interface BookingTemplate {
  id: string
  name: string
  description?: string
  defaultDuration: number
  createdAt: string
}