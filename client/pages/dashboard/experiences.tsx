import React, { useState } from 'react'
import { DashboardLayout, Breadcrumb } from '@/components/dashboard/DashboardLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import {
  useExperiences,
  useCreateExperience,
  useUpdateExperience,
  useDeleteExperience,
} from '@/hooks/useHttpApi'
import { Experience } from '@/types/api'
import { MediaLibraryPicker } from '@/components/ui/media-library-picker'
import { formatMonthYear, calculateDuration } from '@/lib/formatters'
import { handleImageError } from '@/lib/image-utils'
import {
  Plus,
  PencilSimple,
  Trash,
  Briefcase,
  MapPin,
  Calendar,
  Buildings,
  LinkedinLogo,
} from '@phosphor-icons/react'

interface ExperienceFormData {
  title: string
  company: string
  employmentType:
    | 'Full-time'
    | 'Part-time'
    | 'Contract'
    | 'Freelance'
    | 'Internship'
    | 'Apprenticeship'
    | 'Seasonal'
  location: string
  locationType: 'On-site' | 'Remote' | 'Hybrid'
  description: string
  startDate: string
  endDate: string
  current: boolean
  skills: string
  companyLogoUrl: string
  linkedinUrl: string
}

const ExperienceModal: React.FC<{
  isOpen: boolean
  onClose: () => void
  experience?: Experience
  onSubmit: (data: ExperienceFormData) => void
}> = ({ isOpen, onClose, experience, onSubmit }) => {
  const [formData, setFormData] = useState<ExperienceFormData>({
    title: experience?.title || '',
    company: experience?.company || '',
    employmentType: experience?.employmentType || 'Full-time',
    location: experience?.location || '',
    locationType: experience?.locationType || 'On-site',
    description: experience?.description || '',
    startDate: experience?.startDate || '',
    endDate: experience?.endDate || '',
    current: experience?.current || false,
    skills: experience?.skills?.join(', ') || '',
    companyLogoUrl: experience?.companyLogoUrl || '',
    linkedinUrl: experience?.linkedinUrl || '',
  })
  const [isImagePickerOpen, setIsImagePickerOpen] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
    onClose()
  }

  const handleInputChange = (field: keyof ExperienceFormData, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto no-scrollbar'>
        <DialogHeader>
          <DialogTitle className='text-xl font-semibold'>
            {experience ? 'Edit Experience' : 'Add Experience'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-6'>
          <div className='grid grid-cols-1 gap-4'>
            {/* Job Title */}
            <div>
              <Label htmlFor='title'>Title *</Label>
              <Input
                id='title'
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder='Ex: Frontend Developer'
                required
              />
            </div>

            {/* Company */}
            <div>
              <Label htmlFor='company'>Company *</Label>
              <Input
                id='company'
                value={formData.company}
                onChange={(e) => handleInputChange('company', e.target.value)}
                placeholder='Ex: EF Education First'
                required
              />
            </div>

            {/* Employment Type */}
            <div>
              <Label htmlFor='employmentType'>Employment Type</Label>
              <Select
                value={formData.employmentType}
                onValueChange={(value: string) => handleInputChange('employmentType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Select employment type' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='Full-time'>Full-time</SelectItem>
                  <SelectItem value='Part-time'>Part-time</SelectItem>
                  <SelectItem value='Contract'>Contract</SelectItem>
                  <SelectItem value='Freelance'>Freelance</SelectItem>
                  <SelectItem value='Internship'>Internship</SelectItem>
                  <SelectItem value='Apprenticeship'>Apprenticeship</SelectItem>
                  <SelectItem value='Seasonal'>Seasonal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Location */}
            <div>
              <Label htmlFor='location'>Location</Label>
              <Input
                id='location'
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder='Ex: London Area, United Kingdom'
              />
            </div>

            {/* Location Type */}
            <div>
              <Label htmlFor='locationType'>Location Type</Label>
              <Select
                value={formData.locationType}
                onValueChange={(value: string) => handleInputChange('locationType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Select location type' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='On-site'>On-site</SelectItem>
                  <SelectItem value='Remote'>Remote</SelectItem>
                  <SelectItem value='Hybrid'>Hybrid</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Current Position Checkbox */}
            <div className='flex items-center space-x-2'>
              <Checkbox
                id='current'
                checked={formData.current}
                onCheckedChange={(checked) => handleInputChange('current', checked as boolean)}
              />
              <Label htmlFor='current'>I am currently working in this role</Label>
            </div>

            {/* Date Range */}
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <Label htmlFor='startDate'>Start Date *</Label>
                <Input
                  id='startDate'
                  type='month'
                  value={formData.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  required
                />
              </div>
              {!formData.current && (
                <div>
                  <Label htmlFor='endDate'>End Date</Label>
                  <Input
                    id='endDate'
                    type='month'
                    value={formData.endDate}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                  />
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <Label htmlFor='description'>Description</Label>
              <Textarea
                id='description'
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder='Describe your responsibilities, achievements, and impact...'
                rows={4}
              />
            </div>

            {/* Skills */}
            <div>
              <Label htmlFor='skills'>Skills</Label>
              <Input
                id='skills'
                value={formData.skills}
                onChange={(e) => handleInputChange('skills', e.target.value)}
                placeholder='Ex: React, TypeScript, Node.js (comma separated)'
              />
            </div>

            {/* Company Logo (Image Picker) */}
            <div className='space-y-2'>
              <Label>Company Logo</Label>
              {formData.companyLogoUrl && (
                <div className='relative inline-block'>
                  <img
                    src={formData.companyLogoUrl}
                    alt='Company logo'
                    className='w-24 h-24 object-cover rounded border'
                  />
                </div>
              )}
              <div className='flex gap-2'>
                <Button type='button' variant='outline' onClick={() => setIsImagePickerOpen(true)}>
                  {formData.companyLogoUrl ? 'Change Logo' : 'Select Logo'}
                </Button>
                <Input
                  placeholder='Or paste image URL directly...'
                  value={formData.companyLogoUrl}
                  onChange={(e) => handleInputChange('companyLogoUrl', e.target.value)}
                />
              </div>
              <MediaLibraryPicker
                isOpen={isImagePickerOpen}
                onClose={() => setIsImagePickerOpen(false)}
                onSelect={(url) => handleInputChange('companyLogoUrl', url)}
                filter='image'
                title='Select Company Logo'
                uploadOptions={{
                  assetType: 'experience',
                }}
              />
            </div>

            {/* LinkedIn URL */}
            <div>
              <Label htmlFor='linkedinUrl'>LinkedIn Company Page</Label>
              <Input
                id='linkedinUrl'
                value={formData.linkedinUrl}
                onChange={(e) => handleInputChange('linkedinUrl', e.target.value)}
                placeholder='https://www.linkedin.com/company/example'
              />
            </div>
          </div>

          <div className='flex justify-end gap-3 pt-4 border-t'>
            <Button type='button' variant='outline' onClick={onClose}>
              Cancel
            </Button>
            <Button type='submit' className='bg-black cursor-pointer'>
              {experience ? 'Update' : 'Add'} Experience
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

const ExperienceCard: React.FC<{
  experience: Experience
  onEdit: () => void
  onDelete: () => void
}> = ({ experience, onEdit, onDelete }) => {
  return (
    <Card className='hover:shadow-lg transition-shadow duration-200'>
      <CardContent className='p-6'>
        <div className='flex items-start gap-4'>
          {/* Company Logo */}
          <div className='flex-shrink-0'>
            {experience.companyLogoUrl ? (
              <img
                src={experience.companyLogoUrl}
                alt={`${experience.company} logo`}
                className='w-12 h-12 rounded object-cover bg-gray-100'
                onError={handleImageError}
              />
            ) : null}
            <div
              className={`w-12 h-12 rounded bg-blue-100 flex items-center justify-center ${
                experience.companyLogoUrl ? 'hidden' : ''
              }`}
            >
              <Buildings className='w-6 h-6 text-blue-600' />
            </div>
          </div>

          {/* Experience Details */}
          <div className='flex-1 min-w-0'>
            <div className='flex items-start justify-between'>
              <div className='flex-1 min-w-0'>
                <h3 className='text-lg font-semibold text-gray-900 dark:text-white truncate'>
                  {experience.title}
                </h3>
                <div className='flex items-center gap-2 mt-1'>
                  <p className='text-gray-700 dark:text-gray-300 font-medium'>
                    {experience.company}
                  </p>
                  {experience.linkedinUrl && (
                    <a
                      href={experience.linkedinUrl}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='text-blue-600 hover:text-blue-700'
                    >
                      <LinkedinLogo className='w-4 h-4' />
                    </a>
                  )}
                </div>

                <div className='flex items-center gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400'>
                  <div className='flex items-center gap-1'>
                    <Briefcase className='w-4 h-4' />
                    <span>{experience.employmentType}</span>
                  </div>

                  <div className='flex items-center gap-1'>
                    <Calendar className='w-4 h-4' />
                    <span>
                      {formatMonthYear(experience.startDate)} -{' '}
                      {experience.current ? 'Present' : formatMonthYear(experience.endDate || '')}
                      {' · '}
                      {calculateDuration(
                        experience.startDate,
                        experience.current ? undefined : experience.endDate || undefined,
                      )}
                    </span>
                  </div>
                </div>

                {experience.location && (
                  <div className='flex items-center gap-1 mt-1 text-sm text-gray-600 dark:text-gray-400'>
                    <MapPin className='w-4 h-4' />
                    <span>
                      {experience.location} · {experience.locationType}
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className='flex items-center gap-2 ml-4'>
                <Button variant='ghost' size='sm' onClick={onEdit} className='h-8 w-8 p-0'>
                  <PencilSimple className='h-4 w-4' />
                </Button>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={onDelete}
                  className='h-8 w-8 p-0 text-red-600 hover:text-red-700'
                >
                  <Trash className='h-4 w-4' />
                </Button>
              </div>
            </div>

            {/* Description */}
            {experience.description && (
              <div className='mt-4'>
                <p className='text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed'>
                  {experience.description}
                </p>
              </div>
            )}

            {/* Skills */}
            {experience.skills && experience.skills.length > 0 && (
              <div className='mt-4'>
                <div className='flex items-center gap-2 mb-2'>
                  <span className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                    Skills:
                  </span>
                </div>
                <div className='flex flex-wrap gap-2'>
                  {experience.skills.map((skill, index) => (
                    <Badge key={index} variant='secondary' className='text-xs'>
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function ExperiencesPage() {
  const { data: experiencesData, loading, error, refetch } = useExperiences()
  const createExperience = useCreateExperience()
  const updateExperience = useUpdateExperience()
  const deleteExperience = useDeleteExperience()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingExperience, setEditingExperience] = useState<Experience | undefined>()

  const experiences = experiencesData || []

  const handleSubmit = async (formData: ExperienceFormData) => {
    try {
      const experienceData = {
        ...formData,
        skills: formData.skills
          .split(',')
          .map((skill) => skill.trim())
          .filter(Boolean),
        current: formData.current,
        endDate: formData.current ? undefined : formData.endDate,
      }

      if (editingExperience) {
        await updateExperience.mutate({ id: editingExperience._id, updates: experienceData })
      } else {
        await createExperience.mutate(experienceData)
      }
      refetch()
      setEditingExperience(undefined)
    } catch (err) {
      console.error('Error saving experience:', err)
    }
  }

  const handleEdit = (experience: Experience) => {
    setEditingExperience(experience)
    setIsModalOpen(true)
  }

  const handleDelete = async (experienceId: string) => {
    try {
      await deleteExperience.mutate(experienceId)
      refetch()
    } catch (err) {
      console.error('Error deleting experience:', err)
    }
  }

  const handleAddNew = () => {
    setEditingExperience(undefined)
    setIsModalOpen(true)
  }

  if (loading) {
    return (
      <DashboardLayout currentSection='experiences'>
        <Breadcrumb items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Experience' }]} />
        <div className='flex items-center justify-center h-64'>
          <div className='text-gray-500'>Loading experiences...</div>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout currentSection='experiences'>
        <Breadcrumb items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Experience' }]} />
        <div className='mb-6 p-4 bg-red-50 border border-red-200 rounded-md'>
          <p className='text-red-700'>Error loading experiences: {error}</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout currentSection='experiences'>
      <Breadcrumb items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Experience' }]} />

      {/* Header */}
      <div className='flex items-center justify-between mb-8'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900 dark:text-white'>Experience</h1>
          <p className='text-gray-600 dark:text-gray-400 mt-1'>
            Manage your professional experience and career history
          </p>
        </div>
        <Button onClick={handleAddNew} className='bg-black cursor-pointer'>
          <Plus className='w-4 h-4 mr-2' />
          Add Experience
        </Button>
      </div>

      {/* Experience List */}
      <div className='space-y-4'>
        {experiences.length === 0 ? (
          <Card>
            <CardContent className='p-12 text-center'>
              <Briefcase className='w-12 h-12 text-gray-400 mx-auto mb-4' />
              <h3 className='text-lg font-medium text-gray-900 dark:text-white mb-2'>
                No experiences yet
              </h3>
              <p className='text-gray-600 dark:text-gray-400 mb-6'>
                Start building your professional profile by adding your work experience.
              </p>
              <Button onClick={handleAddNew} className='bg-black cursor-pointer'>
                <Plus className='w-4 h-4 mr-2' />
                Add Your First Experience
              </Button>
            </CardContent>
          </Card>
        ) : (
          experiences.map((experience) => (
            <ExperienceCard
              key={experience._id}
              experience={experience}
              onEdit={() => handleEdit(experience)}
              onDelete={() => handleDelete(experience._id)}
            />
          ))
        )}
      </div>

      {/* Experience Modal */}
      <ExperienceModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingExperience(undefined)
        }}
        experience={editingExperience}
        onSubmit={handleSubmit}
      />
    </DashboardLayout>
  )
}
