import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronRightIcon } from 'lucide-react'

interface UsernameStepProps {
  onNext: () => void;
  username?: string;
  setUsername?: (value: string) => void;
}
const UsernameStep: React.FC<UsernameStepProps> = ({ 
  onNext, 
  username: externalUsername, 
  setUsername: externalSetUsername 
}) => {
  const [internalUsername, setInternalUsername] = useState('')
  const username = externalUsername !== undefined ? externalUsername : internalUsername;
  const setUsername = externalSetUsername || setInternalUsername;
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
  const [isAnimating, setIsAnimating] = useState(false);
  
  const handleNextClick = () => {
    if (!username.trim()) {
      setError('Username is required');
      return;
    }
    if (username.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }
    setIsAnimating(true);
    setTimeout(() => {
      setIsAnimating(false);
      onNext();
    }, 1000);
  };
  
  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-800 mb-2">
        PICK YOUR USERNAME
      </h2>
      <p className="text-gray-600 mb-6">
        Choose a unique username for your PGV profile
      </p>
      <form onSubmit={handleSubmit}>
        <label className="block text-gray-700 mb-2">Username</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <span className="text-green-700 font-semibold">@</span>
          </div>
          <motion.input
            type="text"
            value={username}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setUsername(e.target.value);
              setError('');
            }}
            className={`w-full py-3 pl-8 pr-3 border ${error ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none`}
            placeholder="golfmaster"
            whileFocus={{
              scale: 1.01,
              boxShadow: '0 0 0 2px rgba(22, 101, 52, 0.3)',
            }}
            transition={{
              type: 'spring',
              stiffness: 400,
              damping: 10,
            }}
          />
        </div>
        {error && (
          <p className="mt-2 text-sm text-red-600">{error}</p>
        )}
        {username && !error && (
          <motion.div
            className="mt-6 bg-gradient-to-r from-green-700 to-green-600 text-white p-4 rounded-lg shadow-md text-center"
            initial={{
              scale: 0.9,
              opacity: 0,
            }}
            animate={{
              scale: isAnimating ? [1, 1.05, 1] : 1,
              opacity: 1,
              y: isAnimating ? [0, -10, 0] : 0,
              rotateY: isAnimating ? [0, 180, 360] : 0,
            }}
            transition={{
              duration: 0.8,
            }}
          >
            <p className="text-sm opacity-80">YOUR PGV BADGE</p>
            <p className="text-xl font-bold">@{username}</p>
          </motion.div>
        )}
        <p className="mt-4 text-sm text-gray-500">
          This will be your display name in the community
        </p>
        <div className="mt-8 flex justify-end">
          <motion.button
            type="button"
            onClick={handleNextClick}
            className="flex items-center bg-green-800 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium"
            whileHover={{
              scale: 1.03,
            }}
            whileTap={{
              scale: 0.97,
            }}
            disabled={!username.trim()}
          >
            Next <ChevronRightIcon className="ml-2 h-5 w-5" />
          </motion.button>
        </div>
      </form>
    </div>
  );
}
export default UsernameStep
