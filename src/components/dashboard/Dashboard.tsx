import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Plus, Calendar, Clock, MapPin, Users, CheckCircle, XCircle, AlertCircle, BarChart3, Trash2, Check, X, Info, MessageSquare } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { BookingStats } from './BookingStats'
import { AdminMessages } from './AdminMessages'
import type { Booking } from '@/types/booking'
import type { AdminMessage } from '@/types/message'

interface DashboardProps {
  bookings: Booking[]
  onNewBooking: () => void
  onBookingClick: (booking: Booking) => void
  onDeleteBooking: (bookingId: string) => void
  onDeleteSingleAppointment: (bookingId: string) => void
  adminMessages?: AdminMessage[]
}

export function Dashboard({ bookings, onNewBooking, onBookingClick, onDeleteBooking, onDeleteSingleAppointment, adminMessages = [] }: DashboardProps) {
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')

  const filteredBookings = bookings.filter(booking => 
    filter === 'all' || booking.status === filter
  )

  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    approved: bookings.filter(b => b.status === 'approved').length,
    rejected: bookings.filter(b => b.status === 'rejected').length
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return null
    }
  }

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
          <p className="text-gray-600">Verwalten Sie Ihre Buchungen</p>
          {bookings.length === 0 && (
            <p className="text-sm text-primary mt-1">
              Willkommen! Erstellen Sie Ihre erste Buchung.
            </p>
          )}
        </div>
        <Button onClick={onNewBooking} className="flex items-center space-x-2 hover:scale-105 transition-transform">
          <Plus className="h-4 w-4" />
          <span>Neue Buchung</span>
        </Button>
      </div>



      {/* Dashboard Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview" className="flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span>Übersicht</span>
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>Statistiken</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          {/* Admin Messages */}
          <AdminMessages messages={adminMessages} />
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="hover:shadow-lg transition-all duration-200 hover:scale-[1.02] animate-in fade-in-0 slide-in-from-left-2">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Buchungen gesamt</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                  </div>
                  <Calendar className="h-8 w-8 text-gray-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-200 hover:scale-[1.02] animate-in fade-in-0 slide-in-from-left-2 delay-75">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Ausstehend</p>
                    <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                  </div>
                  <AlertCircle className="h-8 w-8 text-yellow-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-200 hover:scale-[1.02] animate-in fade-in-0 slide-in-from-left-2 delay-150">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Genehmigt</p>
                    <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-200 hover:scale-[1.02] animate-in fade-in-0 slide-in-from-left-2 delay-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Abgelehnt</p>
                    <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
                  </div>
                  <XCircle className="h-8 w-8 text-red-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bookings List */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Ihre Buchungen</CardTitle>
                <div className="flex space-x-1">
                  <Button
                    size="sm"
                    variant={filter === 'all' ? 'default' : 'outline'}
                    onClick={() => setFilter('all')}
                  >
                    Alle
                  </Button>
                  <Button
                    size="sm"
                    variant={filter === 'pending' ? 'default' : 'outline'}
                    onClick={() => setFilter('pending')}
                  >
                    Ausstehend
                  </Button>
                  <Button
                    size="sm"
                    variant={filter === 'approved' ? 'default' : 'outline'}
                    onClick={() => setFilter('approved')}
                  >
                    Genehmigt
                  </Button>
                  <Button
                    size="sm"
                    variant={filter === 'rejected' ? 'default' : 'outline'}
                    onClick={() => setFilter('rejected')}
                  >
                    Abgelehnt
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredBookings.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Buchungen gefunden</h3>
                  <p className="text-gray-600 mb-4">
                    {filter === 'all' 
                      ? "Sie haben noch keine Buchungen vorgenommen." 
                      : `Keine ${filter === 'pending' ? 'ausstehenden' : filter === 'approved' ? 'genehmigten' : 'abgelehnten'} Buchungen gefunden.`
                    }
                  </p>
                  <Button onClick={onNewBooking}>Erstellen Sie Ihre erste Buchung</Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="p-4 border rounded-lg hover:bg-gray-50 transition-all duration-200 hover:shadow-md hover:scale-[1.02] animate-in fade-in-0 slide-in-from-bottom-2"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div 
                          className="flex items-center space-x-3 cursor-pointer flex-1"
                          onClick={() => onBookingClick(booking)}
                        >
                          {getStatusIcon(booking.status)}
                          <div>
                            <h4 className="font-medium text-gray-900 flex items-center space-x-2">
                              <span>{format(parseISO(booking.date), 'EEEE, MMMM d, yyyy')}</span>
                              {booking.isSubscription && (
                                <Badge variant="secondary" className="text-xs">
                                  📅 Abo
                                </Badge>
                              )}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {booking.purpose || 'Kein Zweck angegeben'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusColor(booking.status)}>
                            {booking.status === 'pending' ? 'Ausstehend' : booking.status === 'approved' ? 'Genehmigt' : 'Abgelehnt'}
                          </Badge>
                          {/* Delete buttons */}
                          {booking.parentSubscriptionId ? (
                            // Individual appointment in subscription
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation()
                                onDeleteSingleAppointment(booking.id)
                              }}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          ) : (
                            // Regular booking or subscription parent
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation()
                                onDeleteBooking(booking.id)
                              }}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span>{booking.arenaType === 'indoor' ? '🏠 Halle' : '🌤️ Platz'}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span>{booking.startTime} - {booking.endTime}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4 text-gray-400" />
                          <span>Andere Reiter: </span>
                          {booking.sharedRiding ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <X className="h-4 w-4 text-red-600" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="mt-6">
          <BookingStats bookings={bookings} />
        </TabsContent>
      </Tabs>
    </div>
  )
}