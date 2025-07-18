import { Calendar, LogOut, Settings, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

interface HeaderProps {
  user: any
  onLogout: () => void
  currentView: string
  onViewChange: (view: string) => void
  onAdminClick: () => void
  clubSettings?: {
    clubName: string
    subtitle: string
    primaryColor: string
  }
}

export function Header({ 
  user, 
  onLogout, 
  currentView, 
  onViewChange, 
  onAdminClick, 
  clubSettings = {
    clubName: 'Reitverein Driedorf',
    subtitle: 'Buchungssystem',
    primaryColor: '#8B4513'
  }
}: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Title */}
          <div className="flex items-center space-x-3">
            <div 
              className="p-2 rounded-lg"
              style={{ backgroundColor: clubSettings.primaryColor }}
            >
              <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.5 6c-.61 0-1.17.22-1.61.59L17.5 8l-1.39-1.41C15.67 6.22 15.11 6 14.5 6c-.61 0-1.17.22-1.61.59L11.5 8l-1.39-1.41C9.67 6.22 9.11 6 8.5 6c-.61 0-1.17.22-1.61.59L5.5 8l-1.39-1.41C3.67 6.22 3.11 6 2.5 6c-.83 0-1.5.67-1.5 1.5v9c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V9.41l.89.89c.44.44 1 .66 1.61.66s1.17-.22 1.61-.66L8.5 8.91l1.39 1.39c.44.44 1 .66 1.61.66s1.17-.22 1.61-.66L14.5 8.91l1.39 1.39c.44.44 1 .66 1.61.66s1.17-.22 1.61-.66l.89-.89V16.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-9c0-.83-.67-1.5-1.5-1.5z"/>
                <circle cx="6" cy="4" r="2"/>
                <circle cx="12" cy="4" r="2"/>
                <circle cx="18" cy="4" r="2"/>
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">{clubSettings.clubName}</h1>
              <p className="text-sm text-gray-500">{clubSettings.subtitle}</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-1">
            <Button
              variant={currentView === 'dashboard' ? 'default' : 'ghost'}
              onClick={() => onViewChange('dashboard')}
              className="flex items-center space-x-2"
            >
              <Calendar className="h-4 w-4" />
              <span>Dashboard</span>
            </Button>
            <Button
              variant={currentView === 'calendar' ? 'default' : 'ghost'}
              onClick={() => onViewChange('calendar')}
              className="flex items-center space-x-2"
            >
              <Calendar className="h-4 w-4" />
              <span>Kalender</span>
            </Button>
            <Button
              variant={currentView === 'admin' ? 'default' : 'ghost'}
              onClick={onAdminClick}
              className="flex items-center space-x-2"
            >
              <Settings className="h-4 w-4" />
              <span>Admin</span>
            </Button>
          </nav>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback 
                    className="text-white"
                    style={{ backgroundColor: clubSettings.primaryColor }}
                  >
                    {user?.displayName?.[0] || user?.email?.[0] || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1 leading-none">
                  <p className="font-medium">{user?.displayName || 'User'}</p>
                  <p className="w-[200px] truncate text-sm text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onViewChange('profile')}>
                <User className="mr-2 h-4 w-4" />
                <span>Profil</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Abmelden</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}