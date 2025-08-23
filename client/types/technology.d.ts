declare interface Technology {
  name: string
  icon: string
  color: string
}

declare module '@/lib/technologies.json' {
  const data: {
    techStack: Technology[]
  }
  export default data
}
