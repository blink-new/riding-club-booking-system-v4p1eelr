import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Plus, MessageSquare, Edit, Trash2, AlertCircle, Info, Eye, EyeOff } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import type { AdminMessage } from '@/types/message'

interface MessageManagementProps {
  messages: AdminMessage[]
  onCreateMessage: (message: Omit<AdminMessage, 'id' | 'createdAt' | 'updatedAt'>) => void
  onUpdateMessage: (messageId: string, updates: Partial<AdminMessage>) => void
  onDeleteMessage: (messageId: string) => void
}

export function MessageManagement({ messages, onCreateMessage, onUpdateMessage, onDeleteMessage }: MessageManagementProps) {
  const [showCreateForm, setShowCreateForm] = useState(false)
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
    setEditingMessage(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (editingMessage) {
      onUpdateMessage(editingMessage.id, {
        ...formData,
        updatedAt: new Date().toISOString()
      })
    } else {
      onCreateMessage({
        ...formData,
        createdBy: 'admin',
        isActive: true
      })
    }
    
    resetForm()
    setShowCreateForm(false)
  }

  const handleEdit = (message: AdminMessage) => {
    setEditingMessage(message)
    setFormData({
      title: message.title,
      content: message.content,
      priority: message.priority,
      isActive: message.isActive
    })
    setShowCreateForm(true)
  }

  const handleToggleActive = (messageId: string, isActive: boolean) => {
    onUpdateMessage(messageId, { 
      isActive: !isActive,
      updatedAt: new Date().toISOString()
    })
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

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertCircle className="h-4 w-4 text-red-600" />
      case 'medium':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />
      case 'low':
        return <Info className="h-4 w-4 text-blue-600" />
      default:
        return <Info className="h-4 w-4 text-gray-600" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Nachrichten-Verwaltung</h3>
          <p className="text-gray-600">Informationen für alle Benutzer verwalten</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)} className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Neue Nachricht</span>
        </Button>
      </div>

      {/* Messages List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5" />
            <span>Aktuelle Nachrichten ({messages.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Nachrichten</h3>
              <p className="text-gray-600 mb-4">Erstellen Sie Ihre erste Nachricht für die Benutzer.</p>
              <Button onClick={() => setShowCreateForm(true)}>Erste Nachricht erstellen</Button>
            </div>
          ) : (
            <div className="space-y-4">
              {messages
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .map((message) => (
                  <div
                    key={message.id}
                    className={`p-4 border rounded-lg transition-all duration-200 ${
                      message.isActive ? 'bg-white' : 'bg-gray-50 opacity-75'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start space-x-3 flex-1">
                        <div className="flex-shrink-0">
                          {getPriorityIcon(message.priority)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-medium text-gray-900">{message.title}</h4>
                            <Badge className={getPriorityColor(message.priority)}>
                              {message.priority === 'high' ? 'Hoch' : 
                               message.priority === 'medium' ? 'Mittel' : 'Niedrig'}
                            </Badge>
                            {!message.isActive && (
                              <Badge variant="secondary">Inaktiv</Badge>
                            )}
                          </div>
                          <p className="text-gray-700 mb-2">{message.content}</p>
                          <p className="text-xs text-gray-500">
                            Erstellt: {format(parseISO(message.createdAt), 'dd.MM.yyyy HH:mm')} Uhr
                            {message.updatedAt !== message.createdAt && (
                              <span> • Bearbeitet: {format(parseISO(message.updatedAt), 'dd.MM.yyyy HH:mm')} Uhr</span>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleToggleActive(message.id, message.isActive)}
                          className="flex items-center space-x-1"
                        >
                          {message.isActive ? (
                            <>
                              <EyeOff className="h-4 w-4" />
                              <span>Ausblenden</span>
                            </>
                          ) : (
                            <>
                              <Eye className="h-4 w-4" />
                              <span>Anzeigen</span>
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(message)}
                          className="flex items-center space-x-1"
                        >
                          <Edit className="h-4 w-4" />
                          <span>Bearbeiten</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onDeleteMessage(message.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 flex items-center space-x-1"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span>Löschen</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Message Dialog */}
      <Dialog open={showCreateForm} onOpenChange={(open) => {
        if (!open) {
          resetForm()
        }
        setShowCreateForm(open)
      }}>
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
                placeholder="Titel der Nachricht..."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Inhalt</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Inhalt der Nachricht..."
                rows={4}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priorität</Label>
              <Select value={formData.priority} onValueChange={(value: 'low' | 'medium' | 'high') => setFormData({ ...formData, priority: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">
                    <div className="flex items-center space-x-2">
                      <Info className="h-4 w-4 text-blue-600" />
                      <span>Niedrig</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="medium">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                      <span>Mittel</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="high">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <span>Hoch</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button type="button" variant="outline" onClick={() => {
                resetForm()
                setShowCreateForm(false)
              }}>
                Abbrechen
              </Button>
              <Button type="submit">
                {editingMessage ? 'Aktualisieren' : 'Erstellen'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}