import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { User, Heart, Mail, Save } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface UserProfileProps {
  user: any
  onUpdateProfile: (profileData: any) => void
}

export function UserProfile({ user, onUpdateProfile }: UserProfileProps) {
  const [formData, setFormData] = useState({
    displayName: user.displayName || '',
    email: user.email || '',
    horseName: user.horseName || ''
  })
  const [isEditing, setIsEditing] = useState(false)
  const { toast } = useToast()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    onUpdateProfile({
      ...user,
      ...formData
    })
    
    setIsEditing(false)
    toast({
      title: 'Profil aktualisiert',
      description: 'Ihre Profildaten wurden erfolgreich gespeichert.',
    })
  }

  const handleCancel = () => {
    setFormData({
      displayName: user.displayName || '',
      email: user.email || '',
      horseName: user.horseName || ''
    })
    setIsEditing(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Benutzerprofil</h2>
        <p className="text-gray-600">Verwalten Sie Ihre persönlichen Daten</p>
      </div>

      {/* Profile Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5 text-primary" />
              <span>Persönliche Informationen</span>
            </CardTitle>
            {!isEditing && (
              <Button onClick={() => setIsEditing(true)} variant="outline">
                Bearbeiten
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Display Name */}
              <div className="space-y-2">
                <Label htmlFor="displayName" className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>Anzeigename</span>
                </Label>
                <Input
                  id="displayName"
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  placeholder="Ihr Anzeigename"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <span>E-Mail-Adresse</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="ihre.email@beispiel.de"
                />
              </div>

              {/* Horse Name */}
              <div className="space-y-2">
                <Label htmlFor="horseName" className="flex items-center space-x-2">
                  <Heart className="h-4 w-4" />
                  <span>Name Ihres Pferdes</span>
                </Label>
                <Input
                  id="horseName"
                  value={formData.horseName}
                  onChange={(e) => setFormData({ ...formData, horseName: e.target.value })}
                  placeholder="Name Ihres Pferdes (optional)"
                />
              </div>

              {/* Actions */}
              <div className="flex space-x-3 pt-4">
                <Button type="submit" className="flex items-center space-x-2">
                  <Save className="h-4 w-4" />
                  <span>Speichern</span>
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Abbrechen
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              {/* Display Name */}
              <div className="flex items-center space-x-3">
                <User className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Anzeigename</p>
                  <p className="text-gray-900">{user.displayName || 'Nicht angegeben'}</p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-700">E-Mail-Adresse</p>
                  <p className="text-gray-900">{user.email}</p>
                </div>
              </div>

              {/* Horse Name */}
              <div className="flex items-center space-x-3">
                <Heart className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Name Ihres Pferdes</p>
                  <p className="text-gray-900">{user.horseName || 'Nicht angegeben'}</p>
                </div>
              </div>

              {/* Member Since */}
              <div className="flex items-center space-x-3">
                <User className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Mitglied seit</p>
                  <p className="text-gray-900">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString('de-DE') : 'Unbekannt'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistics Card */}
      <Card>
        <CardHeader>
          <CardTitle>Buchungsstatistiken</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">0</p>
              <p className="text-sm text-gray-600">Buchungen diesen Monat</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">0</p>
              <p className="text-sm text-gray-600">Genehmigte Buchungen</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">0</p>
              <p className="text-sm text-gray-600">Ausstehende Anfragen</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}