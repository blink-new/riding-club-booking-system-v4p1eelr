export interface AdminMessage {
  id: string
  title: string
  content: string
  createdAt: string
  updatedAt: string
  isActive: boolean
  priority: 'low' | 'medium' | 'high'
  createdBy: string
}