import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeftIcon, ChevronRightIcon, UploadIcon } from 'lucide-react'

interface SwingUploadStepProps {
  onComplete: () => void;
  onBack: () => void;
}

const SwingUploadStep: React.FC<SwingUploadStepProps> = ({ onComplete, onBack }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    setIsUploading(true);
    // Simulate upload
    setTimeout(() => {
      setIsUploading(false);
    }, 2000);
  };
  
  const handleFileSelect = () => {
    setIsUploading(true);
    // Simulate upload
    setTimeout(() => {
      setIsUploading(false);
    }, 2000);
  };
  
  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-800 mb-2">
        UPLOAD YOUR FIRST SWING
      </h2>
      <p className="text-gray-600 mb-6">
        Get started with swing analysis or skip for now
      </p>
      <div className="relative">
        {/* Background video loop */}
        <div className="absolute inset-0 overflow-hidden rounded-lg opacity-20">
          <video
            autoPlay
            loop
            muted
            className="w-full h-full object-cover"
            style={{
              filter: 'blur(5px)',
            }}
          >
            <source
              src="https://player.vimeo.com/external/436572488.sd.mp4?s=ebc11572e9d4a93f18c7c0ef44503a4c2d2ebe3f&profile_id=164&oauth2_token_id=57447761"
              type="video/mp4"
            />
          </video>
        </div>
        <motion.div
          className={`relative border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center min-h-[200px] bg-gradient-to-b from-green-800/10 to-green-600/10 ${isDragging ? 'border-green-500' : 'border-gray-300'}`}
          animate={{
            borderColor: isDragging ? '#16a34a' : '#d1d5db',
            backgroundColor: isDragging
              ? 'rgba(22, 163, 74, 0.05)'
              : 'rgba(22, 163, 74, 0.02)',
          }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {isUploading ? (
            <motion.div
              className="text-center"
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
            >
              <motion.div
                className="w-16 h-16 border-4 border-gray-300 border-t-green-600 rounded-full mx-auto mb-4"
                animate={{
                  rotate: 360,
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              />
              <p className="text-green-800 font-medium">
                Uploading your swing...
              </p>
            </motion.div>
          ) : (
            <>
              <motion.div
                className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4"
                whileHover={{
                  scale: 1.1,
                  backgroundColor: 'rgba(22, 163, 74, 0.2)',
                }}
              >
                <UploadIcon className="h-8 w-8 text-green-700" />
              </motion.div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">
                Upload Swing Video
              </h3>
              <p className="text-sm text-gray-500 text-center mb-4">
                Drop your swing video here or click to browse
              </p>
              <motion.button
                onClick={handleFileSelect}
                className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md"
                whileHover={{
                  scale: 1.05,
                  backgroundColor: '#f9fafb',
                }}
                whileTap={{
                  scale: 0.95,
                }}
              >
                Choose File
              </motion.button>
            </>
          )}
        </motion.div>
      </div>
      <div className="mt-6 text-center">
        <motion.button
          onClick={() => onComplete()}
          className="text-gray-500 hover:text-gray-700 text-sm"
          whileHover={{
            scale: 1.05,
          }}
        >
          Skip for now
        </motion.button>
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
          onClick={onComplete}
          className="flex items-center bg-green-800 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium group"
          whileHover={{
            scale: 1.03,
            backgroundColor: '#ca8a04',
            transition: {
              duration: 0.3,
            },
          }}
          whileTap={{
            scale: 0.97,
          }}
        >
          Complete Setup
          <motion.span
            className="ml-2"
            animate={{
              x: [0, 5, 0],
            }}
            transition={{
              repeat: Infinity,
              duration: 1.5,
            }}
          >
            <ChevronRightIcon className="h-5 w-5" />
          </motion.span>
        </motion.button>
      </div>
    </div>
  );
};

export default SwingUploadStep;
