import React from 'react'
import { motion } from 'framer-motion'
import { ChevronLeftIcon, ChevronRightIcon, UserIcon, UsersIcon } from 'lucide-react'

interface CrewStepProps {
  selectedCrew: number | null;
  setSelectedCrew: (id: number) => void;
  onNext: () => void;
  onBack: () => void;
}

const CrewStep: React.FC<CrewStepProps> = ({ 
  selectedCrew, 
  setSelectedCrew, 
  onNext, 
  onBack 
}) => {
  const crews = [
    {
      id: 1,
      name: 'BEGINNER CREW',
      description: 'Perfect for new golfers starting their journey',
      members: 45,
      topMembers: [
        'https://i.imgur.com/KtJeVt4.png',
        'https://i.imgur.com/7Iggt9J.png',
      ],
    },
    {
      id: 2,
      name: 'INTERMEDIATE CREW',
      description: 'For golfers looking to improve their game',
      members: 32,
      topMembers: [
        'https://i.imgur.com/p7wu6EX.png',
        'https://i.imgur.com/9HKgrGJ.png',
      ],
    },
    {
      id: 3,
      name: 'ADVANCED CREW',
      description: 'For experienced golfers pushing their limits',
      members: 28,
      topMembers: [
        'https://i.imgur.com/3wVcZTY.png',
        'https://i.imgur.com/KtJeVt4.png',
      ],
    },
    {
      id: 4,
      name: 'COMPETITIVE CREW',
      description: 'For tournament players and serious competitors',
      members: 19,
      topMembers: [
        'https://i.imgur.com/6YLsM0T.png',
        'https://i.imgur.com/3wVcZTY.png',
      ],
    },
    {
      id: 5,
      name: 'ELITE CREW',
      description: 'Invitation only for top performers',
      members: 7,
      inviteOnly: true,
      topMembers: ['https://i.imgur.com/p7wu6EX.png'],
    },
  ];
  
  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-800 mb-2">JOIN A CREW</h2>
      <p className="text-gray-600 mb-6">
        Connect with golfers at your skill level
      </p>
      <div className="space-y-4 max-h-[320px] overflow-y-auto pr-2">
        {crews.map((crew) => (
          <motion.div
            key={crew.id}
            className={`border rounded-lg p-4 cursor-pointer ${selectedCrew === crew.id ? 'border-green-600 bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}
            whileHover={{
              scale: 1.02,
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            }}
            whileTap={{
              scale: 0.98,
            }}
            onClick={() => !crew.inviteOnly && setSelectedCrew(crew.id)}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-gray-800">{crew.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{crew.description}</p>
                {crew.inviteOnly && (
                  <motion.div
                    className="mt-2 inline-block bg-gray-800 text-white text-xs px-2 py-1 rounded-full"
                    animate={{
                      backgroundColor: ['#1f2937', '#4b5563', '#1f2937'],
                      transition: {
                        duration: 2,
                        repeat: Infinity,
                      },
                    }}
                  >
                    Apply to Join
                  </motion.div>
                )}
              </div>
              <div className="flex items-center">
                <div className="flex -space-x-2 mr-2">
                  {crew.topMembers.map((member, index) => (
                    <div
                      key={index}
                      className="w-7 h-7 rounded-full border-2 border-white overflow-hidden"
                    >
                      <img
                        src={member}
                        alt="Crew member"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
                <div className="text-gray-500 text-sm flex items-center">
                  <UsersIcon className="h-4 w-4 mr-1" />
                  {crew.members}
                </div>
              </div>
            </div>
            {selectedCrew === crew.id && (
              <motion.div
                className="mt-3 pt-3 border-t border-green-200 text-sm text-green-700"
                initial={{
                  opacity: 0,
                  height: 0,
                }}
                animate={{
                  opacity: 1,
                  height: 'auto',
                }}
              >
                <div className="flex items-center">
                  <UserIcon className="h-4 w-4 mr-1" />
                  <span>You're joining this crew!</span>
                </div>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
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
          disabled={!selectedCrew}
        >
          Next <ChevronRightIcon className="ml-2 h-5 w-5" />
        </motion.button>
      </div>
    </div>
  );
};

export default CrewStep;
