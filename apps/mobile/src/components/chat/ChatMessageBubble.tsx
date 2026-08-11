import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Image, Animated } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ChatMessage } from '../../services/chat.service';
import { TypewriterText } from './TypewriterText';

interface ChatMessageBubbleProps {
  message: ChatMessage;
  useTypewriter?: boolean;
}

const formatDuration = (millis: number): string => {
  const seconds = Math.floor(millis / 1000);
  if (seconds < 60) {
    return `${seconds}s`;
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
};

export const ChatMessageBubble: React.FC<ChatMessageBubbleProps> = ({ 
  message, 
  useTypewriter = false 
}) => {
  const theme = useTheme();
  const isUser = message.role === 'user';
  const shouldUseTypewriter = useTypewriter && !isUser && message.type === 'text' && message.isNewMessage !== false;
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.container,
        isUser ? styles.userContainer : styles.assistantContainer,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <View
        style={[
          styles.bubble,
          {
            backgroundColor: isUser ? theme.colors.primary : '#FFFFFF',
            borderWidth: isUser ? 0 : 1,
            borderColor: isUser ? 'transparent' : 'rgba(226, 232, 240, 0.8)',
          },
        ]}
      >
        {/* Contenido del mensaje */}
        <View style={styles.contentContainer}>
          {message.type === 'image' && message.content && (
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: message.content }}
                style={styles.image}
                resizeMode="cover"
              />
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.1)']}
                style={styles.imageOverlay}
              />
            </View>
          )}
          
          {message.type === 'audio' && (
            <View style={styles.audioContainer}>
              <LinearGradient
                colors={isUser 
                  ? ['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']
                  : ['rgba(255,255,255,0.9)', 'rgba(248,250,252,0.95)']
                }
                style={styles.audioGradient}
              >
                <View style={styles.audioIconContainer}>
                  <View style={[
                    styles.audioIcon,
                    {
                      backgroundColor: isUser 
                        ? 'rgba(255, 255, 255, 0.25)'
                        : '#3B82F6',
                    },
                  ]}>
                    <MaterialCommunityIcons
                      name="microphone"
                      size={20}
                      color={isUser ? '#FFFFFF' : '#FFFFFF'}
                    />
                  </View>
                </View>
                <View style={styles.audioInfo}>
                  {message.transcription && (
                    <Text
                      variant="bodyMedium"
                      style={[
                        styles.transcription,
                        {
                          color: isUser ? '#FFFFFF' : '#1E293B',
                        },
                      ]}
                    >
                      {message.transcription}
                    </Text>
                  )}
                  {message.duration !== undefined && message.duration !== null && message.duration > 0 && (
                    <Text
                      variant="labelSmall"
                      style={[
                        styles.duration,
                        {
                          color: isUser ? 'rgba(255,255,255,0.8)' : '#64748B',
                          opacity: 0.8,
                        },
                      ]}
                    >
                      {formatDuration(message.duration)}
                    </Text>
                  )}
                </View>
                <Ionicons
                  name="play-circle"
                  size={24}
                  color={isUser ? '#FFFFFF' : '#3B82F6'}
                  style={styles.playIcon}
                />
              </LinearGradient>
            </View>
          )}

          {message.type === 'text' && (
            shouldUseTypewriter ? (
              <TypewriterText
                text={message.content}
                variant="bodyMedium"
                speed={20}
                style={[
                  styles.text,
                  {
                    color: isUser ? '#FFFFFF' : theme.colors.onSurface,
                  },
                ]}
              />
            ) : (
              <Text
                variant="bodyMedium"
                style={[
                  styles.text,
                  {
                    color: isUser ? '#FFFFFF' : theme.colors.onSurface,
                  },
                ]}
              >
                {message.content}
              </Text>
            )
          )}
        </View>

        {/* Timestamp */}
        <View style={styles.timestampContainer}>
          <Text
            style={[
              styles.timestamp,
              {
                color: isUser
                  ? 'rgba(255,255,255,0.7)'
                  : 'rgba(100, 116, 139, 0.6)',
              },
            ]}
          >
            {new Date(message.timestamp).toLocaleTimeString('es-ES', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
          {isUser && (
            <View style={styles.deliveryStatus}>
              <Ionicons
                name="checkmark-done"
                size={14}
                color="rgba(255,255,255,0.7)"
              />
            </View>
          )}
        </View>
      </View>

      {/* Badge de remitente */}
      {message.role === 'assistant' && (
        <View style={styles.assistantBadge}>
          <Ionicons name="sparkles" size={12} color="#F59E0B" />
          <Text style={styles.assistantBadgeText}>Asistente</Text>
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    paddingHorizontal: 20,
  },
  userContainer: {
    alignItems: 'flex-end',
  },
  assistantContainer: {
    alignItems: 'flex-start',
  },
  bubble: {
    maxWidth: '85%',
    padding: 16,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  contentContainer: {
    zIndex: 1,
  },
  text: {
    lineHeight: 24,
    fontSize: 15,
    letterSpacing: 0.2,
  },
  imageContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 8,
  },
  image: {
    width: 220,
    height: 220,
    borderRadius: 12,
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 12,
  },
  audioContainer: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  audioGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
  },
  audioIconContainer: {
    marginRight: 12,
  },
  audioIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(0, 0, 0, 0.2)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  audioInfo: {
    flex: 1,
  },
  transcription: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 4,
    fontWeight: '500',
  },
  duration: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  playIcon: {
    marginLeft: 8,
  },
  timestampContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  timestamp: {
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  deliveryStatus: {
    marginLeft: 6,
  },
  assistantBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    alignSelf: 'flex-start',
  },
  assistantBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#F59E0B',
    marginLeft: 4,
  },
});