import { useState } from 'react'

export function useToast(duration = 3000) {
  const [toast, setToast] = useState({ show: false, msg: '' })

  function notify(msg) {
    setToast({ show: true, msg })
    setTimeout(() => setToast({ show: false, msg: '' }), duration)
  }

  return { toast, notify }
}
