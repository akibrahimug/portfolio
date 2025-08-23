'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Plus, MagnifyingGlass, DotsThree, PencilSimple, Trash, Eye } from '@phosphor-icons/react'
import { DynamicForm } from './DynamicForm'
import { getFormConfig } from '@/lib/form-configs'

interface Column {
  key: string
  label: string
  render?: (value: any, row: any) => React.ReactNode
}

interface DataTableProps {
  title: string
  description?: string
  data: any[]
  columns: Column[]
  entityType: string
  onAdd?: (data: any) => void
  onEdit?: (id: string, data: any) => void
  onDelete?: (id: string) => void
  onView?: (id: string) => void
  isLoading?: boolean
  searchable?: boolean
  addButtonText?: string
}

export const DataTable: React.FC<DataTableProps> = ({
  title,
  description,
  data,
  columns,
  entityType,
  onAdd,
  onEdit,
  onDelete,
  onView,
  isLoading = false,
  searchable = true,
  addButtonText = 'Add New',
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const formConfig = getFormConfig(entityType)

  const filteredData = data.filter((item) =>
    Object.values(item).some((value) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase()),
    ),
  )

  const handleAdd = async (formData: any) => {
    if (!onAdd) return

    setIsSubmitting(true)
    try {
      await onAdd(formData)
      setIsAddDialogOpen(false)
    } catch (error) {
      console.error('Error adding item:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = async (formData: any) => {
    if (!onEdit || !selectedItem) return

    setIsSubmitting(true)
    try {
      await onEdit(selectedItem._id || selectedItem.id, formData)
      setIsEditDialogOpen(false)
      setSelectedItem(null)
    } catch (error) {
      console.error('Error editing item:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!onDelete) return

    setSelectedItem({ id })
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!onDelete || !selectedItem) return

    try {
      await onDelete(selectedItem.id)
      setIsDeleteDialogOpen(false)
      setSelectedItem(null)
    } catch (error) {
      console.error('Error deleting item:', error)
    }
  }

  const handleView = (item: any) => {
    setSelectedItem(item)
    setIsViewDialogOpen(true)
  }

  const handleEditClick = (item: any) => {
    setSelectedItem(item)
    setIsEditDialogOpen(true)
  }

  const renderCell = (column: Column, item: any) => {
    const value = item[column.key]

    if (column.render) {
      return column.render(value, item)
    }

    // Default rendering based on value type
    if (Array.isArray(value)) {
      return (
        <div className='flex flex-wrap gap-1'>
          {value.map((v, index) => (
            <Badge key={index} variant='secondary' className='text-xs'>
              {v}
            </Badge>
          ))}
        </div>
      )
    }

    if (typeof value === 'boolean') {
      return <Badge variant={value ? 'default' : 'secondary'}>{value ? 'Yes' : 'No'}</Badge>
    }

    if (value === null || value === undefined) {
      return <span className='text-muted-foreground'>-</span>
    }

    return String(value)
  }

  if (!formConfig) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Form configuration not found for entity type: {entityType}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <div>
            <CardTitle>{title}</CardTitle>
            {description && <p className='text-sm text-muted-foreground mt-1'>{description}</p>}
          </div>
          {onAdd && (
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className='h-4 w-4 mr-2' />
                  {addButtonText}
                </Button>
              </DialogTrigger>
              <DialogContent className='max-w-2xl max-h-[80vh] overflow-y-auto'>
                <DialogHeader>
                  <DialogTitle>Add New {formConfig.title}</DialogTitle>
                  <DialogDescription>{formConfig.description}</DialogDescription>
                </DialogHeader>
                <DynamicForm
                  formConfig={formConfig}
                  onSubmit={handleAdd}
                  onCancel={() => setIsAddDialogOpen(false)}
                  isLoading={isSubmitting}
                />
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {searchable && (
          <div className='mb-4'>
            <div className='relative'>
              <MagnifyingGlass className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4' />
              <Input
                placeholder='Search...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='pl-10'
              />
            </div>
          </div>
        )}

        <div className='w-full overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0 no-scrollbar'>
          <div className='rounded-md border min-w-[500px]'>
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map((column, index) => (
                    <TableHead
                      key={column.key}
                      className={`px-2 sm:px-4 py-2 text-xs sm:text-sm whitespace-nowrap ${
                        index === 0 ? 'min-w-[100px]' : 'min-w-[80px] sm:min-w-[100px]'
                      }`}
                    >
                      {column.label}
                    </TableHead>
                  ))}
                  <TableHead className='w-[60px] sm:w-[80px] text-right px-2 sm:px-4 py-2 text-xs sm:text-sm'>
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={columns.length + 1} className='text-center py-8'>
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={columns.length + 1} className='text-center py-8'>
                      {searchTerm ? 'No results found' : 'No data available'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData.map((item, index) => (
                    <TableRow key={item._id || item.id || index}>
                      {columns.map((column) => (
                        <TableCell
                          key={column.key}
                          className='px-2 sm:px-4 py-2 text-xs sm:text-sm'
                        >
                          <div className='max-w-[150px] sm:max-w-none truncate'>
                            {renderCell(column, item)}
                          </div>
                        </TableCell>
                      ))}
                      <TableCell className='text-right px-2 sm:px-4 py-2'>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant='ghost' className='h-8 w-8 p-0'>
                              <span className='sr-only'>Open menu</span>
                              <DotsThree className='h-4 w-4' />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align='end'>
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            {onView && (
                              <DropdownMenuItem onClick={() => handleView(item)}>
                                <Eye className='mr-2 h-4 w-4' />
                                View
                              </DropdownMenuItem>
                            )}
                            {onEdit && (
                              <DropdownMenuItem onClick={() => handleEditClick(item)}>
                                <PencilSimple className='mr-2 h-4 w-4' />
                                Edit
                              </DropdownMenuItem>
                            )}
                            {onDelete && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleDelete(item._id || item.id)}
                                  className='text-red-600'
                                >
                                  <Trash className='mr-2 h-4 w-4' />
                                  Delete
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Edit Dialog */}
        {onEdit && (
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className='max-w-2xl max-h-[80vh] overflow-y-auto'>
              <DialogHeader>
                <DialogTitle>Edit {formConfig.title}</DialogTitle>
                <DialogDescription>{formConfig.description}</DialogDescription>
              </DialogHeader>
              {selectedItem && (
                <DynamicForm
                  formConfig={formConfig}
                  defaultValues={selectedItem}
                  onSubmit={handleEdit}
                  onCancel={() => {
                    setIsEditDialogOpen(false)
                    setSelectedItem(null)
                  }}
                  isLoading={isSubmitting}
                />
              )}
            </DialogContent>
          </Dialog>
        )}

        {/* View Dialog */}
        {onView && (
          <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
            <DialogContent className='max-w-2xl max-h-[80vh] overflow-y-auto'>
              <DialogHeader>
                <DialogTitle>View {formConfig.title}</DialogTitle>
                <DialogDescription>{formConfig.description}</DialogDescription>
              </DialogHeader>
              {selectedItem && (
                <div className='space-y-4'>
                  {formConfig.fields.map((field) => (
                    <div key={field.name}>
                      <label className='text-sm font-medium'>{field.label}</label>
                      <div className='mt-1'>
                        {renderCell({ key: field.name, label: field.label }, selectedItem)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </DialogContent>
          </Dialog>
        )}

        {/* Delete Confirmation Dialog */}
        {onDelete && (
          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this {entityType}? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <div className='flex justify-end space-x-2'>
                <Button
                  variant='outline'
                  onClick={() => {
                    setIsDeleteDialogOpen(false)
                    setSelectedItem(null)
                  }}
                >
                  Cancel
                </Button>
                <Button variant='destructive' onClick={confirmDelete}>
                  Delete
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  )
}
