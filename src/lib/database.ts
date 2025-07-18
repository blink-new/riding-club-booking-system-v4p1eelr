import { blink } from '@/blink/client'

// Local storage keys for fallback data
const STORAGE_KEYS = {
  bookings: 'riding_club_bookings',
  userProfiles: 'riding_club_user_profiles',
  adminMessages: 'riding_club_admin_messages'
}

// Database initialization and helper functions
export const initializeDatabase = async () => {
  try {
    // Test database connection by trying to list bookings
    await blink.db.bookings.list({ limit: 1 })
    console.log('Database connection successful')
    return true
  } catch (error) {
    console.log('Database not available, using local storage fallback:', error.message)
    initializeLocalStorage()
    return false
  }
}

const initializeLocalStorage = () => {
  console.log('Initializing localStorage fallback...')
  
  // Initialize local storage with sample data if empty
  if (!localStorage.getItem(STORAGE_KEYS.adminMessages)) {
    const sampleMessages = [
      {
        id: 'msg_welcome',
        title: 'Willkommen im Reitclub Buchungssystem',
        content: 'Herzlich willkommen! Sie können hier Ihre Reitstunden und Hallenzeiten buchen. Alle Buchungen müssen von der Verwaltung genehmigt werden.',
        priority: 'medium',
        isActive: 1,
        createdBy: 'system',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'msg_maintenance',
        title: 'System läuft im Offline-Modus',
        content: 'Das System verwendet derzeit lokale Speicherung. Ihre Daten werden lokal gespeichert und sind nur in diesem Browser verfügbar.',
        priority: 'low',
        isActive: 1,
        createdBy: 'system',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]
    localStorage.setItem(STORAGE_KEYS.adminMessages, JSON.stringify(sampleMessages))
    console.log('Initialized admin messages in localStorage')
  }

  if (!localStorage.getItem(STORAGE_KEYS.bookings)) {
    localStorage.setItem(STORAGE_KEYS.bookings, JSON.stringify([]))
    console.log('Initialized bookings in localStorage')
  }

  if (!localStorage.getItem(STORAGE_KEYS.userProfiles)) {
    localStorage.setItem(STORAGE_KEYS.userProfiles, JSON.stringify([]))
    console.log('Initialized user profiles in localStorage')
  }
  
  console.log('localStorage initialization complete')
}

// Helper functions for local storage
const getFromLocalStorage = (key: string) => {
  try {
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : []
  } catch (error) {
    console.error('Error reading from localStorage:', error)
    return []
  }
}

const saveToLocalStorage = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (error) {
    console.error('Error saving to localStorage:', error)
  }
}

// Booking operations
export const createBooking = async (bookingData: any) => {
  try {
    const booking = {
      id: bookingData.id || `booking_${Date.now()}`,
      userId: bookingData.userId,
      userName: bookingData.userName,
      arenaType: bookingData.arenaType,
      date: bookingData.date,
      startTime: bookingData.startTime,
      endTime: bookingData.endTime,
      status: bookingData.status || 'pending',
      purpose: bookingData.purpose || '',
      templateType: bookingData.templateType || null,
      rakeRequired: bookingData.rakeRequired ? 1 : 0,
      sharedRiding: bookingData.sharedRiding ? 1 : 0,
      currentRiders: bookingData.currentRiders || 1,
      maxRiders: bookingData.maxRiders || 1,
      bookingType: bookingData.bookingType || 'member',
      isSubscription: bookingData.isSubscription ? 1 : 0,
      subscriptionEndDate: bookingData.subscriptionEndDate || null,
      parentSubscriptionId: bookingData.parentSubscriptionId || null,
      isDeleted: 0,
      deletedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    try {
      const result = await blink.db.bookings.create(booking)
      return result
    } catch (dbError) {
      console.log('Database not available, using localStorage')
      const bookings = getFromLocalStorage(STORAGE_KEYS.bookings)
      bookings.push(booking)
      saveToLocalStorage(STORAGE_KEYS.bookings, bookings)
      return booking
    }
  } catch (error) {
    console.error('Failed to create booking:', error)
    throw error
  }
}

export const getBookings = async (userId?: string) => {
  try {
    try {
      const whereClause: any = { isDeleted: 0 }
      
      if (userId) {
        whereClause.userId = userId
      }
      
      const bookings = await blink.db.bookings.list({
        where: whereClause,
        orderBy: { createdAt: 'desc' }
      })
      
      return bookings || []
    } catch (dbError) {
      console.log('Database not available, using localStorage')
      const bookings = getFromLocalStorage(STORAGE_KEYS.bookings)
      let filteredBookings = bookings.filter((b: any) => Number(b.isDeleted) === 0)
      
      if (userId) {
        filteredBookings = filteredBookings.filter((b: any) => b.userId === userId)
      }
      
      return filteredBookings.sort((a: any, b: any) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
    }
  } catch (error) {
    console.error('Failed to get bookings:', error)
    return []
  }
}

export const updateBookingStatus = async (bookingId: string, status: 'approved' | 'rejected', sharedRiding?: boolean) => {
  try {
    const updateData: any = {
      status: status,
      updatedAt: new Date().toISOString()
    }
    
    // If sharedRiding is provided, update it
    if (sharedRiding !== undefined) {
      updateData.sharedRiding = sharedRiding ? 1 : 0
      updateData.maxRiders = sharedRiding ? 6 : 1
    }
    
    try {
      await blink.db.bookings.update(bookingId, updateData)
      return true
    } catch (dbError) {
      console.log('Database not available, updating localStorage')
      const bookings = getFromLocalStorage(STORAGE_KEYS.bookings)
      const bookingIndex = bookings.findIndex((b: any) => b.id === bookingId)
      
      if (bookingIndex !== -1) {
        Object.assign(bookings[bookingIndex], updateData)
        saveToLocalStorage(STORAGE_KEYS.bookings, bookings)
      }
      
      return true
    }
  } catch (error) {
    console.error('Failed to update booking status:', error)
    return false
  }
}

export const deleteBooking = async (bookingId: string) => {
  try {
    try {
      await blink.db.bookings.update(bookingId, {
        isDeleted: 1,
        deletedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
      return true
    } catch (dbError) {
      console.log('Database not available, updating localStorage')
      const bookings = getFromLocalStorage(STORAGE_KEYS.bookings)
      const bookingIndex = bookings.findIndex((b: any) => b.id === bookingId)
      
      if (bookingIndex !== -1) {
        bookings[bookingIndex].isDeleted = 1
        bookings[bookingIndex].deletedAt = new Date().toISOString()
        bookings[bookingIndex].updatedAt = new Date().toISOString()
        saveToLocalStorage(STORAGE_KEYS.bookings, bookings)
      }
      
      return true
    }
  } catch (error) {
    console.error('Failed to delete booking:', error)
    return false
  }
}

// User profile operations
export const createUserProfile = async (profileData: any) => {
  try {
    const profile = {
      id: `profile_${Date.now()}`,
      userId: profileData.userId,
      displayName: profileData.displayName || '',
      email: profileData.email || '',
      phone: profileData.phone || '',
      emergencyContact: profileData.emergencyContact || '',
      emergencyPhone: profileData.emergencyPhone || '',
      horseName: profileData.horseName || '',
      membershipType: profileData.membershipType || 'member',
      status: 'pending',
      approvedBy: null,
      approvedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    try {
      const result = await blink.db.userProfiles.create(profile)
      return result
    } catch (dbError) {
      console.log('Database not available, using localStorage')
      const profiles = getFromLocalStorage(STORAGE_KEYS.userProfiles)
      profiles.push(profile)
      saveToLocalStorage(STORAGE_KEYS.userProfiles, profiles)
      return profile
    }
  } catch (error) {
    console.error('Failed to create user profile:', error)
    throw error
  }
}

export const getUserProfile = async (userId: string) => {
  try {
    try {
      const profiles = await blink.db.userProfiles.list({
        where: { userId: userId },
        limit: 1
      })
      
      return profiles[0] || null
    } catch (dbError) {
      console.log('Database not available, using localStorage')
      const profiles = getFromLocalStorage(STORAGE_KEYS.userProfiles)
      return profiles.find((p: any) => p.userId === userId) || null
    }
  } catch (error) {
    console.error('Failed to get user profile:', error)
    return null
  }
}

export const updateUserProfile = async (userId: string, profileData: any) => {
  try {
    const updateData = {
      ...profileData,
      updatedAt: new Date().toISOString()
    }

    try {
      const profiles = await blink.db.userProfiles.list({
        where: { userId: userId },
        limit: 1
      })
      
      if (profiles[0]) {
        await blink.db.userProfiles.update(profiles[0].id, updateData)
        return { ...profiles[0], ...updateData }
      } else {
        // Create new profile if doesn't exist
        return await createUserProfile({ userId, ...profileData })
      }
    } catch (dbError) {
      console.log('Database not available, using localStorage')
      const profiles = getFromLocalStorage(STORAGE_KEYS.userProfiles)
      const profileIndex = profiles.findIndex((p: any) => p.userId === userId)
      
      if (profileIndex !== -1) {
        profiles[profileIndex] = { ...profiles[profileIndex], ...updateData }
        saveToLocalStorage(STORAGE_KEYS.userProfiles, profiles)
        return profiles[profileIndex]
      } else {
        // Create new profile
        const newProfile = {
          id: `profile_${Date.now()}`,
          userId,
          ...profileData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        profiles.push(newProfile)
        saveToLocalStorage(STORAGE_KEYS.userProfiles, profiles)
        return newProfile
      }
    }
  } catch (error) {
    console.error('Failed to update user profile:', error)
    throw error
  }
}

// Admin message operations
export const getAdminMessages = async () => {
  try {
    try {
      const messages = await blink.db.adminMessages.list({
        where: { isActive: 1 },
        orderBy: { createdAt: 'desc' }
      })
      
      return messages
    } catch (dbError) {
      console.log('Database not available, using localStorage')
      const messages = getFromLocalStorage(STORAGE_KEYS.adminMessages)
      return messages.filter((m: any) => Number(m.isActive) === 1)
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    }
  } catch (error) {
    console.error('Failed to get admin messages:', error)
    return []
  }
}

export const createAdminMessage = async (messageData: any) => {
  try {
    const message = {
      id: `message_${Date.now()}`,
      title: messageData.title,
      content: messageData.content,
      priority: messageData.priority || 'low',
      isActive: 1,
      createdBy: messageData.createdBy,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    try {
      const result = await blink.db.adminMessages.create(message)
      return result
    } catch (dbError) {
      console.log('Database not available, using localStorage')
      const messages = getFromLocalStorage(STORAGE_KEYS.adminMessages)
      messages.push(message)
      saveToLocalStorage(STORAGE_KEYS.adminMessages, messages)
      return message
    }
  } catch (error) {
    console.error('Failed to create admin message:', error)
    throw error
  }
}