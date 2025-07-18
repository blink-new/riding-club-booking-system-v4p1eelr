import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Check, X, Clock, MapPin, Users, Calendar, Plus, User, MessageSquare } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { AdminBookingForm } from './AdminBookingForm'
import { UserManagement } from './UserManagement'
import { AdminMessageManagement } from './AdminMessageManagement'
import { BookingApprovalDialog } from './BookingApprovalDialog'
import type { Booking } from '@/types/booking'
import type { AdminMessage } from '@/types/message'

interface AdminPanelProps {
  bookings: Booking[]
  onApproveBooking: (bookingId: string, sharedRiding?: boolean) => void
  onRejectBooking: (bookingId: string) => void
  onCreateAdminBooking: (booking: any) => void
  onApproveUser?: (userId: string) => void
  onRejectUser?: (userId: string) => void
  adminMessages?: AdminMessage[]
  onCreateMessage?: (message: Omit<AdminMessage, 'id' | 'createdAt' | 'updatedAt'>) => void
  onUpdateMessage?: (messageId: string, updates: Partial<AdminMessage>) => void
  onDeleteMessage?: (messageId: string) => void
}

export function AdminPanel({ 
  bookings, 
  onApproveBooking, 
  onRejectBooking, 
  onCreateAdminBooking, 
  onApproveUser, 
  onRejectUser,
  adminMessages = [],
  onCreateMessage,
  onUpdateMessage,
  onDeleteMessage
}: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState('bookings')
  const [showAdminBookingForm, setShowAdminBookingForm] = useState(false)
  const [selectedBookingForApproval, setSelectedBookingForApproval] = useState<Booking | null>(null)

  // Group subscriptions - only show parent bookings for pending requests
  const groupedPendingBookings = bookings
    .filter(b => b.status === 'pending')
    .filter(b => !b.parentSubscriptionId) // Only show parent bookings, not individual appointments

  const pendingBookings = groupedPendingBookings
  const approvedBookings = bookings.filter(b => b.status === 'approved')
  const rejectedBookings = bookings.filter(b => b.status === 'rejected')

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

  const BookingCard = ({ booking, showActions = false }: { booking: Booking; showActions?: boolean }) => {
    // Count related bookings for subscriptions
    const relatedBookings = booking.isSubscription 
      ? bookings.filter(b => b.id === booking.id || b.parentSubscriptionId === booking.id)
      : [booking]

    return (
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="font-medium text-gray-900 flex items-center space-x-2">
                <span>{format(parseISO(booking.date), 'EEEE, MMMM d, yyyy')}</span>
                {booking.isSubscription && (
                  <Badge variant="secondary" className="text-xs">
                    📅 Abo ({relatedBookings.length} Termine)
                  </Badge>
                )}
              </h4>
              <p className="text-sm text-gray-600">
                Angefragt von {booking.userName}
              </p>
            </div>
            <Badge className={getStatusColor(booking.status)}>
              {booking.status === 'pending' ? 'Ausstehend' : booking.status === 'approved' ? 'Genehmigt' : 'Abgelehnt'}
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="flex items-center space-x-2 text-sm">
              <MapPin className="h-4 w-4 text-gray-400" />
              <span>{booking.arenaType === 'indoor' ? 'Halle' : 'Platz'}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <Clock className="h-4 w-4 text-gray-400" />
              <span>{booking.startTime} - {booking.endTime}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <Users className="h-4 w-4 text-gray-400" />
              <span>Andere Reiter: {booking.sharedRiding ? '✓' : '✗'}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span>Angefragt {format(parseISO(booking.createdAt), 'MMM d, HH:mm')}</span>
            </div>
          </div>

          {booking.isSubscription && booking.subscriptionEndDate && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium text-blue-800 mb-1">Abo-Details:</p>
              <p className="text-sm text-blue-700">
                Wöchentlich bis {format(parseISO(booking.subscriptionEndDate), 'dd.MM.yyyy')} 
                ({relatedBookings.length} Termine insgesamt)
              </p>
            </div>
          )}

          {booking.purpose && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-1">Zweck:</p>
              <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">{booking.purpose}</p>
            </div>
          )}

          {showActions && booking.status === 'pending' && (
            <div className="flex space-x-2">
              <Button
                size="sm"
                onClick={() => setSelectedBookingForApproval(booking)}
                className="flex items-center space-x-1"
              >
                <Check className="h-4 w-4" />
                <span>{booking.isSubscription ? `Abo genehmigen (${relatedBookings.length} Termine)` : 'Genehmigen'}</span>
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => onRejectBooking(booking.id)}
                className="flex items-center space-x-1"
              >
                <X className="h-4 w-4" />
                <span>{booking.isSubscription ? `Abo ablehnen` : 'Ablehnen'}</span>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Admin-Panel</h2>
          <p className="text-gray-600">Buchungsanfragen und Genehmigungen verwalten</p>
        </div>
        <Button onClick={() => setShowAdminBookingForm(true)} className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Admin-Buchung erstellen</span>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ausstehende Anfragen</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingBookings.length}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Heute genehmigt</p>
                <p className="text-2xl font-bold text-green-600">{approvedBookings.length}</p>
              </div>
              <Check className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Buchungen gesamt</p>
                <p className="text-2xl font-bold text-gray-900">{bookings.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Aktive Nachrichten</p>
                <p className="text-2xl font-bold text-blue-600">{adminMessages.filter(m => m.isActive).length}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Admin Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="bookings" className="flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span>Buchungsverwaltung</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center space-x-2">
            <User className="h-4 w-4" />
            <span>Benutzerverwaltung</span>
          </TabsTrigger>
          <TabsTrigger value="messages" className="flex items-center space-x-2">
            <MessageSquare className="h-4 w-4" />
            <span>Nachrichten</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="bookings" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Buchungsverwaltung</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="pending">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="pending" className="flex items-center space-x-2">
                    <Clock className="h-4 w-4" />
                    <span>Ausstehend ({pendingBookings.length})</span>
                  </TabsTrigger>
                  <TabsTrigger value="approved" className="flex items-center space-x-2">
                    <Check className="h-4 w-4" />
                    <span>Genehmigt ({approvedBookings.length})</span>
                  </TabsTrigger>
                  <TabsTrigger value="rejected" className="flex items-center space-x-2">
                    <X className="h-4 w-4" />
                    <span>Abgelehnt ({rejectedBookings.length})</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="pending" className="mt-6">
                  <ScrollArea className="h-[600px] pr-4">
                    {pendingBookings.length === 0 ? (
                      <div className="text-center py-8">
                        <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Keine ausstehenden Anfragen</h3>
                        <p className="text-gray-600">Alle Buchungsanfragen wurden bearbeitet.</p>
                      </div>
                    ) : (
                      <div>
                        {pendingBookings.map((booking) => (
                          <BookingCard key={booking.id} booking={booking} showActions={true} />
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="approved" className="mt-6">
                  <ScrollArea className="h-[600px] pr-4">
                    {approvedBookings.length === 0 ? (
                      <div className="text-center py-8">
                        <Check className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Keine genehmigten Buchungen</h3>
                        <p className="text-gray-600">Es wurden noch keine Buchungen genehmigt.</p>
                      </div>
                    ) : (
                      <div>
                        {approvedBookings.map((booking) => (
                          <BookingCard key={booking.id} booking={booking} />
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="rejected" className="mt-6">
                  <ScrollArea className="h-[600px] pr-4">
                    {rejectedBookings.length === 0 ? (
                      <div className="text-center py-8">
                        <X className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Keine abgelehnten Buchungen</h3>
                        <p className="text-gray-600">Es wurden keine Buchungen abgelehnt.</p>
                      </div>
                    ) : (
                      <div>
                        {rejectedBookings.map((booking) => (
                          <BookingCard key={booking.id} booking={booking} />
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="mt-6">
          <UserManagement
            onApproveUser={onApproveUser || (() => {})}
            onRejectUser={onRejectUser || (() => {})}
          />
        </TabsContent>

        <TabsContent value="messages" className="mt-6">
          {onCreateMessage && onUpdateMessage && onDeleteMessage ? (
            <AdminMessageManagement
              messages={adminMessages}
              onCreateMessage={onCreateMessage}
              onUpdateMessage={onUpdateMessage}
              onDeleteMessage={onDeleteMessage}
            />
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nachrichten-Verwaltung nicht verfügbar</h3>
                <p className="text-gray-600">Die Nachrichten-Funktionen sind noch nicht vollständig konfiguriert.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Admin Booking Form Dialog */}
      <Dialog open={showAdminBookingForm} onOpenChange={setShowAdminBookingForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="sr-only">Admin-Buchung erstellen</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[80vh] pr-4">
            <AdminBookingForm
              onSubmit={(booking) => {
                onCreateAdminBooking(booking)
                setShowAdminBookingForm(false)
              }}
              onCancel={() => setShowAdminBookingForm(false)}
            />
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Booking Approval Dialog */}
      <BookingApprovalDialog
        booking={selectedBookingForApproval}
        open={!!selectedBookingForApproval}
        onOpenChange={(open) => !open && setSelectedBookingForApproval(null)}
        onApprove={(bookingId, sharedRiding) => {
          onApproveBooking(bookingId, sharedRiding)
          setSelectedBookingForApproval(null)
        }}
        onReject={(bookingId) => {
          onRejectBooking(bookingId)
          setSelectedBookingForApproval(null)
        }}
      />
    </div>
  )
}