import React, { useState, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput as RNTextInput, Keyboard, Animated, Platform } from 'react-native';
import { useTheme } from 'react-native-paper';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface ChatInputProps {
  onSendText: (text: string) => void;
  onSendAudio: () => void;
  onSendImage: () => void;
  disabled?: boolean;
  isRecording?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendText,
  onSendAudio,
  onSendImage,
  disabled = false,
  isRecording = false,
}) => {
  const theme = useTheme();
  const [text, setText] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<RNTextInput>(null);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handleSend = () => {
    if (text.trim() && !disabled) {
      onSendText(text.trim());
      setText('');
      Keyboard.dismiss();
      // Animación de envío
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  return (
    <LinearGradient
      colors={[theme.colors.secondary, theme.colors.primary]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.wrapper}
    >
      {/* Barra de acciones arriba alineada a la derecha */}
      <View style={styles.actionBarContainer}>
        <View style={styles.actionBar}>
          <TouchableOpacity
            style={[
              styles.actionBarButton,
              {
                backgroundColor: isRecording 
                  ? 'rgba(255, 255, 255, 0.3)' 
                  : 'rgba(255, 255, 255, 0.2)',
              },
            ]}
            onPress={onSendAudio}
            disabled={disabled}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons
              name={isRecording ? 'microphone' : 'microphone-outline'}
              size={22}
              color="#FFFFFF"
            />
            {isRecording && (
              <View style={styles.recordingIndicator} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionBarButton,
              {
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
              },
            ]}
            onPress={onSendImage}
            disabled={disabled}
            activeOpacity={0.8}
          >
            <Ionicons
              name="camera-outline"
              size={22}
              color="#FFFFFF"
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Input premium como estaba antes */}
      <View style={styles.container}>
        <Animated.View
          style={[
            styles.inputWrapper,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View
            style={[
              styles.inputContainer,
              {
                backgroundColor: '#FFFFFF',
                borderColor: isFocused ? theme.colors.primary : 'rgba(255, 255, 255, 0.3)',
                borderWidth: isFocused ? 2 : 1,
                shadowColor: isFocused ? theme.colors.primary : 'rgba(0, 0, 0, 0.1)',
                shadowOpacity: isFocused ? 0.15 : 0.08,
              },
            ]}
          >
            <RNTextInput
              ref={inputRef}
              style={[
                styles.input,
                {
                  color: theme.colors.onSurface,
                },
              ]}
              value={text}
              onChangeText={setText}
              placeholder="Escribe tu mensaje..."
              placeholderTextColor="rgba(0, 0, 0, 0.4)"
              multiline
              maxLength={500}
              editable={!disabled}
              onFocus={handleFocus}
              onBlur={handleBlur}
            />

            {/* Botón de envío premium como estaba */}
            {text.trim() && (
              <Animated.View
                style={{
                  opacity: text.trim() ? 1 : 0,
                  transform: [{ scale: text.trim() ? 1 : 0.8 }],
                }}
              >
                <TouchableOpacity
                  onPress={handleSend}
                  disabled={disabled}
                  style={styles.sendButton}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={disabled 
                      ? ['#E0E0E0', '#BDBDBD']
                      : [theme.colors.primary, theme.colors.secondary]
                    }
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.sendButtonGradient}
                  >
                    <Ionicons
                      name="send"
                      size={18}
                      color="#FFFFFF"
                    />
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>
            )}
          </View>
        </Animated.View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    paddingTop: 8,
  },
  actionBarContainer: {
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 8,
  },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  actionBarButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(0, 0, 0, 0.2)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  recordingIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF5252',
  },
  container: {
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: Platform.OS === 'ios' ? 14 : 12,
    minHeight: 56,
    maxHeight: 120,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 4,
  },
  input: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
    maxHeight: 96,
    paddingVertical: 0,
    paddingRight: 12,
    paddingLeft: 0,
  },
  sendButton: {
    marginLeft: 8,
  },
  sendButtonGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(0, 0, 0, 0.3)',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
});