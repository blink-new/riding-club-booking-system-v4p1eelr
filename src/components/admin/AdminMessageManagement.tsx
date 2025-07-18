import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Plus, Edit, Trash2, MessageSquare, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import type { AdminMessage } from '@/types/message'

interface AdminMessageManagementProps {
  messages: AdminMessage[]
  onCreateMessage: (message: Omit<AdminMessage, 'id' | 'createdAt' | 'updatedAt'>) => void
  onUpdateMessage: (id: string, message: Partial<AdminMessage>) => void
  onDeleteMessage: (id: string) => void
}

export function AdminMessageManagement({ 
  messages, 
  onCreateMessage, 
  onUpdateMessage, 
  onDeleteMessage 
}: AdminMessageManagementProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [editingMessage, setEditingMessage] = useState<AdminMessage | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    isActive: true
  })

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      priority: 'medium',
      isActive: true
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (editingMessage) {
      onUpdateMessage(editingMessage.id, {
        ...formData,
        updatedAt: new Date().toISOString()
      })
      setEditingMessage(null)
    } else {
      onCreateMessage({
        ...formData,
        createdBy: 'admin'
      })
      setShowCreateDialog(false)
    }
    
    resetForm()
  }

  const handleEdit = (message: AdminMessage) => {
    setEditingMessage(message)
    setFormData({
      title: message.title,
      content: message.content,
      priority: message.priority,
      isActive: message.isActive
    })
  }

  const handleCancel = () => {
    setShowCreateDialog(false)
    setEditingMessage(null)
    resetForm()
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      case 'medium':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />
      case 'low':
        return <Info className="h-4 w-4 text-blue-600" />
      default:
        return <Info className="h-4 w-4 text-gray-600" />
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

  const activeMessages = messages.filter(m => m.isActive)
  const inactiveMessages = messages.filter(m => !m.isActive)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Nachrichten-Verwaltung</h2>
          <p className="text-gray-600">Informationen für alle Benutzer verwalten</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Neue Nachricht</span>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Aktive Nachrichten</p>
                <p className="text-2xl font-bold text-green-600">{activeMessages.length}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Inaktive Nachrichten</p>
                <p className="text-2xl font-bold text-gray-600">{inactiveMessages.length}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Nachrichten gesamt</p>
                <p className="text-2xl font-bold text-gray-900">{messages.length}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Messages List */}
      <Card>
        <CardHeader>
          <CardTitle>Alle Nachrichten</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] pr-4">
            {messages.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Nachrichten</h3>
                <p className="text-gray-600 mb-4">Erstellen Sie Ihre erste Nachricht für die Benutzer.</p>
                <Button onClick={() => setShowCreateDialog(true)}>Erste Nachricht erstellen</Button>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <Card key={message.id} className={`${!message.isActive ? 'opacity-60' : ''}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            {getPriorityIcon(message.priority)}
                            <h4 className="font-medium text-gray-900">{message.title}</h4>
                            <Badge className={getPriorityColor(message.priority)}>
                              {message.priority === 'high' ? 'Hoch' : 
                               message.priority === 'medium' ? 'Mittel' : 'Niedrig'}
                            </Badge>
                            <Badge variant={message.isActive ? 'default' : 'secondary'}>
                              {message.isActive ? 'Aktiv' : 'Inaktiv'}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{message.content}</p>
                          <p className="text-xs text-gray-500">
                            Erstellt: {format(parseISO(message.createdAt), 'dd.MM.yyyy HH:mm')}
                            {message.updatedAt !== message.createdAt && (
                              <span> • Aktualisiert: {format(parseISO(message.updatedAt), 'dd.MM.yyyy HH:mm')}</span>
                            )}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(message)}
                            className="flex items-center space-x-1"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onDeleteMessage(message.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Create/Edit Message Dialog */}
      <Dialog open={showCreateDialog || !!editingMessage} onOpenChange={handleCancel}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingMessage ? 'Nachricht bearbeiten' : 'Neue Nachricht erstellen'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Titel</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Nachrichtentitel eingeben..."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Inhalt</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Nachrichteninhalt eingeben..."
                rows={4}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priority">Priorität</Label>
                <Select value={formData.priority} onValueChange={(value: 'low' | 'medium' | 'high') => setFormData({ ...formData, priority: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Niedrig</SelectItem>
                    <SelectItem value="medium">Mittel</SelectItem>
                    <SelectItem value="high">Hoch</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.isActive ? 'active' : 'inactive'} onValueChange={(value) => setFormData({ ...formData, isActive: value === 'active' })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Aktiv</SelectItem>
                    <SelectItem value="inactive">Inaktiv</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex space-x-3 pt-4">
              <Button type="submit" className="flex-1">
                {editingMessage ? 'Aktualisieren' : 'Erstellen'}
              </Button>
              <Button type="button" variant="outline" onClick={handleCancel}>
                Abbrechen
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}