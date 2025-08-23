# Portfolio Dashboard System

A comprehensive, modern dashboard for managing portfolio data with dynamic forms, validation, and a consistent blue color palette supporting both light and dark modes.

## Features

### 🎨 Modern Design
- **Blue Color Palette**: Consistent blue theme throughout the application
- **Dark/Light Mode**: Full support for both themes with smooth transitions
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Modern UI Components**: Built with shadcn/ui components for a polished look

### 📝 Dynamic Forms
- **React Hook Form**: All forms use react-hook-form for efficient form management
- **Zod Validation**: Comprehensive validation using Zod schemas
- **Dynamic Field Rendering**: Forms are generated dynamically from configuration
- **Multiple Field Types**: Support for text, email, password, number, textarea, select, multiselect, date, checkbox, file, and URL fields

### 🗄️ Data Management
- **CRUD Operations**: Full Create, Read, Update, Delete functionality for all entities
- **Search & Filter**: Built-in search functionality for all data tables
- **Bulk Operations**: Support for bulk actions (coming soon)
- **Real-time Updates**: Optimistic updates for better user experience

### 📊 Dashboard Overview
- **Statistics Cards**: Key metrics displayed in beautiful cards
- **Recent Activity**: Timeline of recent actions
- **Quick Actions**: Fast access to common tasks
- **Navigation**: Intuitive sidebar navigation

## Architecture

### Core Components

#### 1. DynamicForm (`/components/dashboard/DynamicForm.tsx`)
- Renders forms dynamically based on configuration
- Supports all field types with proper validation
- Handles form submission and error display
- Built with react-hook-form and Zod

#### 2. DataTable (`/components/dashboard/DataTable.tsx`)
- Reusable table component for displaying data
- Built-in search functionality
- CRUD operations with modal dialogs
- Customizable columns with custom renderers

#### 3. DashboardLayout (`/components/dashboard/DashboardLayout.tsx`)
- Main layout component with sidebar navigation
- Theme switching functionality
- Responsive design with mobile support
- Breadcrumb navigation

### Schema System

#### 1. Zod Schemas (`/lib/schemas.ts`)
- Comprehensive validation schemas for all entities
- Type-safe TypeScript interfaces
- Extensible validation rules
- Support for complex field types

#### 2. Form Configurations (`/lib/form-configs.ts`)
- Centralized form definitions
- Dynamic field configurations
- Validation rules and options
- Easy to extend and modify

### API Integration

#### 1. API Service (`/lib/api.ts`)
- Centralized API client
- Type-safe API responses
- Error handling and retry logic
- Easy to integrate with any backend

## Entity Types

The dashboard supports the following entity types:

### 1. Projects
- **Fields**: Title, Slug, Type, Description, Tech Stack, Tags, Hero Image, Visibility, Status
- **Features**: View counts, likes, publishing workflow

### 2. Experience
- **Fields**: Job Title, Company, Location, Dates, Description, Technologies, Achievements
- **Features**: Current position tracking, duration calculation

### 3. Certifications
- **Fields**: Name, Issuer, Dates, Credential ID, URL, Description
- **Features**: Expiry tracking, verification links

### 4. Badges
- **Fields**: Name, Issuer, Date, URL, Description, Category
- **Features**: Achievement tracking, categorization

### 5. Technologies
- **Fields**: Name, Category, Proficiency, Icon, Description, Years of Experience
- **Features**: Skill level tracking, experience calculation

### 6. Profile
- **Fields**: Personal info, Bio, Social links, Avatar
- **Features**: Complete profile management

### 7. Messages
- **Fields**: Contact info, Message content, Status
- **Features**: Message status tracking, reply management

### 8. Resumes
- **Fields**: Title, Description, File info, Visibility
- **Features**: File upload, version management

## Field Types

The dynamic form system supports the following field types:

### Basic Fields
- **text**: Single line text input
- **email**: Email input with validation
- **password**: Password input with masking
- **number**: Numeric input with min/max validation
- **url**: URL input with format validation

### Complex Fields
- **textarea**: Multi-line text input
- **select**: Dropdown selection with options
- **multiselect**: Multiple selection with tags
- **date**: Date picker
- **checkbox**: Boolean toggle
- **file**: File upload input

## Usage

### 1. Creating a New Dashboard Page

```tsx
import React, { useState, useEffect } from 'react'
import { DashboardLayout, Breadcrumb } from '@/components/dashboard/DashboardLayout'
import { DataTable } from '@/components/dashboard/DataTable'
import { YourEntityType } from '@/lib/schemas'

const YourPage: React.FC = () => {
  const [data, setData] = useState<YourEntityType[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const columns = [
    {
      key: 'fieldName',
      label: 'Field Label',
      render: (value: any, row: YourEntityType) => (
        // Custom renderer
      ),
    },
    // ... more columns
  ]

  const handleAdd = async (formData: any) => {
    // Handle add operation
  }

  const handleEdit = async (id: string, data: any) => {
    // Handle edit operation
  }

  const handleDelete = async (id: string) => {
    // Handle delete operation
  }

  return (
    <DashboardLayout currentSection="your-section">
      <Breadcrumb 
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Your Section' }
        ]} 
      />

      <DataTable
        title="Your Data"
        description="Manage your data"
        data={data}
        columns={columns}
        entityType="your-entity-type"
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={isLoading}
        addButtonText="Add New"
      />
    </DashboardLayout>
  )
}

export default YourPage
```

### 2. Adding a New Entity Type

1. **Add Schema** (`/lib/schemas.ts`):
```tsx
export const YourEntitySchema = BaseEntitySchema.extend({
  // Define your fields
})

export const YourEntityCreateSchema = YourEntitySchema.omit({ _id: true, createdAt: true, updatedAt: true })
export const YourEntityUpdateSchema = YourEntitySchema.partial().omit({ _id: true, createdAt: true, updatedAt: true })

export type YourEntity = z.infer<typeof YourEntitySchema>
export type YourEntityCreate = z.infer<typeof YourEntityCreateSchema>
export type YourEntityUpdate = z.infer<typeof YourEntityUpdateSchema>
```

2. **Add Form Config** (`/lib/form-configs.ts`):
```tsx
yourEntity: {
  id: 'yourEntity',
  title: 'Your Entity',
  description: 'Manage your entity',
  submitText: 'Save',
  cancelText: 'Cancel',
  fields: [
    // Define your form fields
  ],
},
```

3. **Add API Methods** (`/lib/api.ts`):
```tsx
async getYourEntities(): Promise<ApiResponse<any[]>> {
  return this.request('/your-entities')
}

async createYourEntity(data: any): Promise<ApiResponse<any>> {
  return this.request('/your-entities', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

// ... more methods
```

### 3. Customizing Field Rendering

```tsx
{
  key: 'customField',
  label: 'Custom Field',
  render: (value: any, row: YourEntity) => (
    <div className="custom-renderer">
      {/* Your custom rendering logic */}
    </div>
  ),
}
```

## Styling

### Color Palette
The dashboard uses a consistent blue color palette:

- **Primary Blue**: `#2563eb` (blue-600)
- **Light Blue**: `#3b82f6` (blue-500)
- **Dark Blue**: `#1d4ed8` (blue-700)
- **Background**: Blue gradients for light mode, slate for dark mode

### Dark Mode Support
All components support dark mode with:
- Automatic theme detection
- Manual theme switching
- Consistent color schemes
- Smooth transitions

## API Integration

The dashboard is designed to work with any REST API. The API service (`/lib/api.ts`) provides:

- **Type-safe requests**: All API calls are typed
- **Error handling**: Comprehensive error handling and user feedback
- **Authentication**: Easy to add authentication headers
- **Caching**: Built-in caching support (can be extended)

## Future Enhancements

### Planned Features
- **Bulk Operations**: Select multiple items for bulk actions
- **Advanced Filtering**: Complex filter combinations
- **Data Export**: Export data to CSV/PDF
- **Real-time Updates**: WebSocket integration for live updates
- **Analytics Dashboard**: Advanced analytics and reporting
- **User Management**: Multi-user support with roles and permissions

### Performance Optimizations
- **Virtual Scrolling**: For large datasets
- **Lazy Loading**: Load data on demand
- **Caching**: Intelligent caching strategies
- **Optimistic Updates**: Better user experience

## Contributing

When contributing to the dashboard system:

1. **Follow the existing patterns** for consistency
2. **Add proper TypeScript types** for all new features
3. **Include validation** using Zod schemas
4. **Test both light and dark modes**
5. **Ensure responsive design** works on all devices
6. **Add proper error handling** for all operations

## Dependencies

### Core Dependencies
- `react-hook-form`: Form management
- `@hookform/resolvers/zod`: Zod integration
- `zod`: Schema validation
- `next-themes`: Theme management
- `lucide-react`: Icons
- `@radix-ui/*`: UI primitives

### UI Components
- `shadcn/ui`: Modern UI components
- `tailwindcss`: Utility-first CSS
- `class-variance-authority`: Component variants

## Getting Started

1. **Install dependencies**:
```bash
yarn install
```

2. **Set up environment variables**:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

3. **Start the development server**:
```bash
yarn dev
```

4. **Navigate to the dashboard**:
```
http://localhost:3000/dashboard
```

The dashboard system is now ready to use! 🚀
