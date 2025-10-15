
'use client';

import React, { useState, useRef, useEffect } from 'react';
import Keyboard from 'react-simple-keyboard';
import 'react-simple-keyboard/build/css/index.css';
import { useKeyboard } from './keyboard-provider';

export function VirtualKeyboard() {
  const [input, setInput] = useState('');
  const [layout, setLayout] = useState('default');
  const keyboard = useRef<any>();
  const [activeInput, setActiveInput] = useState<HTMLInputElement | HTMLTextAreaElement | null>(null);
  const { isKeyboardOpen, openKeyboard, closeKeyboard } = useKeyboard();

  useEffect(() => {
    const handleFocus = (event: FocusEvent) => {
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        const inputTarget = target as HTMLInputElement | HTMLTextAreaElement;
        
        // Don't show keyboard for certain input types that have their own native UI
        const nonTextualTypes = [
            'checkbox', 'radio', 'button', 'submit', 'reset', 'file', 
            'color', 'range', 'date', 'time', 'datetime-local', 'month', 'week'
        ];
        if (inputTarget.type && nonTextualTypes.includes(inputTarget.type)) {
            closeKeyboard();
            return;
        }
        
        setActiveInput(inputTarget);
        setInput(inputTarget.value);
        if (keyboard.current) {
          keyboard.current.setInput(inputTarget.value);
        }
        openKeyboard();
      }
    };

    const handleBlur = (event: FocusEvent) => {
      // Don't hide keyboard if we're clicking on the keyboard itself
      const relatedTarget = event.relatedTarget as HTMLElement;
      if (relatedTarget && relatedTarget.closest('.simple-keyboard')) {
        activeInput?.focus(); // Keep focus on the input
        return;
      }
       setActiveInput(null);
       closeKeyboard();
    };

    document.addEventListener('focusin', handleFocus);
    document.addEventListener('focusout', handleBlur);

    return () => {
      document.removeEventListener('focusin', handleFocus);
      document.removeEventListener('focusout', handleBlur);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeInput]);

  const onChange = (newInput: string) => {
    setInput(newInput);
    if (activeInput) {
      // This part ensures that state updates correctly for libraries like React Hook Form
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        'value'
      )?.set;
      nativeInputValueSetter?.call(activeInput, newInput);

      const event = new Event('input', { bubbles: true });
      activeInput.dispatchEvent(event);
    }
  };

  const onKeyPress = (button: string) => {
    if (button === '{shift}' || button === '{lock}') {
      setLayout(layout === 'default' ? 'shift' : 'default');
    }
    if(button === "{enter}") {
        closeKeyboard();
    }
  };

  if (!isKeyboardOpen) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-2">
      <Keyboard
        keyboardRef={(r: any) => (keyboard.current = r)}
        layoutName={layout}
        onChange={onChange}
        onKeyPress={onKeyPress}
        inputName={activeInput?.name}
      />
    </div>
  );
}
