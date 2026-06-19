"use client"

import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface HeaderProps {
  sidebarOpen: boolean
  onToggle: () => void
}

export function Header({ sidebarOpen, onToggle }: HeaderProps) {
  return (
    <div className="lg:hidden fixed top-0 left-0 right-0 z-40 h-14 border-b border-white/10 bg-black flex items-center px-4">
      <Button variant="ghost" size="icon" onClick={onToggle}>
        {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </Button>
      <div className="flex items-center gap-2 ml-3">
        <div className="w-7 h-7 rounded-md bg-white flex items-center justify-center">
          <span className="text-black text-xs font-bold">TC</span>
        </div>
        <span className="text-sm font-semibold">Threads Intel</span>
      </div>
    </div>
  )
}
