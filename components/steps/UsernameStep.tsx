import React, { useState } from 'react'
import Button from '../Button'
import Input from '../Input'
// import PGVLogo from '../PGVLogo' // Uncomment if you have a logo SVG/component

interface UsernameStepProps {
  onNext: () => void
}
const UsernameStep: React.FC<UsernameStepProps> = ({ onNext }) => {
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim()) {
      setError('Username is required')
      return
    }
    if (username.length < 3) {
      setError('Username must be at least 3 characters')
      return
    }
    onNext()
  }
  return (
    <form onSubmit={handleSubmit} className="animate-fade-in-slide">
      {/* <div className="flex justify-center mb-4"><PGVLogo width={32} /></div> */}
      <h1 className="font-['Playfair_Display'] text-[24px] font-bold uppercase mb-1 text-[#1D1F1D] tracking-wide text-center">
        WELCOME TO PGV
      </h1>
      <p className="text-[14px] font-normal font-['Inter'] text-[#1D1F1D] mb-6 text-center">
        Your journey starts here.
      </p>
      <div className="mb-4 text-center">
        <span className="text-[13px] font-medium uppercase text-[#1D1F1D] tracking-wide">
          Step 1 of 4 — Choose your crew handle
        </span>
      </div>
      {/* Avatar shadow placeholder for next step */}
      <div className="flex justify-center mb-4">
        <div className="w-16 h-16 rounded-full bg-[#E9DCC9] shadow-inner flex items-center justify-center opacity-60"></div>
      </div>
      <Input
        id="username"
        label="Username"
        placeholder="@yourhandle"
        value={username}
        onChange={(e) => {
          setUsername(e.target.value)
          setError('')
        }}
        hint="This is how the community will know you."
        error={error}
      />
      <div className="mt-8 flex justify-end">
        <Button type="submit">Next &rarr;</Button>
      </div>
    </form>
  )
}
export default UsernameStep

/* Add this to your global CSS or Tailwind config:
.animate-fade-in-slide {
  @apply opacity-0 translate-y-6;
  animation: fadeInSlide 0.5s cubic-bezier(0.4,0,0.2,1) forwards;
}
@keyframes fadeInSlide {
  to {
    opacity: 1;
    transform: none;
  }
}
*/ 