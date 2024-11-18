import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export const AnimatedButton: React.FC<ButtonProps> = ({ children, ...props }) => {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      {...props}
    >
      {children}
    </motion.button>
  );
};

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
}

export const AnimatedToast: React.FC<ToastProps> = ({ message, type = 'info' }) => {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        className={`rounded-lg p-4 shadow-lg ${
          type === 'success' ? 'bg-green-500' :
          type === 'error' ? 'bg-red-500' :
          'bg-blue-500'
        } text-white`}
      >
        {message}
      </motion.div>
    </AnimatePresence>
  );
};