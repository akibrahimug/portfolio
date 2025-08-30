/**
 * Hook for managing dialog states
 */
import { useState, useCallback } from 'react'

interface DialogState<T = any> {
  isOpen: boolean
  data?: T
}

export function useDialogState<T = any>(initialState: DialogState<T> = { isOpen: false }) {
  const [state, setState] = useState<DialogState<T>>(initialState)

  const open = useCallback((data?: T) => {
    setState({ isOpen: true, data })
  }, [])

  const close = useCallback(() => {
    setState({ isOpen: false, data: undefined })
  }, [])

  const toggle = useCallback((data?: T) => {
    setState((prev) => ({
      isOpen: !prev.isOpen,
      data: prev.isOpen ? undefined : data,
    }))
  }, [])

  return {
    isOpen: state.isOpen,
    data: state.data,
    open,
    close,
    toggle,
  }
}

// Multiple dialogs management
export function useMultipleDialogs<T extends string>(dialogNames: T[]) {
  const [openDialogs, setOpenDialogs] = useState<Set<T>>(new Set())
  const [dialogData, setDialogData] = useState<Partial<Record<T, any>>>({})

  const isOpen = useCallback(
    (dialogName: T) => {
      return openDialogs.has(dialogName)
    },
    [openDialogs],
  )

  const open = useCallback((dialogName: T, data?: any) => {
    setOpenDialogs((prev) => new Set(prev).add(dialogName))
    if (data !== undefined) {
      setDialogData((prev) => ({ ...prev, [dialogName]: data }))
    }
  }, [])

  const close = useCallback((dialogName: T) => {
    setOpenDialogs((prev) => {
      const next = new Set(prev)
      next.delete(dialogName)
      return next
    })
    setDialogData((prev) => {
      const next = { ...prev }
      delete next[dialogName]
      return next
    })
  }, [])

  const toggle = useCallback(
    (dialogName: T, data?: any) => {
      if (isOpen(dialogName)) {
        close(dialogName)
      } else {
        open(dialogName, data)
      }
    },
    [isOpen, open, close],
  )

  const getData = useCallback(
    (dialogName: T) => {
      return dialogData[dialogName]
    },
    [dialogData],
  )

  return {
    isOpen,
    open,
    close,
    toggle,
    getData,
    openDialogs: Array.from(openDialogs),
  }
}
