'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface PropertyDescriptionProps {
  description: string;
}

export default function PropertyDescription({ description }: PropertyDescriptionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isClamped, setIsClamped] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (textRef.current) {
      // Check if text exceeds 3 lines
      setIsClamped(textRef.current.scrollHeight > textRef.current.clientHeight);
    }
  }, [description]);

  return (
    <>
      <div className="max-w-[800px]">
        <p 
          ref={textRef}
          className={`text-[16px] text-gray-700 leading-[1.7] font-light mb-4 whitespace-pre-line line-clamp-3`}
        >
          {description}
        </p>
        
        {isClamped && (
          <button 
            onClick={() => setIsExpanded(true)}
            className="flex items-center gap-1 font-semibold text-brand-coral text-[15px] hover:underline"
          >
            Read full description
          </button>
        )}
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-white overflow-y-auto"
          >
            <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex items-center">
              <button 
                onClick={() => setIsExpanded(false)}
                className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors mr-4"
              >
                <X size={24} />
              </button>
            </div>

            <div className="max-w-200 mx-auto px-6 py-10">
              <h2 className="text-[32px] font-bold text-brand-navy mb-10">
                About the hotel
              </h2>
              
              <div className="text-[16px] text-gray-700 leading-[1.8] font-light whitespace-pre-line">
                {description}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
