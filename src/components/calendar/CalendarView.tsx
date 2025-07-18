import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChevronLeft, ChevronRight, Calendar, MapPin, Clock, Users, Check, X } from 'lucide-react'
import { 
  format, 
  addMonths, 
  subMonths, 
  addWeeks,
  subWeeks,
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  addDays, 
  isSameDay, 
  isSameMonth, 
  parseISO 
} from 'date-fns'
import { de } from 'date-fns/locale'
import type { Booking } from '@/types/booking'

interface CalendarViewProps {
  bookings: Booking[]
  onBookingClick: (booking: Booking) => void
}

export function CalendarView({ bookings, onBookingClick }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedArena, setSelectedArena] = useState<'all' | 'indoor' | 'outdoor'>('all')
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month')

  // Only show approved bookings in calendar
  const visibleBookings = bookings.filter(booking => booking.status === 'approved')

  // Calculate calendar range based on view mode
  const calendarStart = viewMode === 'month' 
    ? startOfWeek(startOfMonth(currentDate), { weekStartsOn: 1 })
    : startOfWeek(currentDate, { weekStartsOn: 1 })
  
  const calendarEnd = viewMode === 'month'
    ? endOfWeek(endOfMonth(currentDate), { weekStartsOn: 1 })
    : endOfWeek(currentDate, { weekStartsOn: 1 })

  const calendarDays = []
  let day = calendarStart
  while (day <= calendarEnd) {
    calendarDays.push(day)
    day = addDays(day, 1)
  }

  const getBookingsForDay = (date: Date) => {
    return visibleBookings.filter(booking => {
      const bookingDate = parseISO(booking.date)
      const matchesDate = isSameDay(bookingDate, date)
      const matchesArena = selectedArena === 'all' || booking.arenaType === selectedArena
      return matchesDate && matchesArena
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-200 text-green-900 border-green-300'
      case 'pending':
        return 'bg-yellow-200 text-yellow-900 border-yellow-300'
      default:
        return 'bg-gray-200 text-gray-900 border-gray-300'
    }
  }

  const navigate = (direction: 'prev' | 'next') => {
    if (viewMode === 'month') {
      setCurrentDate(prev => direction === 'next' ? addMonths(prev, 1) : subMonths(prev, 1))
    } else {
      setCurrentDate(prev => direction === 'next' ? addWeeks(prev, 1) : subWeeks(prev, 1))
    }
  }

  const getBookingTypeColor = (bookingType?: string) => {
    switch (bookingType) {
      case 'lesson':
        return 'bg-blue-200 text-blue-900 border-blue-300'
      case 'maintenance':
        return 'bg-orange-200 text-orange-900 border-orange-300'
      case 'course':
        return 'bg-purple-200 text-purple-900 border-purple-300'
      case 'event':
        return 'bg-pink-200 text-pink-900 border-pink-300'
      default:
        return 'bg-gray-200 text-gray-900 border-gray-300'
    }
  }

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-primary" />
              <span>{viewMode === 'month' ? 'Monatskalender' : 'Wochenkalender'}</span>
            </CardTitle>
            <div className="flex items-center space-x-4">
              {/* View Mode Toggle */}
              <div className="flex space-x-1">
                <Button
                  size="sm"
                  variant={viewMode === 'month' ? 'default' : 'outline'}
                  onClick={() => setViewMode('month')}
                >
                  Monat
                </Button>
                <Button
                  size="sm"
                  variant={viewMode === 'week' ? 'default' : 'outline'}
                  onClick={() => setViewMode('week')}
                >
                  Woche
                </Button>
              </div>

              {/* Arena Filter */}
              <div className="flex space-x-1">
                <Button
                  size="sm"
                  variant={selectedArena === 'all' ? 'default' : 'outline'}
                  onClick={() => setSelectedArena('all')}
                >
                  Alle
                </Button>
                <Button
                  size="sm"
                  variant={selectedArena === 'indoor' ? 'default' : 'outline'}
                  onClick={() => setSelectedArena('indoor')}
                >
                  Halle
                </Button>
                <Button
                  size="sm"
                  variant={selectedArena === 'outdoor' ? 'default' : 'outline'}
                  onClick={() => setSelectedArena('outdoor')}
                >
                  Platz
                </Button>
              </div>
              
              {/* Navigation */}
              <div className="flex items-center space-x-2">
                <Button size="sm" variant="outline" onClick={() => navigate('prev')}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium min-w-[140px] text-center">
                  {viewMode === 'month' 
                    ? format(currentDate, 'MMMM yyyy', { locale: de })
                    : `${format(startOfWeek(currentDate, { weekStartsOn: 1 }), 'dd.MM', { locale: de })} - ${format(endOfWeek(currentDate, { weekStartsOn: 1 }), 'dd.MM.yyyy', { locale: de })}`
                  }
                </span>
                <Button size="sm" variant="outline" onClick={() => navigate('next')}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Calendar Grid */}
      <Card>
        <CardContent className="p-0">
          <div className="grid grid-cols-7 border-b">
            {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map((day) => (
              <div key={day} className="p-3 bg-gray-50 text-center font-medium text-sm border-r last:border-r-0">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7">
            {calendarDays.map((day, index) => {
              const dayBookings = getBookingsForDay(day)
              const isCurrentMonth = viewMode === 'month' ? isSameMonth(day, currentDate) : true
              const isToday = isSameDay(day, new Date())
              
              return (
                <div 
                  key={day.toISOString()} 
                  className={`min-h-[120px] p-2 border-r border-b last:border-r-0 ${
                    !isCurrentMonth ? 'bg-gray-50/50 text-gray-400' : ''
                  } ${isToday ? 'bg-blue-50' : ''}`}
                >
                  <div className={`text-sm font-medium mb-2 ${isToday ? 'text-blue-600' : ''}`}>
                    {format(day, 'd')}
                  </div>
                  
                  <div className="space-y-1">
                    {dayBookings.map((booking) => (
                      <div
                        key={booking.id}
                        onClick={() => onBookingClick(booking)}
                        className={`p-1 rounded text-xs cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-105 ${
                          booking.bookingType && booking.bookingType !== 'member' ? getBookingTypeColor(booking.bookingType) : getStatusColor(booking.status)
                        } ${!booking.sharedRiding ? 'bg-stripes' : ''}`}
                        style={!booking.sharedRiding ? {
                          backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px)'
                        } : {}}
                      >
                        <div className="flex items-center space-x-1 mb-1">
                          <MapPin className="h-3 w-3" />
                          <span className="font-medium truncate">
                            {booking.arenaType === 'indoor' ? 'Halle' : 'Platz'}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-1 mb-1">
                          <Clock className="h-3 w-3" />
                          <span className="truncate">{booking.startTime}-{booking.endTime}</span>
                        </div>
                        
                        <div className="text-xs font-medium truncate mb-1">
                          {booking.purpose || booking.userName}
                        </div>
                        
                        {booking.isSubscription && (
                          <div className="text-xs text-blue-600 font-medium mb-1">
                            📅 Abo
                          </div>
                        )}
                        
                        {booking.bookingType !== 'member' && (
                          <div className="text-xs text-gray-600 truncate mb-1">
                            {booking.bookingType === 'lesson' ? 'Reitstunde' :
                             booking.bookingType === 'maintenance' ? 'Wartung' :
                             booking.bookingType === 'course' ? 'Kurs' :
                             booking.bookingType === 'event' ? 'Event' : ''}
                          </div>
                        )}
                        
                        <div className="flex items-center space-x-1 mb-1">
                          {booking.sharedRiding ? (
                            <Check className="h-3 w-3 text-green-600" />
                          ) : (
                            <X className="h-3 w-3 text-red-600" />
                          )}
                        </div>
                        

                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex items-center space-x-6">
              <span className="text-sm font-medium">Buchungstypen:</span>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded bg-gray-200 border border-gray-300"></div>
                  <span className="text-sm">Mitglied</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded bg-blue-200 border border-blue-300"></div>
                  <span className="text-sm">Reitstunde</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded bg-orange-200 border border-orange-300"></div>
                  <span className="text-sm">Wartung</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded bg-purple-200 border border-purple-300"></div>
                  <span className="text-sm">Kurs</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded bg-pink-200 border border-pink-300"></div>
                  <span className="text-sm">Event</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <span className="text-sm font-medium">Hinweis:</span>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded bg-green-200 border border-green-300"></div>
                  <span className="text-sm">Nur genehmigte Termine werden angezeigt</span>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Andere Reiter erlaubt</span>
                </div>
                <div className="flex items-center space-x-2">
                  <X className="h-4 w-4 text-red-600" />
                  <span className="text-sm">Andere Reiter nicht erlaubt</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-4 h-4 rounded border border-gray-300"
                    style={{
                      backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(0,0,0,0.2) 2px, rgba(0,0,0,0.2) 4px)',
                      backgroundColor: '#f3f4f6'
                    }}
                  ></div>
                  <span className="text-sm">Schraffiert = Keine anderen Reiter erlaubt</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}