"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Moon, Sun } from "lucide-react"
import { Sidebar } from "@/components/Sidebar"

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState('light')

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light')
  }

  return (
    <>
      <Sidebar />
      <div className="flex-1 flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <Button onClick={toggleTheme} variant="ghost" size="icon" className="fixed top-4 right-4">
          {theme === 'light' ? <Moon className="h-[1.2rem] w-[1.2rem]" /> : <Sun className="h-[1.2rem] w-[1.2rem]" />}
        </Button>
        {children}
      </div>
    </>
  )
}