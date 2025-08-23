import React from 'react'

interface FormProps {
  errors: string[]
  submit: () => void
  submitButtonText: string
  elements: () => React.ReactNode
}

const Form: React.FC<FormProps> = ({ errors, submit, submitButtonText, elements }) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    submit()
  }

  return (
    <form onSubmit={handleSubmit}>
      {errors.length > 0 && (
        <div className='validation--errors'>
          <h3>Validation Errors</h3>
          <ul>
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}
      {elements()}
      <button className='button' type='submit'>
        {submitButtonText}
      </button>
    </form>
  )
}

export default Form
