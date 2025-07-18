import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { MessageSquare, AlertTriangle, AlertCircle, Info } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import type { AdminMessage } from '@/types/message'

interface AdminMessagesProps {
  messages: AdminMessage[]
}

export function AdminMessages({ messages }: AdminMessagesProps) {
  // Only show active messages, sorted by priority and creation date
  const activeMessages = messages
    .filter(m => m.isActive)
    .sort((a, b) => {
      // Sort by priority first (high -> medium -> low)
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority]
      if (priorityDiff !== 0) return priorityDiff
      
      // Then by creation date (newest first)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

  if (activeMessages.length === 0) {
    return null
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertTriangle className="h-4 w-4" />
      case 'medium':
        return <AlertCircle className="h-4 w-4" />
      case 'low':
        return <Info className="h-4 w-4" />
      default:
        return <Info className="h-4 w-4" />
    }
  }

  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'destructive'
      case 'medium':
        return 'default'
      case 'low':
        return 'secondary'
      default:
        return 'secondary'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          <span>Informationen & Nachrichten</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activeMessages.map((message) => (
          <Alert 
            key={message.id} 
            variant={getPriorityVariant(message.priority)}
            className="animate-in fade-in-0 slide-in-from-left-2"
          >
            <div className="flex items-start space-x-3">
              {getPriorityIcon(message.priority)}
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{message.title}</h4>
                  <div className="flex items-center space-x-2">
                    <Badge className={getPriorityColor(message.priority)}>
                      {message.priority === 'high' ? 'Wichtig' : 
                       message.priority === 'medium' ? 'Info' : 'Hinweis'}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {format(parseISO(message.createdAt), 'dd.MM.yyyy')}
                    </span>
                  </div>
                </div>
                <AlertDescription className="text-sm">
                  {message.content}
                </AlertDescription>
              </div>
            </div>
          </Alert>
        ))}
      </CardContent>
    </Card>
  )
}