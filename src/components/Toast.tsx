"use client"

import { useEffect, useState } from "react"

interface ToastProps {
  open: boolean
  message: string
  type?: "success" | "error" | "info"
  onClose: () => void
  duration?: number
}

export default function Toast({ open, message, type = "success", onClose, duration = 3000 }: ToastProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (open) {
      setVisible(true)
      const timer = setTimeout(() => {
        setVisible(false)
        setTimeout(onClose, 300)
      }, duration)
      return () => clearTimeout(timer)
    }
    setVisible(false)
  }, [open, duration, onClose])

  if (!open && !visible) return null

  const iconMap = {
    success: "check_circle",
    error: "error",
    info: "info",
  }

  const bgMap = {
    success: "bg-green-700",
    error: "bg-error",
    info: "bg-primary",
  }

  return (
    <div
      className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 ${bgMap[type]} text-white px-5 py-3.5 rounded-xl shadow-2xl transition-all duration-300 ${visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
    >
      <span className="material-symbols-outlined text-[22px]">{iconMap[type]}</span>
      <span className="font-[600] text-[13px] leading-[1.2] tracking-[0.05em]">{message}</span>
      <button onClick={() => { setVisible(false); setTimeout(onClose, 300) }} className="ml-2 p-1 hover:bg-white/20 rounded-full transition-colors">
        <span className="material-symbols-outlined text-[18px]">close</span>
      </button>
    </div>
  )
}
