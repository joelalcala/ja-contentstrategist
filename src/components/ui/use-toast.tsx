import { useState, useEffect } from 'react'

interface ToastProps {
  message: string
  type: 'success' | 'error' | 'info'
  duration?: number
}

export const useToast = () => {
  const [toast, setToast] = useState<ToastProps | null>(null)

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null)
      }, toast.duration || 3000)

      return () => clearTimeout(timer)
    }
  }, [toast])

  const showToast = (props: ToastProps) => {
    setToast(props)
  }

  return { toast, showToast }
}

export const Toast: React.FC<{ toast: ToastProps | null }> = ({ toast }) => {
  if (!toast) return null

  const bgColor = 
    toast.type === 'success' ? 'bg-green-500' :
    toast.type === 'error' ? 'bg-red-500' :
    'bg-blue-500'

  return (
    <div className={`fixed bottom-4 right-4 p-4 rounded-md text-white ${bgColor}`}>
      {toast.message}
    </div>
  )
}