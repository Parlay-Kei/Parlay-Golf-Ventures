import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeftIcon, ChevronRightIcon, UserIcon } from 'lucide-react'

interface AvatarStepProps {
  selectedAvatar: number | null;
  setSelectedAvatar: (id: number) => void;
  onNext: () => void;
  onBack: () => void;
}

const AvatarStep: React.FC<AvatarStepProps> = ({ 
  selectedAvatar, 
  setSelectedAvatar, 
  onNext, 
  onBack 
}) => {
  const avatars = [
    {
      id: 1,
      image: 'https://i.imgur.com/KtJeVt4.png',
      name: 'Pro',
    },
    {
      id: 2,
      image: 'https://i.imgur.com/7Iggt9J.png',
      name: 'Casual',
    },
    {
      id: 3,
      image: 'https://i.imgur.com/p7wu6EX.png',
      name: 'Vintage',
    },
    {
      id: 4,
      image: 'https://i.imgur.com/9HKgrGJ.png',
      name: 'Street',
    },
    {
      id: 5,
      image: 'https://i.imgur.com/3wVcZTY.png',
      name: 'Classic',
    },
    {
      id: 6,
      image: 'https://i.imgur.com/6YLsM0T.png',
      name: 'Modern',
    },
  ];
  
  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-800 mb-2">
        SELECT YOUR AVATAR
      </h2>
      <p className="text-gray-600 mb-6">
        Choose an avatar to represent you in the community
      </p>
      <div className="grid grid-cols-3 gap-4 mb-6">
        {avatars.map((avatar) => (
          <motion.div
            key={avatar.id}
            className={`relative aspect-square border-2 rounded-lg cursor-pointer overflow-hidden ${selectedAvatar === avatar.id ? 'border-green-600' : 'border-gray-200'}`}
            whileHover={{
              scale: 1.05,
            }}
            whileTap={{
              scale: 0.95,
            }}
            onClick={() => setSelectedAvatar(avatar.id)}
          >
            <img
              src={avatar.image}
              alt={`Avatar ${avatar.name}`}
              className="w-full h-full object-cover"
            />
            {selectedAvatar === avatar.id && (
              <motion.div
                className="absolute inset-0 bg-green-600 bg-opacity-30 flex items-center justify-center"
                initial={{
                  opacity: 0,
                }}
                animate={{
                  opacity: 1,
                }}
              >
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.7, 1, 0.7],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 2,
                  }}
                  className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center"
                >
                  <UserIcon className="h-6 w-6 text-white" />
                </motion.div>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
      {selectedAvatar && (
        <motion.div
          className="mb-6 p-4 bg-gray-100 rounded-lg flex items-center space-x-4"
          initial={{
            height: 0,
            opacity: 0,
          }}
          animate={{
            height: 'auto',
            opacity: 1,
          }}
        >
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-green-600">
            <img
              src={avatars.find((a) => a.id === selectedAvatar)?.image}
              alt="Selected avatar"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <p className="font-medium">Preview Badge</p>
            <p className="text-sm text-gray-500">
              This is how you'll appear in the PGV community
            </p>
          </div>
        </motion.div>
      )}
      <div className="mt-8 flex justify-between">
        <motion.button
          onClick={onBack}
          className="flex items-center bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2 rounded-lg font-medium"
          whileHover={{
            scale: 1.03,
          }}
          whileTap={{
            scale: 0.97,
          }}
        >
          <ChevronLeftIcon className="mr-2 h-5 w-5" /> Back
        </motion.button>
        <motion.button
          onClick={onNext}
          className="flex items-center bg-green-800 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium"
          whileHover={{
            scale: 1.03,
          }}
          whileTap={{
            scale: 0.97,
          }}
          disabled={!selectedAvatar}
        >
          Next <ChevronRightIcon className="ml-2 h-5 w-5" />
        </motion.button>
      </div>
    </div>
  );
};

export default AvatarStep;
