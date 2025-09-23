"use client"

import * as React from "react"
import { MoonIcon, SunIcon, ComputerDesktopIcon } from "@heroicons/react/24/outline"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"

interface ThemeToggleProps {
  className?: string
  variant?: "default" | "outline"
}

export function ThemeToggle({ className, variant = "default" }: ThemeToggleProps) {
  const { setTheme, theme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <button
        className={cn(
          "inline-flex h-10 w-10 items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground",
          className
        )}
      >
        <SunIcon className="h-[1.2rem] w-[1.2rem]" />
        <span className="sr-only">Toggle theme</span>
      </button>
    )
  }

  const handleToggle = () => {
    if (theme === "light") {
      setTheme("dark")
    } else if (theme === "dark") {
      setTheme("system")
    } else {
      setTheme("light")
    }
  }

  const getIcon = () => {
    if (theme === "light") return <SunIcon className="h-[1.2rem] w-[1.2rem]" />
    if (theme === "dark") return <MoonIcon className="h-[1.2rem] w-[1.2rem]" />
    return <ComputerDesktopIcon className="h-[1.2rem] w-[1.2rem]" />
  }

  return (
    <button
      onClick={handleToggle}
      className={cn(
        "inline-flex h-10 w-10 items-center justify-center rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors",
        "focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800",
        className
      )}
      title={`Current theme: ${theme}`}
    >
      {getIcon()}
      <span className="sr-only">Toggle theme</span>
    </button>
  )
}

interface ThemeToggleDropdownProps {
  className?: string
}

export function ThemeToggleDropdown({ className }: ThemeToggleDropdownProps) {
  const { setTheme, theme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const themes = [
    { value: "light", label: "Light", icon: SunIcon },
    { value: "dark", label: "Dark", icon: MoonIcon },
    { value: "system", label: "System", icon: ComputerDesktopIcon },
  ]

  return (
    <div className={cn("relative inline-block text-left", className)}>
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
      >
        {(() => {
          const currentTheme = themes.find(t => t.value === theme)
          const Icon = currentTheme?.icon || SunIcon
          return (
            <>
              <Icon className="h-4 w-4" />
              <span className="capitalize">{theme}</span>
            </>
          )
        })()}
      </button>

      {open && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 z-50 mt-2 w-48 origin-top-right rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            {themes.map((themeOption) => {
              const Icon = themeOption.icon
              const isActive = theme === themeOption.value
              
              return (
                <button
                  key={themeOption.value}
                  onClick={() => {
                    setTheme(themeOption.value)
                    setOpen(false)
                  }}
                  className={cn(
                    "group flex w-full items-center gap-2 px-4 py-2 text-sm transition-colors",
                    isActive 
                      ? "bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400" 
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  )}
                >
                  <Icon className={cn(
                    "h-4 w-4",
                    isActive ? "text-indigo-600 dark:text-indigo-400" : "text-gray-500 dark:text-gray-400"
                  )} />
                  {themeOption.label}
                  {isActive && (
                    <div className="ml-auto h-2 w-2 rounded-full bg-indigo-600 dark:bg-indigo-400" />
                  )}
                </button>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}