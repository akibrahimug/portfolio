import { redesignContent } from '@/lib/redesign-content'
import { Container } from '@/components/ui/Container'
import { TextLink } from '@/components/ui/TextLink'

export function Footer() {
  const { footer, contact } = redesignContent
  return (
    <footer className='closing border-t border-border'>
      <Container className='flex flex-col gap-4 py-10 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between'>
        <p>© {new Date().getFullYear()} Ibrahim Kasoma</p>
        <div className='flex items-center gap-6'>
          <TextLink href={`mailto:${contact.email}`}>Email</TextLink>
          <TextLink href={footer.repo} external>
            Source
          </TextLink>
        </div>
      </Container>
    </footer>
  )
}
