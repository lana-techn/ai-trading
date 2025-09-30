"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"

interface ChatPortalProps {
  children: React.ReactNode
}

export function ChatPortal({ children }: ChatPortalProps) {
  const [mounted, setMounted] = useState(false)
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null)

  useEffect(() => {
    setMounted(true)
    
    // Create or find portal container
    let container = document.getElementById('chat-portal-root')
    if (!container) {
      container = document.createElement('div')
      container.id = 'chat-portal-root'
      container.className = 'fixed inset-0 z-[9999]'
      document.body.appendChild(container)
    }
    
    setPortalContainer(container)
    
    return () => {
      // Cleanup when component unmounts
      if (container && document.body.contains(container)) {
        document.body.removeChild(container)
      }
    }
  }, [])

  if (!mounted || !portalContainer) {
    return null
  }

  return createPortal(children, portalContainer)
}