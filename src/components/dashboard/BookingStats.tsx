import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  TrendingUp, 
  TrendingDown,
  Activity,
  Target
} from 'lucide-react'
import { format, startOfWeek, endOfWeek, isWithinInterval, parseISO } from 'date-fns'
import { de } from 'date-fns/locale'
import type { Booking } from '@/types/booking'

interface BookingStatsProps {
  bookings: Booking[]
}

export function BookingStats({ bookings }: BookingStatsProps) {
  const now = new Date()
  const weekStart = startOfWeek(now, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 })

  // Calculate statistics
  const totalBookings = bookings.length
  const approvedBookings = bookings.filter(b => b.status === 'approved').length
  const pendingBookings = bookings.filter(b => b.status === 'pending').length
  const rejectedBookings = bookings.filter(b => b.status === 'rejected').length

  // This week's bookings
  const thisWeekBookings = bookings.filter(booking => {
    const bookingDate = parseISO(booking.date)
    return isWithinInterval(bookingDate, { start: weekStart, end: weekEnd })
  })

  // Arena usage
  const indoorBookings = bookings.filter(b => b.arenaType === 'indoor').length
  const outdoorBookings = bookings.filter(b => b.arenaType === 'outdoor').length

  // Shared riding statistics
  const sharedBookings = bookings.filter(b => b.sharedRiding).length
  const totalCapacity = bookings.reduce((sum, b) => sum + (b.maxRiders || 1), 0)
  const currentOccupancy = bookings.reduce((sum, b) => sum + (b.currentRiders || 1), 0)

  // Subscription bookings
  const subscriptionBookings = bookings.filter(b => b.isSubscription).length

  // Approval rate
  const approvalRate = totalBookings > 0 ? (approvedBookings / totalBookings) * 100 : 0

  // Peak hours analysis
  const hourCounts = bookings.reduce((acc, booking) => {
    const hour = parseInt(booking.startTime.split(':')[0])
    acc[hour] = (acc[hour] || 0) + 1
    return acc
  }, {} as Record<number, number>)

  const peakHour = Object.entries(hourCounts).reduce((peak, [hour, count]) => 
    count > peak.count ? { hour: parseInt(hour), count } : peak
  , { hour: 0, count: 0 })

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Weekly Overview */}
      <Card className="col-span-full lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-primary" />
            <span>Diese Woche</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{thisWeekBookings.length}</div>
              <div className="text-sm text-muted-foreground">Buchungen</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {thisWeekBookings.filter(b => b.status === 'approved').length}
              </div>
              <div className="text-sm text-muted-foreground">Genehmigt</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {thisWeekBookings.filter(b => b.status === 'pending').length}
              </div>
              <div className="text-sm text-muted-foreground">Ausstehend</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{subscriptionBookings}</div>
              <div className="text-sm text-muted-foreground">Abos</div>
            </div>
          </div>
          <div className="mt-4 text-sm text-muted-foreground">
            {format(weekStart, 'dd.MM', { locale: de })} - {format(weekEnd, 'dd.MM.yyyy', { locale: de })}
          </div>
        </CardContent>
      </Card>

      {/* Approval Rate */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-primary" />
            <span>Genehmigungsrate</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{approvalRate.toFixed(0)}%</div>
              <div className="text-sm text-muted-foreground">Ihrer Buchungen</div>
            </div>
            <Progress value={approvalRate} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{approvedBookings} genehmigt</span>
              <span>{rejectedBookings} abgelehnt</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Arena Usage */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="h-5 w-5 text-primary" />
            <span>Arena-Nutzung</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm">Halle</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">{indoorBookings}</span>
                <Badge variant="secondary" className="text-xs">
                  {totalBookings > 0 ? ((indoorBookings / totalBookings) * 100).toFixed(0) : 0}%
                </Badge>
              </div>
            </div>
            <Progress value={totalBookings > 0 ? (indoorBookings / totalBookings) * 100 : 0} className="h-2" />
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm">Platz</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">{outdoorBookings}</span>
                <Badge variant="secondary" className="text-xs">
                  {totalBookings > 0 ? ((outdoorBookings / totalBookings) * 100).toFixed(0) : 0}%
                </Badge>
              </div>
            </div>
            <Progress value={totalBookings > 0 ? (outdoorBookings / totalBookings) * 100 : 0} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Shared Riding Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-primary" />
            <span>Geteiltes Reiten</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{sharedBookings}</div>
              <div className="text-sm text-muted-foreground">Geteilte Buchungen</div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Auslastung</span>
                <span>{currentOccupancy}/{totalCapacity}</span>
              </div>
              <Progress 
                value={totalCapacity > 0 ? (currentOccupancy / totalCapacity) * 100 : 0} 
                className="h-2" 
              />
            </div>

            <div className="text-xs text-muted-foreground text-center">
              {totalBookings > 0 ? ((sharedBookings / totalBookings) * 100).toFixed(0) : 0}% aller Buchungen
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Peak Hours */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-primary" />
            <span>Stoßzeiten</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {peakHour.hour.toString().padStart(2, '0')}:00
              </div>
              <div className="text-sm text-muted-foreground">Beliebteste Zeit</div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Buchungen</span>
                <span>{peakHour.count}</span>
              </div>
              <Progress 
                value={totalBookings > 0 ? (peakHour.count / totalBookings) * 100 : 0} 
                className="h-2" 
              />
            </div>

            <div className="text-xs text-muted-foreground">
              {Object.keys(hourCounts).length} verschiedene Uhrzeiten gebucht
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <span>Buchungsübersicht</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-xl font-bold text-green-600">{approvedBookings}</div>
              <div className="text-sm text-green-700">Genehmigt</div>
              <div className="text-xs text-green-600 mt-1">
                {totalBookings > 0 ? ((approvedBookings / totalBookings) * 100).toFixed(0) : 0}%
              </div>
            </div>
            
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-xl font-bold text-yellow-600">{pendingBookings}</div>
              <div className="text-sm text-yellow-700">Ausstehend</div>
              <div className="text-xs text-yellow-600 mt-1">
                {totalBookings > 0 ? ((pendingBookings / totalBookings) * 100).toFixed(0) : 0}%
              </div>
            </div>
            
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-xl font-bold text-red-600">{rejectedBookings}</div>
              <div className="text-sm text-red-700">Abgelehnt</div>
              <div className="text-xs text-red-600 mt-1">
                {totalBookings > 0 ? ((rejectedBookings / totalBookings) * 100).toFixed(0) : 0}%
              </div>
            </div>
            
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-xl font-bold text-blue-600">{totalBookings}</div>
              <div className="text-sm text-blue-700">Gesamt</div>
              <div className="text-xs text-blue-600 mt-1">
                Alle Buchungen
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}