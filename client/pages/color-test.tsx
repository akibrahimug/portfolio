import React from 'react'
import { ArrowLeft } from '@phosphor-icons/react'
import Link from 'next/link'

interface ColorSwatch {
  shade: string
  usage: string
}

interface ColorTheme {
  name: string
  description: string
  components: string[]
  shades: ColorSwatch[]
  prefix: string
}

const ColorTest: React.FC = () => {
  const colorThemes: ColorTheme[] = [
    {
      name: 'Brand Red',
      description: 'Primary brand color used for CTAs, highlights, and accents',
      components: [
        'Header - Back button hover',
        'ProfileDesc - "Let\'s talk" button, social icon hovers',
        'Footer - Social icon hovers, link hovers',
        'Methodologies - Compare button, dropdown trigger hover',
        'PortfolioCard - Featured badge, decorative dots',
      ],
      prefix: 'brand',
      shades: [
        { shade: '50', usage: 'Lightest - Backgrounds, subtle highlights' },
        { shade: '100', usage: 'Light - Hover backgrounds' },
        { shade: '200', usage: 'Medium-light - Borders' },
        { shade: '300', usage: 'Medium - Secondary accents' },
        { shade: '400', usage: 'Medium-dark - Active states' },
        { shade: '500', usage: 'Base - Primary buttons, main accents' },
        { shade: '600', usage: 'Dark - Hover states, primary text' },
        { shade: '700', usage: 'Darker - Active buttons' },
        { shade: '800', usage: 'Very dark - Dark mode accents' },
        { shade: '900', usage: 'Darkest - Dark mode backgrounds' },
      ],
    },
    {
      name: 'AI Purple',
      description: 'Used for AI/Learning category and related components',
      components: [
        'PortfolioSection - AI Learning/Exploration category icon',
        'PortfolioCard - Code button gradient (from-ai-400 to-design-400)',
        'Methodologies - Paradigm category badges',
        'TechStack - Learning source icon background',
      ],
      prefix: 'ai',
      shades: [
        { shade: '50', usage: 'Lightest - Backgrounds' },
        { shade: '100', usage: 'Light - Category badges background' },
        { shade: '200', usage: 'Medium-light - Borders' },
        { shade: '300', usage: 'Medium - Secondary accents' },
        { shade: '400', usage: 'Medium-dark - Gradients, icons' },
        { shade: '500', usage: 'Base - Category colors' },
        { shade: '600', usage: 'Dark - Icon colors' },
        { shade: '700', usage: 'Darker - Text on light backgrounds' },
        { shade: '800', usage: 'Very dark - Category badge text' },
        { shade: '900', usage: 'Darkest - Dark mode backgrounds' },
      ],
    },
    {
      name: 'Design Pink',
      description: 'Used for Frontend/UI/UX category and design elements',
      components: [
        'PortfolioSection - Frontend/UI/UX category icon',
        'PortfolioCard - Code button gradient (to-design-400)',
        'Methodologies - Design category badges',
      ],
      prefix: 'design',
      shades: [
        { shade: '50', usage: 'Lightest - Backgrounds' },
        { shade: '100', usage: 'Light - Category badges background' },
        { shade: '200', usage: 'Medium-light - Borders' },
        { shade: '300', usage: 'Medium - Secondary accents' },
        { shade: '400', usage: 'Medium-dark - Gradients' },
        { shade: '500', usage: 'Base - Category colors' },
        { shade: '600', usage: 'Dark - Icon colors' },
        { shade: '700', usage: 'Darker - Text on light backgrounds' },
        { shade: '800', usage: 'Very dark - Category badge text' },
        { shade: '900', usage: 'Darkest - Dark mode backgrounds' },
      ],
    },
    {
      name: 'Stack Blue',
      description: 'Used for Full Stack category and technical elements',
      components: [
        'PortfolioSection - Full Stack category icon',
        'PortfolioCard - Live button gradient (to-stack-400), team size icon, decorative dots',
        'Methodologies - Principle category badges',
        'TechStack - Experience icon background',
        'Footer - React tech indicator',
      ],
      prefix: 'stack',
      shades: [
        { shade: '50', usage: 'Lightest - Backgrounds' },
        { shade: '100', usage: 'Light - Category badges background' },
        { shade: '200', usage: 'Medium-light - Borders, team icon text' },
        { shade: '300', usage: 'Medium - Icon highlights' },
        { shade: '400', usage: 'Medium-dark - Gradients, animated indicators' },
        { shade: '500', usage: 'Base - Category colors' },
        { shade: '600', usage: 'Dark - Icon colors' },
        { shade: '700', usage: 'Darker - Text on light backgrounds' },
        { shade: '800', usage: 'Very dark - Category badge text' },
        { shade: '900', usage: 'Darkest - Dark mode backgrounds' },
      ],
    },
    {
      name: 'Fun Green',
      description: 'Used for Fun/Sandbox category and positive indicators',
      components: [
        'PortfolioSection - Fun/Sandbox category icon',
        'PortfolioCard - Live button gradient (from-fun-400), duration icon',
        'Methodologies - Process category badges, Low complexity indicators',
        'TechStack - Confidence level icon background',
        'Footer - Tailwind tech indicator',
      ],
      prefix: 'fun',
      shades: [
        { shade: '50', usage: 'Lightest - Backgrounds, Low indicators' },
        { shade: '100', usage: 'Light - Category badges background' },
        { shade: '200', usage: 'Medium-light - Borders, duration icon text' },
        { shade: '300', usage: 'Medium - Icon highlights' },
        { shade: '400', usage: 'Medium-dark - Gradients, animated indicators' },
        { shade: '500', usage: 'Base - Category colors' },
        { shade: '600', usage: 'Dark - Icon colors' },
        { shade: '700', usage: 'Darker - Text on light backgrounds, Low indicators' },
        { shade: '800', usage: 'Very dark - Category badge text' },
        { shade: '900', usage: 'Darkest - Dark mode backgrounds' },
      ],
    },
  ]

  const grayScale = {
    name: 'Gray Scale',
    description: 'Neutral colors used throughout the application',
    components: [
      'All Components - Text, backgrounds, borders',
      'ProfileDesc - Hero title (text-gray-500)',
      'TechStack - Card backgrounds (bg-gray-50 dark:bg-gray-800)',
      'Footer - Backgrounds, borders, text hierarchy',
      'PortfolioSection - Section titles (text-gray-700 dark:text-gray-400)',
    ],
    shades: [
      { shade: '50', usage: 'Lightest - Main backgrounds, card backgrounds' },
      { shade: '100', usage: 'Light - Hover backgrounds' },
      { shade: '200', usage: 'Medium-light - Borders, separators' },
      { shade: '300', usage: 'Medium - Secondary borders, disabled text' },
      { shade: '400', usage: 'Medium-dark - Tertiary text, placeholders' },
      { shade: '500', usage: 'Base - Section titles, body text' },
      { shade: '600', usage: 'Dark - Secondary text' },
      { shade: '700', usage: 'Darker - Primary text, headings' },
      { shade: '800', usage: 'Very dark - Dark mode text, card backgrounds' },
      { shade: '900', usage: 'Darkest - Dark mode backgrounds' },
    ],
  }

  return (
    <div className='min-h-screen p-8 bg-gray-50 dark:bg-gray-900'>
      <div className='max-w-7xl mx-auto space-y-12'>
        {/* Header */}
        <div className='flex items-center gap-4 mb-8'>
          <Link
            href='/'
            className='flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-brand-600 dark:hover:text-brand-400 transition-colors'
          >
            <ArrowLeft className='h-5 w-5' />
            <span>Back to Home</span>
          </Link>
        </div>

        <div className='space-y-4'>
          <h1 className='text-4xl sm:text-5xl font-bold text-gray-700 dark:text-gray-300'>
            Color System Reference
          </h1>
          <p className='text-lg text-gray-600 dark:text-gray-400 max-w-3xl'>
            Complete color palette and component usage guide for the portfolio project. All colors
            are defined in <code className='bg-gray-200 dark:bg-gray-800 px-2 py-1 rounded'>styles/globals.css</code> using
            Tailwind v4's <code className='bg-gray-200 dark:bg-gray-800 px-2 py-1 rounded'>@theme inline</code> directive.
          </p>
        </div>

        {/* Color Themes */}
        {colorThemes.map((theme, index) => (
          <section
            key={theme.prefix}
            className='bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-200 dark:border-gray-700'
          >
            <div className='mb-6'>
              <h2 className='text-3xl font-bold text-gray-700 dark:text-gray-300 mb-2'>
                {theme.name}
              </h2>
              <p className='text-gray-600 dark:text-gray-400 mb-4'>{theme.description}</p>
              <div className='space-y-2'>
                <h3 className='text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide'>
                  Used In:
                </h3>
                <ul className='space-y-1'>
                  {theme.components.map((component, idx) => (
                    <li
                      key={idx}
                      className='text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2'
                    >
                      <span className='w-1.5 h-1.5 rounded-full bg-brand-500 mt-1.5 flex-shrink-0'></span>
                      <span>{component}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4'>
              {theme.shades.map((swatch) => (
                <div key={swatch.shade} className='space-y-2'>
                  <div
                    className={`h-24 bg-${theme.prefix}-${swatch.shade} rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 transition-transform hover:scale-105`}
                  ></div>
                  <div className='space-y-1'>
                    <p
                      className={`text-sm font-semibold text-center text-${theme.prefix}-${swatch.shade}`}
                    >
                      {theme.prefix}-{swatch.shade}
                    </p>
                    <p className='text-xs text-gray-600 dark:text-gray-400 text-center leading-tight'>
                      {swatch.usage}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}

        {/* Gray Scale */}
        <section className='bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-200 dark:border-gray-700'>
          <div className='mb-6'>
            <h2 className='text-3xl font-bold text-gray-700 dark:text-gray-300 mb-2'>
              {grayScale.name}
            </h2>
            <p className='text-gray-600 dark:text-gray-400 mb-4'>{grayScale.description}</p>
            <div className='space-y-2'>
              <h3 className='text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide'>
                Used In:
              </h3>
              <ul className='space-y-1'>
                {grayScale.components.map((component, idx) => (
                  <li
                    key={idx}
                    className='text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2'
                  >
                    <span className='w-1.5 h-1.5 rounded-full bg-brand-500 mt-1.5 flex-shrink-0'></span>
                    <span>{component}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4'>
            {grayScale.shades.map((swatch) => (
              <div key={swatch.shade} className='space-y-2'>
                <div
                  className={`h-24 bg-gray-${swatch.shade} rounded-xl shadow-lg border border-gray-300 dark:border-gray-600 transition-transform hover:scale-105`}
                ></div>
                <div className='space-y-1'>
                  <p className='text-sm font-semibold text-center text-gray-700 dark:text-gray-300'>
                    gray-{swatch.shade}
                  </p>
                  <p className='text-xs text-gray-600 dark:text-gray-400 text-center leading-tight'>
                    {swatch.usage}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Common Gradients */}
        <section className='bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-200 dark:border-gray-700'>
          <h2 className='text-3xl font-bold text-gray-700 dark:text-gray-300 mb-6'>
            Common Gradients
          </h2>
          <div className='space-y-4'>
            <div className='space-y-2'>
              <div className='h-24 bg-gradient-to-r from-fun-400 to-stack-400 rounded-xl shadow-lg flex items-center justify-center'>
                <p className='text-white text-lg font-bold'>from-fun-400 to-stack-400</p>
              </div>
              <p className='text-sm text-gray-600 dark:text-gray-400'>
                Used in: PortfolioCard "Live" button hover
              </p>
            </div>
            <div className='space-y-2'>
              <div className='h-24 bg-gradient-to-r from-ai-400 to-design-400 rounded-xl shadow-lg flex items-center justify-center'>
                <p className='text-white text-lg font-bold'>from-ai-400 to-design-400</p>
              </div>
              <p className='text-sm text-gray-600 dark:text-gray-400'>
                Used in: PortfolioCard "Code" button hover
              </p>
            </div>
            <div className='space-y-2'>
              <div className='h-24 bg-gradient-to-r from-brand-500 to-stack-500 rounded-xl shadow-lg flex items-center justify-center'>
                <p className='text-white text-lg font-bold'>from-brand-500 to-stack-500</p>
              </div>
              <p className='text-sm text-gray-600 dark:text-gray-400'>
                Used in: General brand gradients
              </p>
            </div>
          </div>
        </section>

        {/* Interactive Examples */}
        <section className='bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-200 dark:border-gray-700'>
          <h2 className='text-3xl font-bold text-gray-700 dark:text-gray-300 mb-6'>
            Interactive Examples
          </h2>
          <div className='flex flex-wrap gap-4'>
            <button className='bg-brand-500 hover:bg-brand-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105'>
              Brand Button
            </button>
            <button className='bg-ai-500 hover:bg-ai-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105'>
              AI Button
            </button>
            <button className='bg-design-500 hover:bg-design-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105'>
              Design Button
            </button>
            <button className='bg-stack-500 hover:bg-stack-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105'>
              Stack Button
            </button>
            <button className='bg-fun-500 hover:bg-fun-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105'>
              Fun Button
            </button>
          </div>
        </section>

        {/* Summary Stats */}
        <section className='bg-gradient-to-br from-brand-500 to-stack-500 rounded-2xl p-6 sm:p-8 shadow-xl text-white'>
          <h2 className='text-3xl font-bold mb-4'>Color System Summary</h2>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
            <div className='bg-white/10 backdrop-blur-sm rounded-xl p-4'>
              <p className='text-4xl font-bold mb-2'>5</p>
              <p className='text-sm opacity-90'>Color Themes</p>
            </div>
            <div className='bg-white/10 backdrop-blur-sm rounded-xl p-4'>
              <p className='text-4xl font-bold mb-2'>60</p>
              <p className='text-sm opacity-90'>Total Color Shades</p>
            </div>
            <div className='bg-white/10 backdrop-blur-sm rounded-xl p-4'>
              <p className='text-4xl font-bold mb-2'>15+</p>
              <p className='text-sm opacity-90'>Components Using System</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default ColorTest
