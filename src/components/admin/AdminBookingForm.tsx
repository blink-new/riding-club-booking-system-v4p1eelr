import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Calendar, Clock, MapPin, Settings, Repeat } from 'lucide-react'
import { format } from 'date-fns'

interface AdminBookingFormProps {
  onSubmit: (booking: any) => void
  onCancel: () => void
}

export function AdminBookingForm({ onSubmit, onCancel }: AdminBookingFormProps) {
  const [formData, setFormData] = useState({
    arenaType: '',
    date: '',
    startTime: '',
    endTime: '',
    purpose: '',
    bookingType: 'lesson',
    isSubscription: false,
    subscriptionEndDate: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    onSubmit({
      ...formData,
      id: `admin_booking_${Date.now()}`,
      userId: 'admin',
      userName: 'Admin',
      status: 'approved',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      rakeRequired: false,
      sharedRiding: false,
      currentRiders: 1,
      maxRiders: 1
    })
  }

  const generateTimeSlots = () => {
    const slots = []
    for (let hour = 8; hour <= 20; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        slots.push(timeString)
      }
    }
    return slots
  }

  const timeSlots = generateTimeSlots()

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Settings className="h-5 w-5 text-primary" />
          <span>Admin-Buchung erstellen</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Booking Type */}
          <div className="space-y-2">
            <Label htmlFor="bookingType">Buchungstyp</Label>
            <Select value={formData.bookingType} onValueChange={(value) => setFormData({ ...formData, bookingType: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Buchungstyp auswählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lesson">Reitstunde</SelectItem>
                <SelectItem value="maintenance">Wartung/Platzpflege</SelectItem>
                <SelectItem value="course">Kurs</SelectItem>
                <SelectItem value="event">Event/Veranstaltung</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Arena Selection */}
          <div className="space-y-2">
            <Label htmlFor="arena" className="flex items-center space-x-2">
              <MapPin className="h-4 w-4" />
              <span>Arena</span>
            </Label>
            <Select value={formData.arenaType} onValueChange={(value) => setFormData({ ...formData, arenaType: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Arena auswählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="indoor">Halle</SelectItem>
                <SelectItem value="outdoor">Platz</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Subscription Toggle */}
          <div className="space-y-4 p-4 border rounded-lg bg-blue-50/50">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="flex items-center space-x-2">
                  <Repeat className="h-4 w-4" />
                  <span>Wöchentliches Abo</span>
                </Label>
                <p className="text-sm text-muted-foreground">
                  Erstelle eine wiederkehrende wöchentliche Buchung
                </p>
              </div>
              <Switch
                checked={formData.isSubscription}
                onCheckedChange={(checked) => setFormData({ ...formData, isSubscription: checked })}
              />
            </div>
          </div>

          {/* Date Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">
                {formData.isSubscription ? 'Startdatum' : 'Datum'}
              </Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                min={format(new Date(), 'yyyy-MM-dd')}
                required
              />
            </div>
            
            {formData.isSubscription && (
              <div className="space-y-2">
                <Label htmlFor="subscriptionEndDate">Enddatum</Label>
                <Input
                  id="subscriptionEndDate"
                  type="date"
                  value={formData.subscriptionEndDate}
                  onChange={(e) => setFormData({ ...formData, subscriptionEndDate: e.target.value })}
                  min={formData.date || format(new Date(), 'yyyy-MM-dd')}
                  required={formData.isSubscription}
                />
              </div>
            )}
          </div>

          {/* Time Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>Startzeit</span>
              </Label>
              <Select value={formData.startTime} onValueChange={(value) => setFormData({ ...formData, startTime: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Startzeit" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {timeSlots.map((time) => (
                    <SelectItem key={time} value={time}>{time}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Endzeit</Label>
              <Select value={formData.endTime} onValueChange={(value) => setFormData({ ...formData, endTime: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Endzeit" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {timeSlots.map((time) => (
                    <SelectItem key={time} value={time}>{time}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Purpose */}
          <div className="space-y-2">
            <Label htmlFor="purpose">Beschreibung/Zweck</Label>
            <Textarea
              id="purpose"
              placeholder="Beschreiben Sie den Zweck der Buchung..."
              value={formData.purpose}
              onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
              rows={3}
              required
            />
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <Button type="submit" className="flex-1">
              {formData.isSubscription ? (
                <>
                  <Repeat className="h-4 w-4 mr-2" />
                  Abo-Buchung erstellen
                </>
              ) : (
                'Buchung erstellen'
              )}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Abbrechen
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}