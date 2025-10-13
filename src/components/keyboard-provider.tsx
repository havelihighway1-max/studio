
'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { VirtualKeyboard } from './virtual-keyboard';

interface KeyboardContextType {
  isKeyboardOpen: boolean;
  toggleKeyboard: () => void;
  openKeyboard: () => void;
  closeKeyboard: () => void;
}

const KeyboardContext = createContext<KeyboardContextType | undefined>(undefined);

export function KeyboardProvider({ children }: { children: ReactNode }) {
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  const toggleKeyboard = () => {
    setIsKeyboardOpen(prev => !prev);
  };

  const openKeyboard = () => {
    setIsKeyboardOpen(true);
  };
  
  const closeKeyboard = () => {
      setIsKeyboardOpen(false);
  }

  return (
    <KeyboardContext.Provider value={{ isKeyboardOpen, toggleKeyboard, openKeyboard, closeKeyboard }}>
      {children}
      {isKeyboardOpen && <VirtualKeyboard />}
    </KeyboardContext.Provider>
  );
}

export const useKeyboard = (): KeyboardContextType => {
  const context = useContext(KeyboardContext);
  if (context === undefined) {
    throw new Error('useKeyboard must be used within a KeyboardProvider');
  }
  return context;
};
