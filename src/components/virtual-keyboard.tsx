
'use client';

import React, { useState, useRef, useEffect } from 'react';
import Keyboard from 'react-simple-keyboard';
import { useKeyboard } from './keyboard-provider';

export function VirtualKeyboard() {
  const [input, setInput] = useState('');
  const [layout, setLayout] = useState('default');
  const keyboard = useRef<any>();
  const [activeInput, setActiveInput] = useState<HTMLInputElement | HTMLTextAreaElement | null>(null);
  const { isKeyboardOpen } = useKeyboard();

  useEffect(() => {
    const handleFocus = (event: FocusEvent) => {
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        const inputTarget = target as HTMLInputElement | HTMLTextAreaElement;
        
        // Don't show keyboard for certain input types
        const nonTextualTypes = ['checkbox', 'radio', 'button', 'submit', 'reset', 'file', 'color', 'range', 'date', 'time', 'datetime-local'];
        if (inputTarget.type && nonTextualTypes.includes(inputTarget.type)) {
            return;
        }
        
        setActiveInput(inputTarget);
        setInput(inputTarget.value);
        if (keyboard.current) {
          keyboard.current.setInput(inputTarget.value);
        }
      }
    };

    const handleBlur = (event: FocusEvent) => {
      // We don't want to clear the active input if the user is clicking on the keyboard
      const relatedTarget = event.relatedTarget as HTMLElement;
      if (relatedTarget && relatedTarget.closest('.simple-keyboard')) {
        return;
      }
       // setActiveInput(null);
    };

    document.addEventListener('focusin', handleFocus);
    document.addEventListener('focusout', handleBlur);

    return () => {
      document.removeEventListener('focusin', handleFocus);
      document.removeEventListener('focusout', handleBlur);
    };
  }, []);

  const onChange = (newInput: string) => {
    setInput(newInput);
    if (activeInput) {
      // Create and dispatch an input event to make React Hook Form aware of the change
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
