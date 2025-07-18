import { useState, useEffect } from 'react'
import { Header } from '@/components/layout/Header'
import { Dashboard } from '@/components/dashboard/Dashboard'
import { CalendarView } from '@/components/calendar/CalendarView'
import { BookingForm } from '@/components/booking/BookingForm'
import { AdminPanel } from '@/components/admin/AdminPanel'
import { AdminPasswordDialog } from '@/components/admin/AdminPasswordDialog'
import { UserProfile } from '@/components/profile/UserProfile'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Toaster } from '@/components/ui/toaster'
import { useToast } from '@/hooks/use-toast'
import { blink } from '@/blink/client'
// Database functions
import { 
  initializeDatabase, 
  createBooking, 
  getBookings, 
  updateBookingStatus, 
  deleteBooking,
  getAdminMessages,
  getUserProfile,
  createUserProfile,
  updateUserProfile
} from '@/lib/database'
import type { Booking } from '@/types/booking'
import type { AdminMessage } from '@/types/message'

// Sample data with updated structure
const sampleBookings: Booking[] = [
  {
    id: 'booking_1',
    userId: 'user_1',
    userName: 'Anna Schmidt',
    arenaType: 'indoor',
    date: '2025-01-20',
    startTime: '10:00',
    endTime: '11:00',
    status: 'pending',
    purpose: 'Dressur-Trainingsstunde',
    templateType: 'template_dressage',
    rakeRequired: false,
    sharedRiding: false,
    currentRiders: 1,
    maxRiders: 1,
    bookingType: 'member',
    createdAt: '2025-01-17T10:00:00Z',
    updatedAt: '2025-01-17T10:00:00Z'
  },
  {
    id: 'booking_2',
    userId: 'user_2',
    userName: 'Max Müller',
    arenaType: 'outdoor',
    date: '2025-01-22',
    startTime: '14:00',
    endTime: '15:00',
    status: 'approved',
    purpose: 'Springtraining',
    templateType: 'template_jumping',
    rakeRequired: false,
    sharedRiding: true,
    currentRiders: 2,
    maxRiders: 4,
    bookingType: 'member',
    createdAt: '2025-01-16T14:00:00Z',
    updatedAt: '2025-01-17T09:00:00Z'
  },
  {
    id: 'booking_3',
    userId: 'admin',
    userName: 'Admin',
    arenaType: 'indoor',
    date: '2025-01-21',
    startTime: '16:00',
    endTime: '17:00',
    status: 'approved',
    purpose: 'Reitstunde für Anfänger',
    rakeRequired: false,
    sharedRiding: false,
    currentRiders: 1,
    maxRiders: 1,
    bookingType: 'lesson',
    createdAt: '2025-01-15T16:00:00Z',
    updatedAt: '2025-01-17T08:00:00Z'
  },
  {
    id: 'booking_4',
    userId: 'admin',
    userName: 'Admin',
    arenaType: 'outdoor',
    date: '2025-01-23',
    startTime: '09:30',
    endTime: '10:45',
    status: 'approved',
    purpose: 'Platzpflege und Wartung',
    rakeRequired: false,
    sharedRiding: false,
    currentRiders: 1,
    maxRiders: 1,
    bookingType: 'maintenance',
    createdAt: '2025-01-18T09:00:00Z',
    updatedAt: '2025-01-18T09:00:00Z'
  }
]

function App() {
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentView, setCurrentView] = useState('dashboard')
  const [showBookingForm, setShowBookingForm] = useState(false)
  const [showAdminPassword, setShowAdminPassword] = useState(false)
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [bookings, setBookings] = useState<Booking[]>(sampleBookings)
  const [users, setUsers] = useState<any[]>([])
  const [adminMessages, setAdminMessages] = useState<AdminMessage[]>([
    {
      id: 'msg_1',
      title: 'Wartungsarbeiten am Wochenende',
      content: 'Am kommenden Samstag (25.01.) finden von 8:00 bis 12:00 Uhr Wartungsarbeiten an der Beregnungsanlage statt. Der Außenplatz ist in dieser Zeit nicht verfügbar.',
      priority: 'high',
      isActive: true,
      createdBy: 'admin',
      createdAt: '2025-01-17T08:00:00Z',
      updatedAt: '2025-01-17T08:00:00Z'
    },
    {
      id: 'msg_2',
      title: 'Neue Öffnungszeiten',
      content: 'Ab Februar gelten neue Öffnungszeiten: Montag bis Freitag 7:00-21:00 Uhr, Samstag und Sonntag 8:00-20:00 Uhr.',
      priority: 'medium',
      isActive: true,
      createdBy: 'admin',
      createdAt: '2025-01-16T14:30:00Z',
      updatedAt: '2025-01-16T14:30:00Z'
    }
  ])
  const [userProfile, setUserProfile] = useState<any>(null)
  const [clubSettings] = useState({
    clubName: 'Reitverein Driedorf',
    subtitle: 'Buchungssystem',
    primaryColor: '#8B4513'
  })
  const { toast } = useToast()

  // Initialize database and authentication
  useEffect(() => {
    const initApp = async () => {
      try {
        console.log('🚀 Initializing Riding Club Booking System...')
        
        // Initialize database tables (will fallback to localStorage if database unavailable)
        const dbAvailable = await initializeDatabase()
        if (dbAvailable) {
          console.log('✅ App initialized with database connection')
        } else {
          console.log('⚠️ App initialized with localStorage fallback')
        }
      } catch (error) {
        console.error('❌ App initialization failed:', error)
        // Force localStorage initialization as fallback
        console.log('🔄 Forcing localStorage initialization...')
        const { initializeDatabase } = await import('@/lib/database')
        await initializeDatabase()
      }
    }
    initApp()
  }, [])

  // Initialize Blink authentication
  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged(async (state) => {
      setUser(state.user)
      setIsLoading(state.isLoading)
      
      if (state.user) {
        // Load user data when authenticated
        await loadUserData(state.user.id)
      }
    })
    return unsubscribe
  }, [])

  // Load user-specific data
  const loadUserData = async (userId: string) => {
    try {
      console.log('👤 Loading user data for userId:', userId)
      
      // Load bookings (will use localStorage if database unavailable)
      const userBookings = await getBookings(userId)
      console.log('📅 Loaded bookings:', userBookings?.length || 0)
      
      if (userBookings && userBookings.length >= 0) {
        setBookings(prev => {
          // Merge with existing bookings, avoiding duplicates
          const existingIds = new Set(prev.map(b => b.id))
          const newBookings = userBookings.filter(b => !existingIds.has(b.id))
          console.log('🔄 Merging', newBookings.length, 'new bookings with', prev.length, 'existing')
          return [...prev, ...newBookings]
        })
      }
      
      // Load user profile (will use localStorage if database unavailable)
      const profile = await getUserProfile(userId)
      if (profile) {
        console.log('👤 Loaded user profile:', profile.displayName || 'No name')
        setUserProfile(profile)
      }
      
      // Load admin messages (will use localStorage if database unavailable)
      const messages = await getAdminMessages()
      if (messages && messages.length > 0) {
        console.log('📢 Loaded', messages.length, 'admin messages')
        setAdminMessages(messages)
      }
      
      console.log('✅ User data loading complete')
    } catch (error) {
      console.log('❌ Error loading user data:', error)
      // Continue with existing data if loading fails
    }
  }

  const handleLogin = () => {
    blink.auth.login()
  }

  const handleLogout = () => {
    blink.auth.logout()
    setCurrentView('dashboard')
    setIsAdminAuthenticated(false)
  }

  const handleAdminClick = () => {
    if (isAdminAuthenticated) {
      setCurrentView('admin')
    } else {
      setShowAdminPassword(true)
    }
  }

  const handleAdminPasswordSuccess = () => {
    setIsAdminAuthenticated(true)
    setCurrentView('admin')
  }

  const handleNewBooking = () => {
    setShowBookingForm(true)
  }

  const handleBookingSubmit = async (bookingData: any) => {
    try {
      const baseBooking = {
        ...bookingData,
        userId: user.id,
        userName: user.displayName || user.email?.split('@')[0] || 'Unbekannter Benutzer',
        status: 'pending' as const
      }

      if (bookingData.isSubscription && bookingData.subscriptionEndDate) {
        // Generate recurring bookings
        const startDate = new Date(bookingData.date)
        const endDate = new Date(bookingData.subscriptionEndDate)
        const newBookings = []
        const parentId = `subscription_${Date.now()}`

        const currentDate = new Date(startDate)
        let weekCount = 0

        while (currentDate <= endDate) {
          const bookingId = weekCount === 0 ? parentId : `${parentId}_week_${weekCount}`
          
          const booking = await createBooking({
            ...baseBooking,
            id: bookingId,
            date: currentDate.toISOString().split('T')[0],
            parentSubscriptionId: weekCount === 0 ? undefined : parentId
          })
          
          newBookings.push(booking)

          // Move to next week
          currentDate.setDate(currentDate.getDate() + 7)
          weekCount++
        }

        // Add to local state for immediate UI update
        setBookings(prev => [...prev, ...newBookings])
        
        // Try to refresh from database
        try {
          await loadUserData(user.id)
        } catch (error) {
          console.log('Database refresh failed, continuing with local data')
        }
        
        toast({
          title: 'Abo-Buchung eingereicht',
          description: `${newBookings.length} wöchentliche Buchungen wurden zur Admin-Genehmigung eingereicht.`,
        })
      } else {
        // Single booking
        const newBooking = await createBooking({
          ...baseBooking,
          id: `booking_${Date.now()}`
        })
        
        // Add to local state for immediate UI update
        setBookings(prev => [...prev, newBooking])
        
        // Try to refresh from database
        try {
          await loadUserData(user.id)
        } catch (error) {
          console.log('Database refresh failed, continuing with local data')
        }
        
        toast({
          title: 'Buchungsanfrage eingereicht',
          description: 'Ihre Buchungsanfrage wurde zur Admin-Genehmigung eingereicht.',
        })
      }
      
      setShowBookingForm(false)
    } catch (error) {
      console.error('Failed to submit booking:', error)
      toast({
        title: 'Fehler',
        description: 'Die Buchung konnte nicht eingereicht werden. Bitte versuchen Sie es erneut.',
        variant: 'destructive'
      })
    }
  }

  const handleBookingClick = (booking: Booking) => {
    setSelectedBooking(booking)
  }

  const handleApproveBooking = async (bookingId: string, sharedRiding: boolean = false) => {
    try {
      const booking = bookings.find(b => b.id === bookingId)
      if (!booking) return

      // If it's a subscription, approve all related bookings
      if (booking.isSubscription) {
        const relatedBookings = bookings.filter(b => b.id === bookingId || b.parentSubscriptionId === bookingId)
        
        // Update all related bookings
        for (const relatedBooking of relatedBookings) {
          await updateBookingStatus(relatedBooking.id, 'approved', sharedRiding)
        }
        
        toast({
          title: 'Abo-Buchung genehmigt',
          description: `${relatedBookings.length} wöchentliche Termine wurden genehmigt.`,
        })
      } else {
        // Single booking approval
        await updateBookingStatus(bookingId, 'approved', sharedRiding)
        
        toast({
          title: 'Buchung genehmigt',
          description: 'Die Buchungsanfrage wurde genehmigt.',
        })
      }
      
      // Update local state immediately
      setBookings(prev => prev.map(b => 
        b.id === bookingId ? { 
          ...b, 
          status: 'approved',
          sharedRiding: sharedRiding,
          maxRiders: sharedRiding ? 6 : 1
        } : b
      ))
      
      // Try to refresh from database
      try {
        await loadUserData(user.id)
      } catch (error) {
        console.log('Database refresh failed, continuing with local data')
      }
    } catch (error) {
      console.error('Failed to approve booking:', error)
      toast({
        title: 'Fehler',
        description: 'Die Buchung konnte nicht genehmigt werden.',
        variant: 'destructive'
      })
    }
  }

  const handleRejectBooking = async (bookingId: string) => {
    try {
      const booking = bookings.find(b => b.id === bookingId)
      if (!booking) return

      // If it's a subscription, reject all related bookings
      if (booking.isSubscription) {
        const relatedBookings = bookings.filter(b => b.id === bookingId || b.parentSubscriptionId === bookingId)
        
        // Update all related bookings
        for (const relatedBooking of relatedBookings) {
          await updateBookingStatus(relatedBooking.id, 'rejected')
        }
        
        toast({
          title: 'Abo-Buchung abgelehnt',
          description: `${relatedBookings.length} wöchentliche Termine wurden abgelehnt.`,
          variant: 'destructive'
        })
      } else {
        // Single booking rejection
        await updateBookingStatus(bookingId, 'rejected')
        
        toast({
          title: 'Buchung abgelehnt',
          description: 'Die Buchungsanfrage wurde abgelehnt.',
          variant: 'destructive'
        })
      }
      
      // Try to refresh bookings from database
      try {
        await loadUserData(user.id)
      } catch (error) {
        console.log('Database refresh failed, continuing with local data')
      }
    } catch (error) {
      console.error('Failed to reject booking:', error)
      toast({
        title: 'Fehler',
        description: 'Die Buchung konnte nicht abgelehnt werden.',
        variant: 'destructive'
      })
    }
  }

  const handleDeleteBooking = async (bookingId: string) => {
    try {
      const booking = bookings.find(b => b.id === bookingId)
      if (!booking) return

      // Only delete entire subscription if it's the parent booking and user explicitly wants to delete the whole subscription
      if (booking.isSubscription && !booking.parentSubscriptionId) {
        const subscriptionId = booking.id
        const relatedBookings = bookings.filter(b => b.id === subscriptionId || b.parentSubscriptionId === subscriptionId)
        
        // Delete all related bookings
        for (const relatedBooking of relatedBookings) {
          await deleteBooking(relatedBooking.id)
        }
        
        toast({
          title: 'Abo-Buchung gelöscht',
          description: 'Das gesamte Abo wurde erfolgreich gelöscht.',
        })
      } else {
        // Single booking deletion (including individual appointments from subscription)
        await deleteBooking(bookingId)
        
        toast({
          title: 'Buchung gelöscht',
          description: 'Die Buchung wurde erfolgreich gelöscht.',
        })
      }
      
      // Try to refresh bookings from database
      try {
        await loadUserData(user.id)
      } catch (error) {
        console.log('Database refresh failed, continuing with local data')
      }
    } catch (error) {
      console.error('Failed to delete booking:', error)
      toast({
        title: 'Fehler',
        description: 'Die Buchung konnte nicht gelöscht werden.',
        variant: 'destructive'
      })
    }
  }

  const handleDeleteSingleAppointment = async (bookingId: string) => {
    try {
      await deleteBooking(bookingId)
      
      // Try to refresh bookings from database
      try {
        await loadUserData(user.id)
      } catch (error) {
        console.log('Database refresh failed, continuing with local data')
      }
      
      toast({
        title: 'Termin gelöscht',
        description: 'Der einzelne Termin wurde erfolgreich gelöscht.',
      })
    } catch (error) {
      console.error('Failed to delete appointment:', error)
      toast({
        title: 'Fehler',
        description: 'Der Termin konnte nicht gelöscht werden.',
        variant: 'destructive'
      })
    }
  }

  const handleCreateAdminBooking = (bookingData: any) => {
    const baseBooking = {
      ...bookingData,
      userId: 'admin',
      userName: 'Admin',
      status: 'approved' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    if (bookingData.isSubscription && bookingData.subscriptionEndDate) {
      // Generate recurring admin bookings
      const startDate = new Date(bookingData.date)
      const endDate = new Date(bookingData.subscriptionEndDate)
      const newBookings = []
      const parentId = `admin_subscription_${Date.now()}`

      const currentDate = new Date(startDate)
      let weekCount = 0

      while (currentDate <= endDate) {
        const bookingId = weekCount === 0 ? parentId : `${parentId}_week_${weekCount}`
        
        newBookings.push({
          ...baseBooking,
          id: bookingId,
          date: currentDate.toISOString().split('T')[0],
          parentSubscriptionId: weekCount === 0 ? undefined : parentId
        })

        // Move to next week
        currentDate.setDate(currentDate.getDate() + 7)
        weekCount++
      }

      setBookings(prev => [...prev, ...newBookings])
      toast({
        title: 'Admin-Abo erstellt',
        description: `${newBookings.length} wöchentliche Admin-Buchungen wurden erstellt.`,
      })
    } else {
      // Single admin booking
      const newBooking = {
        ...baseBooking,
        id: `admin_booking_${Date.now()}`
      }
      
      setBookings(prev => [...prev, newBooking])
      toast({
        title: 'Admin-Buchung erstellt',
        description: 'Die Buchung wurde erfolgreich erstellt.',
      })
    }
  }

  const handleUpdateProfile = async (profileData: any) => {
    try {
      // Update user profile in database
      const updatedProfile = await updateUserProfile(user.id, profileData)
      setUserProfile(updatedProfile)
      
      // Update user state with new data
      setUser({ ...user, ...profileData })
      
      toast({
        title: 'Profil aktualisiert',
        description: 'Ihre Profildaten wurden erfolgreich gespeichert.',
      })
    } catch (error) {
      console.error('Failed to update profile:', error)
      toast({
        title: 'Fehler',
        description: 'Das Profil konnte nicht aktualisiert werden.',
        variant: 'destructive'
      })
    }
  }

  const handleApproveUser = (userId: string) => {
    setUsers(prev => 
      prev.map(user => 
        user.id === userId 
          ? { 
              ...user, 
              status: 'approved' as const, 
              approvedBy: 'admin',
              approvedAt: new Date().toISOString(),
              updatedAt: new Date().toISOString() 
            }
          : user
      )
    )
    toast({
      title: 'Benutzer genehmigt',
      description: 'Der Benutzer wurde erfolgreich genehmigt und kann nun das System nutzen.',
    })
  }

  const handleRejectUser = (userId: string) => {
    setUsers(prev => 
      prev.map(user => 
        user.id === userId 
          ? { ...user, status: 'rejected' as const, updatedAt: new Date().toISOString() }
          : user
      )
    )
    toast({
      title: 'Benutzer abgelehnt',
      description: 'Der Benutzer wurde abgelehnt.',
      variant: 'destructive'
    })
  }

  // Admin message handlers
  const handleCreateMessage = (messageData: Omit<AdminMessage, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newMessage: AdminMessage = {
      ...messageData,
      id: `msg_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    setAdminMessages(prev => [newMessage, ...prev])
    toast({
      title: 'Nachricht erstellt',
      description: 'Die Nachricht wurde erfolgreich erstellt und ist für alle Benutzer sichtbar.',
    })
  }

  const handleUpdateMessage = (messageId: string, updates: Partial<AdminMessage>) => {
    setAdminMessages(prev => 
      prev.map(message => 
        message.id === messageId 
          ? { ...message, ...updates, updatedAt: new Date().toISOString() }
          : message
      )
    )
    toast({
      title: 'Nachricht aktualisiert',
      description: 'Die Nachricht wurde erfolgreich aktualisiert.',
    })
  }

  const handleDeleteMessage = (messageId: string) => {
    setAdminMessages(prev => prev.filter(message => message.id !== messageId))
    toast({
      title: 'Nachricht gelöscht',
      description: 'Die Nachricht wurde erfolgreich gelöscht.',
    })
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Lade Reitclub Buchungssystem...</p>
        </div>
      </div>
    )
  }

  // Not authenticated - show login prompt
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">{clubSettings.clubName}</h1>
            <p className="text-gray-600">Melden Sie sich an, um Ihre Buchungen zu verwalten</p>
          </div>
          
          <div className="space-y-4">
            <button
              onClick={handleLogin}
              className="w-full text-white font-medium py-3 px-4 rounded-lg transition-colors"
              style={{ 
                backgroundColor: clubSettings.primaryColor,
                ':hover': { backgroundColor: `${clubSettings.primaryColor}90` }
              }}
            >
              Anmelden
            </button>
            <p className="text-sm text-gray-500">
              Sichere Anmeldung über Blink
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header 
        user={user} 
        onLogout={handleLogout}
        currentView={currentView}
        onViewChange={setCurrentView}
        onAdminClick={handleAdminClick}
        clubSettings={clubSettings}
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
        {currentView === 'dashboard' && (
          <Dashboard
            bookings={bookings.filter(b => b.userId === user.id && !b.isDeleted)}
            onNewBooking={handleNewBooking}
            onBookingClick={handleBookingClick}
            onDeleteBooking={handleDeleteBooking}
            onDeleteSingleAppointment={handleDeleteSingleAppointment}
            adminMessages={adminMessages}
          />
        )}
        
        {currentView === 'calendar' && (
          <CalendarView
            bookings={bookings.filter(b => !b.isDeleted)}
            onBookingClick={handleBookingClick}
          />
        )}
        
        {currentView === 'admin' && isAdminAuthenticated && (
          <AdminPanel
            bookings={bookings.filter(b => !b.isDeleted)}
            onApproveBooking={handleApproveBooking}
            onRejectBooking={handleRejectBooking}
            onCreateAdminBooking={handleCreateAdminBooking}
            onApproveUser={handleApproveUser}
            onRejectUser={handleRejectUser}
            adminMessages={adminMessages}
            onCreateMessage={handleCreateMessage}
            onUpdateMessage={handleUpdateMessage}
            onDeleteMessage={handleDeleteMessage}
          />
        )}
        
        {currentView === 'profile' && (
          <UserProfile
            user={user}
            onUpdateProfile={handleUpdateProfile}
          />
        )}
      </main>

      {/* Admin Password Dialog */}
      <AdminPasswordDialog
        open={showAdminPassword}
        onOpenChange={setShowAdminPassword}
        onSuccess={handleAdminPasswordSuccess}
      />

      {/* Booking Form Dialog */}
      <Dialog open={showBookingForm} onOpenChange={setShowBookingForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="sr-only">Buchung anfragen</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[80vh] pr-4">
            <BookingForm
              onSubmit={handleBookingSubmit}
              onCancel={() => setShowBookingForm(false)}
              userName={user.displayName || user.email?.split('@')[0] || 'Unbekannter Benutzer'}
            />
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Booking Details Dialog */}
      <Dialog open={!!selectedBooking} onOpenChange={() => setSelectedBooking(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-hidden">
          {selectedBooking && (
            <>
              <DialogHeader>
                <DialogTitle>Buchungsdetails</DialogTitle>
              </DialogHeader>
              <ScrollArea className="max-h-[70vh] pr-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <p><strong>Datum:</strong> {selectedBooking.date}</p>
                    <p><strong>Zeit:</strong> {selectedBooking.startTime} - {selectedBooking.endTime}</p>
                    <p><strong>Typ:</strong> {selectedBooking.arenaType === 'indoor' ? 'Halle' : 'Platz'}</p>
                    <p><strong>Gebucht von:</strong> {selectedBooking.userName}</p>
                    <p><strong>Status:</strong> {
                      selectedBooking.status === 'pending' ? 'Ausstehend' : 
                      selectedBooking.status === 'approved' ? 'Genehmigt' : 'Abgelehnt'
                    }</p>
                    {selectedBooking.purpose && (
                      <p><strong>Zweck:</strong> {selectedBooking.purpose}</p>
                    )}
                    {selectedBooking.isSubscription && (
                      <p><strong>Abo-Buchung:</strong> Ja {selectedBooking.subscriptionEndDate && `(bis ${selectedBooking.subscriptionEndDate})`}</p>
                    )}
                    <p><strong>Andere Reiter erlaubt:</strong> {selectedBooking.sharedRiding ? 'Ja' : 'Nein'}</p>
                    <p><strong>Harke erforderlich:</strong> {selectedBooking.rakeRequired ? 'Ja' : 'Nein'}</p>
                  </div>
                </div>
              </ScrollArea>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Toaster />
    </div>
  )
}

export default App