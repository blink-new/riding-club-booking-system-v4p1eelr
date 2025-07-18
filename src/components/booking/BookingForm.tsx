import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Calendar, Clock, MapPin, Users, BookOpen, AlertTriangle, Repeat } from 'lucide-react'
import { format, addMinutes, parse, addWeeks } from 'date-fns'
import type { BookingTemplate } from '@/types/booking'

interface BookingFormProps {
  onSubmit: (booking: any) => void
  onCancel: () => void
  userName: string
}

const bookingTemplates: BookingTemplate[] = [
  {
    id: 'template_jumping',
    name: 'Springstunde',
    description: 'Springtraining und Parcours',
    defaultDuration: 60,
    createdAt: new Date().toISOString()
  },
  {
    id: 'template_dressage',
    name: 'Dressurstunde', 
    description: 'Dressurtraining und Lektionen',
    defaultDuration: 60,
    createdAt: new Date().toISOString()
  },
  {
    id: 'template_riding',
    name: 'Reitstunde',
    description: 'Allgemeine Reitstunde',
    defaultDuration: 60,
    createdAt: new Date().toISOString()
  }
]

export function BookingForm({ onSubmit, onCancel, userName }: BookingFormProps) {
  const [formData, setFormData] = useState({
    arenaType: '',
    date: '',
    startTime: '',
    endTime: '',
    purpose: '',
    templateType: '',
    isSubscription: false,
    subscriptionEndDate: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  const validateForm = () => {
    const errors: string[] = []
    
    if (!formData.arenaType) errors.push('Bitte wählen Sie Platz/ Halle aus')
    if (!formData.date) errors.push('Bitte wählen Sie ein Datum aus')
    if (!formData.startTime) errors.push('Bitte wählen Sie eine Startzeit aus')
    if (!formData.endTime) errors.push('Bitte wählen Sie eine Endzeit aus')
    
    // Time validation
    if (formData.startTime && formData.endTime) {
      const startTime = parse(formData.startTime, 'HH:mm', new Date())
      const endTime = parse(formData.endTime, 'HH:mm', new Date())
      
      if (endTime <= startTime) {
        errors.push('Die Endzeit muss nach der Startzeit liegen')
      }
      
      const duration = (endTime.getTime() - startTime.getTime()) / (1000 * 60) // minutes
      if (duration < 30) {
        errors.push('Die Mindestbuchungsdauer beträgt 30 Minuten')
      }
      if (duration > 180) {
        errors.push('Die maximale Buchungsdauer beträgt 3 Stunden')
      }
    }
    
    // Subscription validation
    if (formData.isSubscription && !formData.subscriptionEndDate) {
      errors.push('Bitte wählen Sie ein Enddatum für das Abo aus')
    }
    
    if (formData.isSubscription && formData.subscriptionEndDate) {
      const endDate = new Date(formData.subscriptionEndDate)
      const startDate = new Date(formData.date)
      
      if (endDate <= startDate) {
        errors.push('Das Abo-Enddatum muss nach dem Startdatum liegen')
      }
      
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
      const diffWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7))
      
      if (diffWeeks > 52) {
        errors.push('Ein Abo kann maximal 52 Wochen dauern')
      }
    }
    
    setValidationErrors(errors)
    return errors.length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setIsSubmitting(true)
    
    try {
      const selectedTemplate = bookingTemplates.find(t => t.id === formData.templateType)
      
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      
      onSubmit({
        ...formData,
        id: `booking_${Date.now()}`,
        userId: 'current_user',
        userName: userName,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        purpose: formData.purpose || selectedTemplate?.name || '',
        currentRiders: 1,
        rakeRequired: false,
        bookingType: 'member',
        sharedRiding: false, // Default to false, admin will decide during approval
        maxRiders: 1
      })
    } finally {
      setIsSubmitting(false)
    }
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

  const handleTemplateChange = (templateId: string) => {
    const template = bookingTemplates.find(t => t.id === templateId)
    if (template) {
      setFormData(prev => ({
        ...prev,
        templateType: templateId,
        purpose: template.name
      }))
      
      // Auto-set end time based on template duration
      if (formData.startTime && template.defaultDuration) {
        const startTime = parse(formData.startTime, 'HH:mm', new Date())
        const endTime = addMinutes(startTime, template.defaultDuration)
        setFormData(prev => ({
          ...prev,
          endTime: format(endTime, 'HH:mm')
        }))
      }
    }
  }

  const handleStartTimeChange = (startTime: string) => {
    setFormData(prev => ({ ...prev, startTime }))
    
    // Auto-calculate end time if template is selected
    const selectedTemplate = bookingTemplates.find(t => t.id === formData.templateType)
    if (selectedTemplate && selectedTemplate.defaultDuration) {
      const start = parse(startTime, 'HH:mm', new Date())
      const end = addMinutes(start, selectedTemplate.defaultDuration)
      setFormData(prev => ({ ...prev, endTime: format(end, 'HH:mm') }))
    }
  }

  const calculateSubscriptionWeeks = () => {
    if (!formData.date || !formData.subscriptionEndDate) return 0
    const startDate = new Date(formData.date)
    const endDate = new Date(formData.subscriptionEndDate)
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7))
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Calendar className="h-5 w-5 text-primary" />
          <span>Buchung anfragen</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <ul className="list-disc list-inside space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Arena Selection */}
          <div className="space-y-2">
            <Label htmlFor="arena" className="flex items-center space-x-2">
              <MapPin className="h-4 w-4" />
              <span>Platz/ Halle</span>
            </Label>
            <Select value={formData.arenaType} onValueChange={(value) => setFormData({ ...formData, arenaType: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Platz/ Halle auswählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="indoor">🏠 Reithalle (Indoor)</SelectItem>
                <SelectItem value="outdoor">🌤️ Reitplatz (Outdoor)</SelectItem>
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
                {formData.date && formData.subscriptionEndDate && (
                  <p className="text-sm text-muted-foreground">
                    📅 {calculateSubscriptionWeeks()} Wochen ({calculateSubscriptionWeeks()} Buchungen)
                  </p>
                )}
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
              <Select value={formData.startTime} onValueChange={handleStartTimeChange}>
                <SelectTrigger className="h-10">
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
                <SelectTrigger className="h-10">
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

          {/* Template Selection */}
          <div className="space-y-2">
            <Label className="flex items-center space-x-2">
              <BookOpen className="h-4 w-4" />
              <span>Vorlage (Optional)</span>
            </Label>
            <Select value={formData.templateType} onValueChange={handleTemplateChange}>
              <SelectTrigger>
                <SelectValue placeholder="Vorlage auswählen" />
              </SelectTrigger>
              <SelectContent>
                {bookingTemplates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    <div>
                      <div className="font-medium">{template.name}</div>
                      <div className="text-sm text-gray-500">{template.description} • {template.defaultDuration} Min</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Purpose */}
          <div className="space-y-2">
            <Label htmlFor="purpose">Zweck / Beschreibung</Label>
            <Textarea
              id="purpose"
              placeholder="Beschreiben Sie den Zweck Ihrer Buchung..."
              value={formData.purpose}
              onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
              rows={3}
            />
          </div>



          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <Button 
              type="submit" 
              className="flex-1" 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Wird gesendet...
                </>
              ) : (
                <>
                  {formData.isSubscription ? (
                    <>
                      <Repeat className="h-4 w-4 mr-2" />
                      Abo-Anfrage senden
                    </>
                  ) : (
                    'Anfrage senden'
                  )}
                </>
              )}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
              Abbrechen
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}