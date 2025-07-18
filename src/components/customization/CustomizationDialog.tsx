import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Palette, Save, RotateCcw } from 'lucide-react'

interface CustomizationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (settings: any) => void
  currentSettings: {
    clubName: string
    subtitle: string
    primaryColor: string
  }
}

const presetColors = [
  { name: 'Braun (Standard)', value: '#8B4513' },
  { name: 'Dunkelgrün', value: '#2D5016' },
  { name: 'Marineblau', value: '#1E3A8A' },
  { name: 'Burgunderrot', value: '#7C2D12' },
  { name: 'Waldgrün', value: '#14532D' },
  { name: 'Schiefergrau', value: '#475569' }
]

export function CustomizationDialog({ open, onOpenChange, onSave, currentSettings }: CustomizationDialogProps) {
  const [formData, setFormData] = useState(currentSettings)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
    onOpenChange(false)
  }

  const handleReset = () => {
    setFormData({
      clubName: 'Reitverein Driedorf',
      subtitle: 'Buchungssystem',
      primaryColor: '#8B4513'
    })
  }

  const handleColorSelect = (color: string) => {
    setFormData({ ...formData, primaryColor: color })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Palette className="h-5 w-5 text-primary" />
            <span>Reitclub anpassen</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Club Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Club-Informationen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="clubName">Club-Name</Label>
                <Input
                  id="clubName"
                  value={formData.clubName}
                  onChange={(e) => setFormData({ ...formData, clubName: e.target.value })}
                  placeholder="Name Ihres Reitvereins"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subtitle">Untertitel</Label>
                <Input
                  id="subtitle"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  placeholder="Buchungssystem"
                />
              </div>
            </CardContent>
          </Card>

          {/* Color Customization */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Farbschema</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Primärfarbe</Label>
                <div className="flex items-center space-x-3">
                  <Input
                    type="color"
                    value={formData.primaryColor}
                    onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                    className="w-16 h-10 p-1 border rounded"
                  />
                  <Input
                    type="text"
                    value={formData.primaryColor}
                    onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                    placeholder="#8B4513"
                    className="font-mono"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Vorgefertigte Farben</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {presetColors.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => handleColorSelect(color.value)}
                      className={`flex items-center space-x-2 p-2 rounded border hover:bg-gray-50 transition-colors ${
                        formData.primaryColor === color.value ? 'ring-2 ring-blue-500' : ''
                      }`}
                    >
                      <div
                        className="w-6 h-6 rounded border"
                        style={{ backgroundColor: color.value }}
                      />
                      <span className="text-sm">{color.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Vorschau</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-4 bg-white">
                <div className="flex items-center space-x-3">
                  <div 
                    className="p-2 rounded-lg"
                    style={{ backgroundColor: formData.primaryColor }}
                  >
                    <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.5 6c-.61 0-1.17.22-1.61.59L17.5 8l-1.39-1.41C15.67 6.22 15.11 6 14.5 6c-.61 0-1.17.22-1.61.59L11.5 8l-1.39-1.41C9.67 6.22 9.11 6 8.5 6c-.61 0-1.17.22-1.61.59L5.5 8l-1.39-1.41C3.67 6.22 3.11 6 2.5 6c-.83 0-1.5.67-1.5 1.5v9c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V9.41l.89.89c.44.44 1 .66 1.61.66s1.17-.22 1.61-.66L8.5 8.91l1.39 1.39c.44.44 1 .66 1.61.66s1.17-.22 1.61-.66L14.5 8.91l1.39 1.39c.44.44 1 .66 1.61.66s1.17-.22 1.61-.66l.89-.89V16.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-9c0-.83-.67-1.5-1.5-1.5z"/>
                      <circle cx="6" cy="4" r="2"/>
                      <circle cx="12" cy="4" r="2"/>
                      <circle cx="18" cy="4" r="2"/>
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-xl font-semibold text-gray-900">{formData.clubName}</h1>
                    <p className="text-sm text-gray-500">{formData.subtitle}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-between pt-4">
            <Button type="button" variant="outline" onClick={handleReset}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Zurücksetzen
            </Button>
            <div className="flex space-x-3">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Abbrechen
              </Button>
              <Button type="submit">
                <Save className="h-4 w-4 mr-2" />
                Speichern
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}