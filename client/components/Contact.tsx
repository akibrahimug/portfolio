import React, { useState } from 'react'
import { GoogleLogo, TwitterLogo, LinkedinLogo } from '@phosphor-icons/react'
import SocialMedia from './SocialMedia'
import { useCreateMessage } from '@/hooks/useHttpApi'

interface ContactData {
  name: string
  message: string
  company: string
  email: string
}

const Contact: React.FC = () => {
  const createMessage = useCreateMessage()

  // get the data from the form
  const [data, setData] = useState<ContactData>({
    name: '',
    message: '',
    company: '',
    email: '',
  })

  // create change handler
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setData((prev) => ({ ...prev, [name]: value }))
  }

  // create feedback message
  const [feedback, setFeedback] = useState<string>('')

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    try {
      const result = await createMessage.mutate({
        name: data.name,
        email: data.email,
        message: data.message,
      })

      if (result) {
        setFeedback('Message sent successfully!')
        // Reset form
        setData({ name: '', message: '', company: '', email: '' })
      } else {
        setFeedback('Failed to send message. Please try again.')
      }
    } catch (err) {
      console.error('Error sending message:', err)
      setFeedback('Failed to send message. Please try again.')
    }
  }

  return (
    <>
      {feedback ? (
        <div className='h-[200px]'>
          <h1 className='text-2xl text-center text-red-400 mt-20'>{feedback}</h1>
        </div>
      ) : (
        <></>
      )}
      <div className={`flex justify-center ${feedback ? 'hidden' : 'visible'}`}>
        <form
          onSubmit={submit}
          className='p-5 border m-auto sm:m-4 mt-4 mb-4 rounded-2xl shadow-md max-w-[350px]'
        >
          <h3 className='mb-4 text-center font-medium'>Send me a Message</h3>

          <div className='flex flex-col w-[300px]'>
            <input
              type='text'
              className='w-full border p-2 rounded-md placeholder:p-2 outline-none'
              placeholder='Name'
              id='name'
              name='name'
              onChange={handleChange}
            />
            <input
              type='text'
              className='w-full border mt-4 p-2 rounded-md placeholder:p-2 outline-none'
              placeholder='Company'
              id='company'
              name='company'
              onChange={handleChange}
            />
            <input
              type='text'
              className='w-full border mt-4 p-2 rounded-md placeholder:p-2 outline-none'
              placeholder='Email'
              onChange={handleChange}
              id='email'
              name='email'
            />
            <textarea
              maxLength={300}
              className='w-full border mt-4 rounded-md resize-none placeholder:p-2 outline-none'
              placeholder='Message(300-words Max)'
              onChange={handleChange}
              id='message'
              name='message'
            />
          </div>
          <button
            type='submit'
            disabled={createMessage.loading}
            className='text-gray-700 hover:text-white block rounded-md border p-2 mt-4 w-32 m-auto text-base hover:shadow-md active:scale-95 transition-all duration-100 hover:bg-red-500 text-center disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {createMessage.loading ? 'Sending...' : 'Send'}
          </button>
        </form>
        <div className='hidden sm:inline-block mt-4 border rounded-2xl mb-4 pb-4 shadow-md '>
          <h3 className='pt-5 ml-4 text-center font-medium'>If you prefer an alternative way.</h3>
          {/* email */}
          <SocialMedia
            link={'mailto: kasomaibrahim@gmail.com'}
            icon={<GoogleLogo size={24} />}
            text={'kasomaibrahim@gmail.com'}
          />
          {/* twitter */}
          <SocialMedia
            link={'https://twitter.com/Akibrahimug'}
            icon={<TwitterLogo size={24} />}
            text={'Twitter'}
          />
          {/* linked In */}
          <SocialMedia
            link={'https://www.linkedin.com/in/kasoma-ibrahim-89a732168/'}
            icon={<LinkedinLogo size={24} />}
            text={'LinkedIn'}
          />
          {/* Tel: number */}
        </div>
      </div>
    </>
  )
}

export default Contact
