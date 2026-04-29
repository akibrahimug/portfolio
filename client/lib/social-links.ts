export const socialLinks = {
  github: { href: 'https://github.com/akibrahimug', label: 'GitHub' },
  linkedin: {
    href: 'https://www.linkedin.com/in/kasoma-ibrahim-89a732168/',
    label: 'LinkedIn',
  },
  twitter: { href: 'https://twitter.com/Akibrahimug', label: 'Twitter' },
  email: {
    href: 'mailto:kasomaibrahim@gmail.com',
    address: 'kasomaibrahim@gmail.com',
    label: 'Email',
  },
} as const

export type SocialKey = keyof typeof socialLinks
