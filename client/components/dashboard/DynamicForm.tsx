'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { X, Image } from '@phosphor-icons/react'
import { MediaLibraryPicker } from '@/components/ui/media-library-picker'
import { Form as FormSchema } from '@/lib/schemas'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { AssetTrackingProvider, useAssetTrackingContext } from '@/contexts/AssetTrackingContext'

interface DynamicFormProps {
  formConfig: FormSchema
  defaultValues?: Record<string, any>
  onSubmit: (data: any) => void
  onCancel?: () => void
  isLoading?: boolean
}

const DynamicFormInner: React.FC<DynamicFormProps> = ({
  formConfig,
  defaultValues = {},
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  // Access asset tracking from context
  const { cleanupAssets, clearTracking } = useAssetTrackingContext()
  // Build zod schema dynamically from form config
  const buildZodSchema = React.useCallback((fields: FormSchema['fields']) => {
    const schemaObject: Record<string, any> = {}

    fields.forEach((field) => {
      let fieldSchema: any

      switch (field.type) {
        case 'text':
        case 'email':
        case 'password':
        case 'url':
          fieldSchema = z.string()
          if (field.validation?.minLength) {
            fieldSchema = fieldSchema.min(
              field.validation.minLength,
              `${field.label} must be at least ${field.validation.minLength} characters`,
            )
          }
          if (field.validation?.maxLength) {
            fieldSchema = fieldSchema.max(
              field.validation.maxLength,
              `${field.label} must be less than ${field.validation.maxLength} characters`,
            )
          }
          if (field.validation?.pattern) {
            fieldSchema = fieldSchema.regex(
              new RegExp(field.validation.pattern),
              `${field.label} format is invalid`,
            )
          }
          if (field.type === 'email') {
            fieldSchema = fieldSchema.email('Must be a valid email')
          }
          if (field.type === 'url') {
            fieldSchema = fieldSchema.url('Must be a valid URL').or(z.literal(''))
          }
          break

        case 'number':
          fieldSchema = z.number()
          if (field.validation?.min !== undefined) {
            fieldSchema = fieldSchema.min(
              field.validation.min,
              `${field.label} must be at least ${field.validation.min}`,
            )
          }
          if (field.validation?.max !== undefined) {
            fieldSchema = fieldSchema.max(
              field.validation.max,
              `${field.label} must be at most ${field.validation.max}`,
            )
          }
          break

        case 'textarea':
          fieldSchema = z.string()
          if (field.validation?.minLength) {
            fieldSchema = fieldSchema.min(
              field.validation.minLength,
              `${field.label} must be at least ${field.validation.minLength} characters`,
            )
          }
          if (field.validation?.maxLength) {
            fieldSchema = fieldSchema.max(
              field.validation.maxLength,
              `${field.label} must be less than ${field.validation.maxLength} characters`,
            )
          }
          break

        case 'select':
          if (field.options) {
            fieldSchema = z.enum(field.options.map((opt) => opt.value) as [string, ...string[]])
          } else {
            fieldSchema = z.string()
          }
          break

        case 'multiselect':
          fieldSchema = z.array(z.string()).default([])
          break

        case 'date':
          fieldSchema = z.string()
          break

        case 'checkbox':
          fieldSchema = z.boolean().default(false)
          break

        case 'file':
          fieldSchema = z.string()
          break

        default:
          fieldSchema = z.string()
      }

      if (!field.required) {
        fieldSchema = fieldSchema.optional()
      }

      schemaObject[field.name] = fieldSchema
    })

    return z.object(schemaObject)
  }, [])

  const schema = React.useMemo(
    () => buildZodSchema(formConfig.fields),
    [buildZodSchema, formConfig.fields],
  )
  type FormData = z.infer<typeof schema>

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues,
  })

  const handleSubmit = (data: FormData) => {
    // Clear asset tracking on successful submit since form data is being saved
    clearTracking()
    onSubmit(data)
  }

  const handleCancel = React.useCallback(() => {
    // Clean up any uploaded assets when form is cancelled
    cleanupAssets().finally(() => {
      onCancel?.()
    })
  }, [cleanupAssets, onCancel])

  // Clean up assets on component unmount (user navigates away)
  React.useEffect(() => {
    return () => {
      cleanupAssets().catch((err) => console.warn('Failed to cleanup assets on unmount:', err))
    }
  }, [cleanupAssets])

  const renderField = React.useCallback(
    (field: FormSchema['fields'][0]) => {
      const fieldName = field.name as keyof FormData

      switch (field.type) {
        case 'text':
        case 'email':
        case 'password':
        case 'url':
          return (
            <FormField
              key={field.name}
              control={form.control}
              name={fieldName}
              render={({ field: formField }) => (
                <FormItem>
                  <FormLabel>{field.label}</FormLabel>
                  <FormControl>
                    <Input
                      type={field.type}
                      placeholder={field.placeholder}
                      value={(formField.value as any) ?? ''}
                      onChange={formField.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )

        case 'number':
          return (
            <FormField
              key={field.name}
              control={form.control}
              name={fieldName}
              render={({ field: formField }) => (
                <FormItem>
                  <FormLabel>{field.label}</FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      placeholder={field.placeholder}
                      value={
                        formField.value === undefined || formField.value === null
                          ? ''
                          : (formField.value as any)
                      }
                      onChange={(e) =>
                        formField.onChange(
                          e.target.value === '' ? undefined : Number(e.target.value),
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )

        case 'textarea':
          return (
            <FormField
              key={field.name}
              control={form.control}
              name={fieldName}
              render={({ field: formField }) => (
                <FormItem>
                  <FormLabel>{field.label}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={field.placeholder}
                      value={(formField.value as any) ?? ''}
                      onChange={formField.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )

        case 'select':
          return (
            <FormField
              key={field.name}
              control={form.control}
              name={fieldName}
              render={({ field: formField }) => (
                <FormItem>
                  <FormLabel>{field.label}</FormLabel>
                  <Select
                    onValueChange={formField.onChange}
                    value={(formField.value as any) ?? undefined}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={field.placeholder || `Select ${field.label.toLowerCase()}`}
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {field.options?.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )

        case 'multiselect':
          return (
            <FormField
              key={field.name}
              control={form.control}
              name={fieldName}
              render={({ field: formField }) => {
                const [inputValue, setInputValue] = React.useState('')
                const [showSuggestions, setShowSuggestions] = React.useState(false)

                const filteredOptions = React.useMemo(
                  () =>
                    field.options?.filter(
                      (option) =>
                        option.label.toLowerCase().includes(inputValue.toLowerCase()) &&
                        !formField.value?.includes(option.value),
                    ) || [],
                  [field.options, inputValue, formField.value],
                )

                const addTag = (value: string) => {
                  if (value.trim() && !formField.value?.includes(value.trim())) {
                    const newValue = [...(formField.value || []), value.trim()]
                    formField.onChange(newValue)
                  }
                  setInputValue('')
                  setShowSuggestions(false)
                }

                const handleKeyDown = (e: React.KeyboardEvent) => {
                  if (e.key === 'Enter' || e.key === ',') {
                    e.preventDefault()
                    addTag(inputValue)
                  } else if (e.key === 'Backspace' && !inputValue && formField.value?.length) {
                    const newValue = formField.value.slice(0, -1)
                    formField.onChange(newValue)
                  }
                }

                return (
                  <FormItem>
                    <FormLabel>{field.label}</FormLabel>
                    <FormControl>
                      <div className='space-y-2'>
                        {/* Display selected tags */}
                        <div className='flex flex-wrap gap-2'>
                          {(formField.value || []).map((item: string, index: number) => (
                            <Badge
                              key={index}
                              variant='secondary'
                              className='flex items-center gap-1'
                            >
                              {item}
                              <X
                                className='h-3 w-3 cursor-pointer'
                                onClick={() => {
                                  const newValue =
                                    formField.value?.filter((_: any, i: number) => i !== index) ||
                                    []
                                  formField.onChange(newValue)
                                }}
                              />
                            </Badge>
                          ))}
                        </div>

                        {/* Input field with suggestions */}
                        <div className='relative'>
                          <Input
                            value={inputValue}
                            onChange={(e) => {
                              setInputValue(e.target.value)
                              setShowSuggestions(e.target.value.length > 0)
                            }}
                            onKeyDown={handleKeyDown}
                            onFocus={() => setShowSuggestions(inputValue.length > 0)}
                            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                            placeholder={`Type to add ${field.label.toLowerCase()}... (Press Enter or comma to add)`}
                          />

                          {/* Suggestions dropdown */}
                          {showSuggestions && filteredOptions.length > 0 && (
                            <div className='absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-40 overflow-y-auto'>
                              {filteredOptions.map((option) => (
                                <div
                                  key={option.value}
                                  className='px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm'
                                  onClick={() => addTag(option.value)}
                                >
                                  {option.label}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Helper text */}
                        <p className='text-xs text-muted-foreground'>
                          Type freely and press Enter or comma to add. Click suggestions to use
                          them.
                        </p>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )
              }}
            />
          )

        case 'image':
          return (
            <FormField
              key={field.name}
              control={form.control}
              name={fieldName}
              render={({ field: formField }) => {
                const [isPickerOpen, setIsPickerOpen] = React.useState(false)
                const hasPreview = !!form.watch('hasPreview' as any)

                return (
                  <FormItem>
                    <FormLabel>{field.label}</FormLabel>
                    <FormControl>
                      <div className='space-y-3'>
                        {/* Current image preview */}
                        {formField.value && hasPreview && (
                          <div className='relative inline-block'>
                            <img
                              src={formField.value}
                              alt='Selected image'
                              className='w-32 h-32 object-cover rounded-lg border'
                            />
                            <Button
                              type='button'
                              variant='destructive'
                              size='sm'
                              className='absolute -top-2 -right-2 h-6 w-6 rounded-full p-0'
                              onClick={() => formField.onChange('')}
                              disabled={!hasPreview}
                            >
                              <X className='h-3 w-3' />
                            </Button>
                          </div>
                        )}

                        {/* Simple URL input only */}
                        <div className='space-y-2'>
                          <Input
                            placeholder='Enter image URL...'
                            value={formField.value || ''}
                            onChange={(e) => formField.onChange(e.target.value)}
                            disabled={!hasPreview}
                          />
                          <Button
                            type='button'
                            variant='outline'
                            onClick={() => setIsPickerOpen(true)}
                            className='cursor-pointer'
                            disabled={!hasPreview}
                          >
                            <Image className='w-4 h-4 mr-2' />
                            {formField.value ? 'Change Image' : 'Browse Images'}
                          </Button>
                        </div>

                        {/* Media Library Picker */}
                        <MediaLibraryPicker
                          isOpen={isPickerOpen}
                          onClose={() => setIsPickerOpen(false)}
                          onSelect={(url) => {
                            formField.onChange(url)
                            setIsPickerOpen(false)
                          }}
                          filter='image'
                          title={`Select ${field.label}`}
                          uploadOptions={
                            formConfig.id === 'technology'
                              ? {
                                  assetType: 'technology',
                                }
                              : formConfig.id === 'project'
                              ? {
                                  assetType: 'project',
                                }
                              : formConfig.id === 'experience'
                              ? {
                                  assetType: 'experience',
                                }
                              : undefined
                          }
                          disabled={!hasPreview}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )
              }}
            />
          )

        case 'date':
          return (
            <FormField
              key={field.name}
              control={form.control}
              name={fieldName}
              render={({ field: formField }) => (
                <FormItem>
                  <FormLabel>{field.label}</FormLabel>
                  <FormControl>
                    <Input
                      type='date'
                      value={(formField.value as any) ?? ''}
                      onChange={formField.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )

        case 'checkbox':
          return (
            <FormField
              key={field.name}
              control={form.control}
              name={fieldName}
              render={({ field: formField }) => (
                <FormItem className='flex flex-row items-start space-x-3 space-y-0'>
                  <FormControl>
                    <Checkbox checked={!!formField.value} onCheckedChange={formField.onChange} />
                  </FormControl>
                  <div className='space-y-1 leading-none'>
                    <FormLabel>{field.label}</FormLabel>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          )

        case 'file':
          return (
            <FormField
              key={field.name}
              control={form.control}
              name={fieldName}
              render={({ field: formField }) => (
                <FormItem>
                  <FormLabel>{field.label}</FormLabel>
                  <FormControl>
                    <Input
                      type='file'
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          formField.onChange(file.name)
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )

        default:
          return null
      }
    },
    [form.control, form.watch, formConfig.id],
  )

  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-2xl font-bold tracking-tight'>{formConfig.title}</h2>
        {formConfig.description && (
          <p className='text-muted-foreground'>{formConfig.description}</p>
        )}
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-4'>
          {formConfig.fields.map(renderField)}

          <div className='flex gap-4 pt-4'>
            <Button type='submit' disabled={isLoading}>
              {isLoading ? 'Saving...' : formConfig.submitText}
            </Button>
            {onCancel && (
              <Button type='button' variant='outline' onClick={handleCancel}>
                {formConfig.cancelText}
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  )
}

// Wrapper component with AssetTrackingProvider
export const DynamicForm: React.FC<DynamicFormProps> = (props) => {
  return (
    <AssetTrackingProvider>
      <DynamicFormInner {...props} />
    </AssetTrackingProvider>
  )
}
