import { useState, useCallback } from 'react'

export interface ModalState<T = Record<string, never>> {
  isOpen: boolean
  data: T
}

export function useModal<T = Record<string, never>>(initialData: T) {
  const [state, setState] = useState<ModalState<T>>({
    isOpen: false,
    data: initialData,
  })

  const open = useCallback((data: T) => {
    setState({ isOpen: true, data })
  }, [])

  const close = useCallback(() => {
    setState({ isOpen: false, data: initialData })
  }, [initialData])

  return { state, open, close }
}
