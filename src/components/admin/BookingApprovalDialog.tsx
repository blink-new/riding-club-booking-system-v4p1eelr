import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Check, X, MapPin, Clock, Users, Calendar } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import type { Booking } from '@/types/booking'

interface BookingApprovalDialogProps {
  booking: Booking | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onApprove: (bookingId: string, sharedRiding: boolean) => void
  onReject: (bookingId: string) => void
}

export function BookingApprovalDialog({ 
  booking, 
  open, 
  onOpenChange, 
  onApprove, 
  onReject 
}: BookingApprovalDialogProps) {
  const [sharedRiding, setSharedRiding] = useState(false)

  if (!booking) return null

  const handleApprove = () => {
    onApprove(booking.id, sharedRiding)
    onOpenChange(false)
    setSharedRiding(false) // Reset for next booking
  }

  const handleReject = () => {
    onReject(booking.id)
    onOpenChange(false)
    setSharedRiding(false) // Reset for next booking
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Buchung genehmigen</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Booking Details */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-900 flex items-center space-x-2">
                <span>{format(parseISO(booking.date), 'EEEE, MMMM d, yyyy')}</span>
                {booking.isSubscription && (
                  <Badge variant="secondary" className="text-xs">
                    📅 Abo
                  </Badge>
                )}
              </h4>
              <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                Ausstehend
              </Badge>
            </div>

            <p className="text-sm text-gray-600">
              Angefragt von {booking.userName}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2 text-sm">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span>{booking.arenaType === 'indoor' ? 'Halle' : 'Platz'}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Clock className="h-4 w-4 text-gray-400" />
                <span>{booking.startTime} - {booking.endTime}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span>Angefragt {format(parseISO(booking.createdAt), 'MMM d, HH:mm')}</span>
              </div>
            </div>

            {booking.purpose && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Zweck:</p>
                <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">{booking.purpose}</p>
              </div>
            )}

            {booking.isSubscription && booking.subscriptionEndDate && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium text-blue-800 mb-1">Abo-Details:</p>
                <p className="text-sm text-blue-700">
                  Wöchentlich bis {format(parseISO(booking.subscriptionEndDate), 'dd.MM.yyyy')}
                </p>
              </div>
            )}
          </div>

          {/* Shared Riding Decision */}
          <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span>Andere Reiter erlauben</span>
                </Label>
                <p className="text-sm text-muted-foreground">
                  Entscheiden Sie, ob andere Reiter sich dieser Buchung anschließen können
                </p>
              </div>
              <Switch
                checked={sharedRiding}
                onCheckedChange={setSharedRiding}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button
              onClick={handleApprove}
              className="flex-1 flex items-center justify-center space-x-2"
            >
              <Check className="h-4 w-4" />
              <span>
                {booking.isSubscription ? 'Abo genehmigen' : 'Genehmigen'}
                {sharedRiding && ' (mit geteiltem Reiten)'}
              </span>
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              className="flex items-center space-x-2"
            >
              <X className="h-4 w-4" />
              <span>Ablehnen</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}