import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Check, X, Clock, User, Mail, Calendar } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import type { User } from '@/types/booking'

interface UserManagementProps {
  users?: User[]
  onApproveUser: (userId: string) => void
  onRejectUser: (userId: string) => void
}

// Sample users data
const sampleUsers: User[] = [
  {
    id: 'user_1',
    email: 'anna.schmidt@email.com',
    displayName: 'Anna Schmidt',
    role: 'member',
    horseName: 'Bella',
    status: 'pending',
    createdAt: '2025-01-15T10:00:00Z',
    updatedAt: '2025-01-15T10:00:00Z'
  },
  {
    id: 'user_2',
    email: 'max.mueller@email.com',
    displayName: 'Max Müller',
    role: 'member',
    horseName: 'Thunder',
    status: 'approved',
    approvedBy: 'admin',
    approvedAt: '2025-01-16T09:00:00Z',
    createdAt: '2025-01-10T14:00:00Z',
    updatedAt: '2025-01-16T09:00:00Z'
  },
  {
    id: 'user_3',
    email: 'lisa.weber@email.com',
    displayName: 'Lisa Weber',
    role: 'member',
    horseName: 'Star',
    status: 'pending',
    createdAt: '2025-01-17T16:00:00Z',
    updatedAt: '2025-01-17T16:00:00Z'
  },
  {
    id: 'user_4',
    email: 'tom.fischer@email.com',
    displayName: 'Tom Fischer',
    role: 'member',
    status: 'rejected',
    createdAt: '2025-01-12T11:00:00Z',
    updatedAt: '2025-01-13T08:00:00Z'
  },
  {
    id: 'user_5',
    email: 'sarah.klein@email.com',
    displayName: 'Sarah Klein',
    role: 'member',
    horseName: 'Luna',
    status: 'pending',
    createdAt: '2025-01-18T14:30:00Z',
    updatedAt: '2025-01-18T14:30:00Z'
  },
  {
    id: 'user_6',
    email: 'michael.braun@email.com',
    displayName: 'Michael Braun',
    role: 'member',
    horseName: 'Storm',
    status: 'approved',
    approvedBy: 'admin',
    approvedAt: '2025-01-17T11:15:00Z',
    createdAt: '2025-01-16T09:20:00Z',
    updatedAt: '2025-01-17T11:15:00Z'
  }
]

export function UserManagement({ users = sampleUsers, onApproveUser, onRejectUser }: UserManagementProps) {
  const [activeTab, setActiveTab] = useState('pending')

  const pendingUsers = users.filter(u => u.status === 'pending')
  const approvedUsers = users.filter(u => u.status === 'approved')
  const rejectedUsers = users.filter(u => u.status === 'rejected')

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const UserCard = ({ user, showActions = false }: { user: User; showActions?: boolean }) => (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-white" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">
                {user.displayName || 'Unbekannter Benutzer'}
              </h4>
              <p className="text-sm text-gray-600 flex items-center space-x-1">
                <Mail className="h-3 w-3" />
                <span>{user.email}</span>
              </p>
            </div>
          </div>
          <Badge className={getStatusColor(user.status)}>
            {user.status === 'pending' ? 'Ausstehend' : user.status === 'approved' ? 'Genehmigt' : 'Abgelehnt'}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="flex items-center space-x-2 text-sm">
            <span className="font-medium">Rolle:</span>
            <span>{user.role === 'member' ? 'Mitglied' : 'Admin'}</span>
          </div>
          {user.horseName && (
            <div className="flex items-center space-x-2 text-sm">
              <span className="font-medium">Pferd:</span>
              <span>{user.horseName}</span>
            </div>
          )}
          <div className="flex items-center space-x-2 text-sm">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span>Registriert {format(parseISO(user.createdAt), 'dd.MM.yyyy HH:mm')}</span>
          </div>
          {user.updatedAt !== user.createdAt && (
            <div className="flex items-center space-x-2 text-sm">
              <Clock className="h-4 w-4 text-gray-400" />
              <span>Aktualisiert {format(parseISO(user.updatedAt), 'dd.MM.yyyy HH:mm')}</span>
            </div>
          )}
          {user.status === 'approved' && user.approvedAt && (
            <div className="flex items-center space-x-2 text-sm">
              <Check className="h-4 w-4 text-green-400" />
              <span>Genehmigt {format(parseISO(user.approvedAt), 'dd.MM.yyyy HH:mm')}</span>
            </div>
          )}
        </div>

        {showActions && user.status === 'pending' && (
          <div className="flex space-x-2">
            <Button
              size="sm"
              onClick={() => onApproveUser(user.id)}
              className="flex items-center space-x-1"
            >
              <Check className="h-4 w-4" />
              <span>Genehmigen</span>
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onRejectUser(user.id)}
              className="flex items-center space-x-1"
            >
              <X className="h-4 w-4" />
              <span>Ablehnen</span>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Benutzerverwaltung</h2>
        <p className="text-gray-600">Neue Benutzer genehmigen und verwalten</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ausstehende Anfragen</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingUsers.length}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Genehmigte Benutzer</p>
                <p className="text-2xl font-bold text-green-600">{approvedUsers.length}</p>
              </div>
              <Check className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Benutzer gesamt</p>
                <p className="text-2xl font-bold text-gray-900">{users.length}</p>
              </div>
              <User className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Management Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Benutzer</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-1 mb-6">
            <Button
              size="sm"
              variant={activeTab === 'pending' ? 'default' : 'outline'}
              onClick={() => setActiveTab('pending')}
              className="flex items-center space-x-2"
            >
              <Clock className="h-4 w-4" />
              <span>Ausstehend ({pendingUsers.length})</span>
            </Button>
            <Button
              size="sm"
              variant={activeTab === 'approved' ? 'default' : 'outline'}
              onClick={() => setActiveTab('approved')}
              className="flex items-center space-x-2"
            >
              <Check className="h-4 w-4" />
              <span>Genehmigt ({approvedUsers.length})</span>
            </Button>
            <Button
              size="sm"
              variant={activeTab === 'rejected' ? 'default' : 'outline'}
              onClick={() => setActiveTab('rejected')}
              className="flex items-center space-x-2"
            >
              <X className="h-4 w-4" />
              <span>Abgelehnt ({rejectedUsers.length})</span>
            </Button>
          </div>

          <ScrollArea className="h-[600px] pr-4">
            {activeTab === 'pending' && (
              <div>
                {pendingUsers.length === 0 ? (
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Keine ausstehenden Anfragen</h3>
                    <p className="text-gray-600">Alle Benutzeranfragen wurden bearbeitet.</p>
                  </div>
                ) : (
                  <div>
                    {pendingUsers.map((user) => (
                      <UserCard key={user.id} user={user} showActions={true} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'approved' && (
              <div>
                {approvedUsers.length === 0 ? (
                  <div className="text-center py-8">
                    <Check className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Keine genehmigten Benutzer</h3>
                    <p className="text-gray-600">Es wurden noch keine Benutzer genehmigt.</p>
                  </div>
                ) : (
                  <div>
                    {approvedUsers.map((user) => (
                      <UserCard key={user.id} user={user} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'rejected' && (
              <div>
                {rejectedUsers.length === 0 ? (
                  <div className="text-center py-8">
                    <X className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Keine abgelehnten Benutzer</h3>
                    <p className="text-gray-600">Es wurden keine Benutzer abgelehnt.</p>
                  </div>
                ) : (
                  <div>
                    {rejectedUsers.map((user) => (
                      <UserCard key={user.id} user={user} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}