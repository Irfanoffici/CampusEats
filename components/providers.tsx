'use client'

import { SessionProvider } from 'next-auth/react'
import { createContext, useContext, useState, useEffect } from 'react'

const MessengerModeContext = createContext({
  isMessengerMode: false,
  toggleMessengerMode: () => {},
})

export function useMessengerMode() {
  return useContext(MessengerModeContext)
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [isMessengerMode, setIsMessengerMode] = useState(false)

  useEffect(() => {
    // Listen for messenger mode toggle events
    const handleMessengerModeToggle = (event: CustomEvent) => {
      setIsMessengerMode(event.detail)
    }

    window.addEventListener('messengerModeToggle', handleMessengerModeToggle as EventListener)
    
    // Check initial messenger mode from body class
    setIsMessengerMode(document.body.classList.contains('messenger-mode'))

    return () => {
      window.removeEventListener('messengerModeToggle', handleMessengerModeToggle as EventListener)
    }
  }, [])

  const toggleMessengerMode = () => {
    const newMode = !isMessengerMode
    setIsMessengerMode(newMode)
    
    // Emit a custom event to notify the app about the mode change
    window.dispatchEvent(new CustomEvent('messengerModeToggle', { detail: newMode }))
    
    // Update the body class for styling
    if (newMode) {
      document.body.classList.add('messenger-mode')
    } else {
      document.body.classList.remove('messenger-mode')
    }
  }

  return (
    <SessionProvider>
      <MessengerModeContext.Provider value={{ isMessengerMode, toggleMessengerMode }}>
        {children}
      </MessengerModeContext.Provider>
    </SessionProvider>
  )
}
