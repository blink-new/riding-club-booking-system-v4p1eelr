import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Lock } from 'lucide-react'

interface AdminPasswordDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function AdminPasswordDialog({ open, onOpenChange, onSuccess }: AdminPasswordDialogProps) {
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (password === 'admin') {
        onSuccess()
        onOpenChange(false)
        setPassword('')
        toast({
          title: 'Zugang gewährt',
          description: 'Willkommen im Admin-Panel'
        })
      } else {
        toast({
          title: 'Falsches Passwort',
          description: 'Das eingegebene Passwort ist nicht korrekt.',
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Fehler',
        description: 'Ein Fehler ist aufgetreten.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Lock className="h-5 w-5 text-primary" />
            <span>Admin-Zugang</span>
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="admin-password">Admin-Passwort</Label>
            <Input
              id="admin-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Passwort eingeben..."
              required
            />
          </div>
          <div className="flex space-x-2">
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? 'Überprüfen...' : 'Zugang gewähren'}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Abbrechen
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}