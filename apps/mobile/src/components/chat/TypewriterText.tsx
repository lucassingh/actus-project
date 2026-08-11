/**
 * Componente de texto con efecto de máquina de escribir
 */
import React, { useEffect, useState } from 'react';
import { Text, TextProps, useTheme } from 'react-native-paper';

interface TypewriterTextProps extends Omit<TextProps, 'children'> {
  text: string;
  speed?: number; // Milisegundos entre caracteres
  onComplete?: () => void;
}

export const TypewriterText: React.FC<TypewriterTextProps> = ({
  text,
  speed = 30,
  onComplete,
  ...textProps
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!text) {
      setDisplayedText('');
      setIsComplete(false);
      return;
    }

    setDisplayedText('');
    setIsComplete(false);

    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < text.length) {
        setDisplayedText(text.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        clearInterval(interval);
        setIsComplete(true);
        if (onComplete) {
          onComplete();
        }
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed, onComplete]);

  return <Text {...textProps}>{displayedText}</Text>;
};


