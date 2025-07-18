import { useState, useEffect } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react'

export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
}

interface NotificationProps {
  notification: Notification
  onClose: (id: string) => void
}

export function NotificationItem({ notification, onClose }: NotificationProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    if (notification.duration && notification.duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false)
        setTimeout(() => onClose(notification.id), 300)
      }, notification.duration)

      return () => clearTimeout(timer)
    }
  }, [notification.duration, notification.id, onClose])

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case 'info':
        return <Info className="h-4 w-4 text-blue-600" />
    }
  }

  const getVariant = () => {
    switch (notification.type) {
      case 'error':
        return 'destructive'
      default:
        return 'default'
    }
  }

  const getBorderColor = () => {
    switch (notification.type) {
      case 'success':
        return 'border-l-green-500'
      case 'error':
        return 'border-l-red-500'
      case 'warning':
        return 'border-l-yellow-500'
      case 'info':
        return 'border-l-blue-500'
    }
  }

  return (
    <div
      className={`transform transition-all duration-300 ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <Alert variant={getVariant()} className={`border-l-4 ${getBorderColor()} shadow-lg`}>
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-2">
            {getIcon()}
            <div>
              <div className="font-medium">{notification.title}</div>
              {notification.message && (
                <AlertDescription className="mt-1">
                  {notification.message}
                </AlertDescription>
              )}
            </div>
          </div>
          <button
            onClick={() => {
              setIsVisible(false)
              setTimeout(() => onClose(notification.id), 300)
            }}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </Alert>
    </div>
  )
}

interface NotificationContainerProps {
  notifications: Notification[]
  onClose: (id: string) => void
}

export function NotificationContainer({ notifications, onClose }: NotificationContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onClose={onClose}
        />
      ))}
    </div>
  )
}

// Hook for managing notifications
export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newNotification: Notification = {
      ...notification,
      id,
      duration: notification.duration ?? 5000
    }
    
    setNotifications(prev => [...prev, newNotification])
    return id
  }

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const clearAll = () => {
    setNotifications([])
  }

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAll
  }
}