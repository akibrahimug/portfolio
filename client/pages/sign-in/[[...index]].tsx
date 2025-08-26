import { SignIn } from '@clerk/nextjs'

export default function Page() {
  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800'>
      <div className='max-w-md w-full space-y-8 p-8'>
        <div className='text-center'>
          <h2 className='mt-6 text-3xl font-extrabold text-gray-900 dark:text-white'>
            Welcome Back
          </h2>
          <p className='mt-2 text-sm text-gray-600 dark:text-gray-400'>
            Sign in to access your portfolio dashboard
          </p>
        </div>
        <div className='mt-8'>
          <SignIn
            appearance={{
              elements: {
                formButtonPrimary: 'bg-blue-600 hover:bg-blue-700 text-sm normal-case',
                card: 'shadow-lg border border-gray-200 dark:border-slate-700',
                headerTitle: 'text-gray-900 dark:text-white',
                headerSubtitle: 'text-gray-600 dark:text-gray-400',
                socialButtonsBlockButton:
                  'border border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-800',
                formFieldLabel: 'text-gray-700 dark:text-gray-300',
                formFieldInput:
                  'border border-gray-300 dark:border-slate-600 focus:ring-blue-500 focus:border-blue-500',
                footerActionLink: 'text-blue-600 hover:text-blue-700',
              },
            }}
          />
        </div>
      </div>
    </div>
  )
}
