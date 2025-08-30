/**
 * Generic CRUD operations hook for dashboard pages
 */
import { useState, useCallback } from 'react'
import { useClerkAuth } from './useClerkAuth'
import { httpClient } from '@/lib/http-client'
import { extractFiles } from '@/lib/file-utils'

interface UseCrudOperationsOptions<T> {
  entityType: string
  createMutation?: (data: any) => Promise<any>
  updateMutation?: (params: { id: string; updates: any }) => Promise<any>
  deleteMutation?: (id: string) => Promise<any>
  onSuccess?: () => void | Promise<void>
  transformBeforeCreate?: (data: any) => Promise<any>
  transformBeforeUpdate?: (id: string, data: any) => Promise<any>
}

export function useCrudOperations<T>({
  entityType,
  createMutation,
  updateMutation,
  deleteMutation,
  onSuccess,
  transformBeforeCreate,
  transformBeforeUpdate,
}: UseCrudOperationsOptions<T>) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { getAuthToken } = useClerkAuth()

  const handleAdd = useCallback(
    async (formData: any) => {
      if (!createMutation) return

      setIsSubmitting(true)
      setError(null)

      try {
        let dataToSubmit = formData

        // Apply custom transformation if provided
        if (transformBeforeCreate) {
          dataToSubmit = await transformBeforeCreate(formData)
        }

        const result = await createMutation(dataToSubmit)
        if (result && onSuccess) {
          await onSuccess()
        }
        return result
      } catch (err) {
        const message = err instanceof Error ? err.message : `Error creating ${entityType}`
        setError(message)
        console.error(`Error creating ${entityType}:`, err)
        throw err
      } finally {
        setIsSubmitting(false)
      }
    },
    [createMutation, entityType, onSuccess, transformBeforeCreate],
  )

  const handleEdit = useCallback(
    async (id: string, formData: any) => {
      if (!updateMutation) return

      setIsSubmitting(true)
      setError(null)

      try {
        let updates = formData

        // Apply custom transformation if provided
        if (transformBeforeUpdate) {
          updates = await transformBeforeUpdate(id, formData)
        }

        const result = await updateMutation({ id, updates })
        if (result && onSuccess) {
          await onSuccess()
        }
        return result
      } catch (err) {
        const message = err instanceof Error ? err.message : `Error updating ${entityType}`
        setError(message)
        console.error(`Error updating ${entityType}:`, err)
        throw err
      } finally {
        setIsSubmitting(false)
      }
    },
    [updateMutation, entityType, onSuccess, transformBeforeUpdate],
  )

  const handleDelete = useCallback(
    async (id: string) => {
      if (!deleteMutation) return

      setError(null)

      try {
        const result = await deleteMutation(id)
        if (result && onSuccess) {
          await onSuccess()
        }
        return result
      } catch (err) {
        const message = err instanceof Error ? err.message : `Error deleting ${entityType}`
        setError(message)
        console.error(`Error deleting ${entityType}:`, err)
        throw err
      }
    },
    [deleteMutation, entityType, onSuccess],
  )

  // Helper function for handling file uploads in forms
  const handleFileUpload = useCallback(
    async (
      formData: any,
      uploadOptions?: { assetType?: string; folder?: string; projectId?: string },
    ) => {
      const token = await getAuthToken()
      if (!token) throw new Error('Not authenticated')

      const files = extractFiles(formData)
      const uploads: Record<string, string> = {}

      for (const [field, file] of files) {
        const result = await httpClient.uploadAsset(
          file,
          { ...(uploadOptions || {}), assetType: uploadOptions?.assetType || 'other' },
          token,
        )
        if (!result.success) {
          throw new Error(result.error || `Failed to upload ${field}`)
        }
        uploads[field] = result.data!.publicUrl
      }

      // Build final payload with uploaded file URLs
      const payload: any = { ...formData }
      for (const [field] of files) {
        const targetField = field.endsWith('File') ? field.slice(0, -4) : field
        payload[targetField] = uploads[field]
        delete payload[field]
      }

      return payload
    },
    [getAuthToken],
  )

  return {
    handleAdd,
    handleEdit,
    handleDelete,
    handleFileUpload,
    isSubmitting,
    error,
    setError,
  }
}
