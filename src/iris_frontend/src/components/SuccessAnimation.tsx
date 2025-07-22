import React, { useState, useEffect } from 'react';

const SuccessAnimation: React.FC = () => {
  const [showCheckmark, setShowCheckmark] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowCheckmark(true);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex justify-center items-center py-8">
      <div className="relative">
        <div className={`
          w-24 h-24 rounded-full border-4 border-green-200 
          ${showCheckmark ? 'animate-pulse' : ''}
          transition-all duration-500 ease-in-out
          ${showCheckmark ? 'bg-green-100' : 'bg-gray-100'}
        `}>
          <div className={`
            w-full h-full rounded-full flex items-center justify-center
            transition-all duration-700 ease-in-out transform
            ${showCheckmark ? 'bg-green-500 scale-100' : 'bg-gray-300 scale-75'}
          `}>
            <div className={`
              transition-all duration-500 ease-in-out
              ${showCheckmark ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}
            `}>
              <svg
                className="w-12 h-12 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                  className={`
                    ${showCheckmark ? 'animate-draw-check' : ''}
                  `}
                />
              </svg>
            </div>
          </div>
        </div>

        {showCheckmark && (
          <>
            <div className="absolute top-0 left-0 w-24 h-24 rounded-full border-2 border-green-300 animate-ping opacity-30"></div>
            <div className="absolute top-2 left-2 w-20 h-20 rounded-full border border-green-400 animate-ping opacity-20 animation-delay-200"></div>
          </>
        )}
      </div>

      <style>{`
        @keyframes draw-check {
          0% {
            stroke-dasharray: 0 20;
            stroke-dashoffset: 0;
          }
          100% {
            stroke-dasharray: 20 0;
            stroke-dashoffset: 0;
          }
        }

        .animate-draw-check {
          animation: draw-check 0.8s ease-in-out forwards;
        }

        .animation-delay-200 {
          animation-delay: 0.2s;
        }
      `}</style>
    </div>
  );
};

export default SuccessAnimation;