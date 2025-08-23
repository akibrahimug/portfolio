import type { Metadata } from 'next'
import { CvComponent } from '@/components/CV'

export const metadata: Metadata = {
  title: 'Kasoma Ibrahim | Fullstack Developer CV',
  description: 'Professional CV of Kasoma Ibrahim, Fullstack Developer',
}

export default function CVPage() {
  return (
    <main className='container mx-auto py-10 px-4 min-h-screen bg-gray-50 print:bg-white print:py-0'>
      <CvComponent />
    </main>
  )
}
