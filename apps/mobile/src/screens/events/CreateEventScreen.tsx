/**
 * Pantalla de crear evento con interfaz de chatbot
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Text, ActivityIndicator, useTheme, IconButton } from 'react-native-paper';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Header } from '../../components/common/Header';
import { ChatMessageBubble } from '../../components/chat/ChatMessageBubble';
import { ChatInput } from '../../components/chat/ChatInput';
import { TypingIndicator } from '../../components/chat/TypingIndicator';
import { BottomNavigation } from '../../components/navigation/BottomNavigation';
import { chatService } from '../../services/chat.service';
import { eventsService } from '../../services/events.service';
import { ChatMessage, EventStatus } from '../../types';

const STORAGE_KEY = '@create_event_conversation';

export default function CreateEventScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [eventId, setEventId] = useState<number | null>(null);
  const [eventStatus, setEventStatus] = useState<EventStatus>('DRAFT');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [botThinking, setBotThinking] = useState(false); // Estado para mostrar loader mientras el bot "piensa"
  const flatListRef = useRef<FlatList>(null);
  const [isRecording, setIsRecording] = useState(false);
  const audioRecorderRef = useRef<Audio.Recording | null>(null);

  // Cargar conversación guardada al montar
  useEffect(() => {
    requestPermissions();
  }, []);

  // Guardar conversación cuando cambia (pero no guardar si el evento está 'open')
  // El eventStatus se actualiza cuando recibimos respuesta del servidor

  // Limpiar recording al desmontar
  useEffect(() => {
    return () => {
      cleanupRecording();
    };
  }, []);

  // Cargar conversación cuando se enfoca la pantalla (solo una vez)
  useFocusEffect(
    React.useCallback(() => {
      let isMounted = true;
      
      const loadOnce = async () => {
        if (isMounted && messages.length === 0) {
          // Solo cargar si no hay mensajes ya cargados
          await loadConversation();
        }
      };
      
      loadOnce();
      
      return () => {
        isMounted = false;
      };
    }, [messages.length]) // Agregar dependencia para evitar loop infinito
  );

  useEffect(() => {
    // Scroll al final cuando hay nuevos mensajes
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const loadConversation = async () => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        const savedEventStatus = data.eventStatus || 'draft';
        const savedEventId = data.eventId;
        
        console.log('📦 Cargando conversación. Estado guardado:', savedEventStatus, 'EventId:', savedEventId);
        
        // Si hay un eventId guardado, verificar su estado real en el backend
        if (savedEventId) {
          try {
            const event = await eventsService.getEventById(savedEventId);
            console.log('📡 Estado real del evento en backend:', event.status);
            
            // Si el evento está 'resolved' o 'closed', limpiar e iniciar nueva conversación
            if (event.status === 'RESOLVED' || event.status === 'CLOSED') {
              console.log('🧹 Evento completado, limpiando e iniciando nueva conversación');
              await clearConversation();
              return;
            }
            
            // Si el evento está en 'draft', 'open' o 'in_progress', cargar la conversación
            // Estos son estados activos donde el usuario puede continuar trabajando
            if (event.status === 'DRAFT' || event.status === 'OPEN' || event.status === 'IN_PROGRESS') {
              console.log('✅ Evento en progreso, cargando conversación. Estado:', event.status);
              // Marcar todos los mensajes cargados como NO nuevos (no usar animación)
              const loadedMessages = (data.messages || []).map((msg: ChatMessage) => ({
                ...msg,
                isNewMessage: false, // NO usar animación para mensajes del historial
              }));
              setMessages(loadedMessages);
              setEventId(savedEventId);
              setEventStatus(event.status);
              return;
            }
          } catch (error: any) {
            // Si el evento no existe (404) o no se puede acceder, es esperado - limpiar silenciosamente
            if (error.response?.status === 404 || error.response?.statusCode === 404) {
              // Evento eliminado o no existe - limpiar y continuar (esperado)
              // Esto es normal cuando se crea un nuevo evento después de que uno anterior fue eliminado
              if (__DEV__) {
                console.log('ℹ️ Evento no encontrado (eliminado o no existe), limpiando conversación...');
              }
            } else {
              // Otro tipo de error - mostrar warning pero no bloquear
              console.warn('⚠️ Error verificando evento, limpiando e iniciando nueva conversación:', error.message || 'Error desconocido');
            }
            await clearConversation();
            return;
          }
        }
        
        // Si no hay eventId guardado, iniciar nueva conversación
        console.log('🆕 No hay eventId guardado, iniciando nueva conversación');
        addInitialMessage();
      } else {
        // No hay conversación guardada, iniciar nueva conversación
        console.log('🆕 No hay conversación guardada, iniciando nueva');
        addInitialMessage();
      }
    } catch (error) {
      console.error('❌ Error cargando conversación:', error);
      addInitialMessage();
    }
  };

  const saveConversation = async (eventStatus?: string) => {
    try {
      const statusToSave = eventStatus || 'DRAFT';

      console.log('💾 Guardando conversación. Estado:', statusToSave);

      // NO guardar si el evento está en estado 'resolved' o 'closed' (completado)
      // Pero SÍ guardar si está 'open' o 'in_progress' para permitir continuar la conversación
      if (statusToSave === 'RESOLVED' || statusToSave === 'CLOSED') {
        console.log('🧹 Evento completado, limpiando conversación');
        // Limpiar después de un delay para que el usuario vea el mensaje final
        setTimeout(async () => {
          await clearConversation();
        }, 5000);
        return;
      }
      
      // Guardar si está en 'draft', 'open' o 'in_progress' (permitir continuar conversación)
      console.log('✅ Guardando conversación');
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          messages,
          eventId,
          eventStatus: statusToSave,
          timestamp: new Date().toISOString(),
        })
      );
    } catch (error) {
      console.error('❌ Error guardando conversación:', error);
    }
  };

  const clearConversation = async () => {
    try {
      console.log('🧹 Limpiando conversación...');
      await AsyncStorage.removeItem(STORAGE_KEY);
      setMessages([]);
      setEventId(null);
      setEventStatus('DRAFT');
      addInitialMessage();
      console.log('✅ Conversación limpiada correctamente');
    } catch (error) {
      console.error('❌ Error limpiando conversación:', error);
    }
  };

  const requestPermissions = async () => {
    // Permisos de cámara
    const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
    if (cameraStatus.status !== 'granted') {
      Alert.alert(
        'Permisos necesarios',
        'Necesitamos acceso a la cámara para tomar fotografías.',
        [{ text: 'OK' }]
      );
    }
  };

  const addInitialMessage = () => {
    const initialMessage: ChatMessage = {
      role: 'assistant',
      content: '¡Hola! 👋 Soy tu asistente de mantenimiento industrial.\n\nPuedes contarme sobre el problema de varias formas:\n\n📝 **Texto**: Escribe directamente\n🎤 **Audio**: Graba un mensaje de voz\n📷 **Imagen**: Toma una foto del problema\n\n**Puedes darme toda la información de una vez**, por ejemplo:\n"Tengo un problema con el horno T-1000 en Planta 1 Sector A3. La temperatura bajó drásticamente. Es un incidente de prioridad alta."\n\nO **yo te iré preguntando** lo que falte. Cuando tengas toda la información, escribe **"finalizar"** o **"listo"** para crear el evento.\n\n¿Qué problema necesitas reportar?',
      type: 'text',
      timestamp: new Date().toISOString(),
      isNewMessage: false, // Mensaje inicial NO usa animación
    };
    setMessages([initialMessage]);
  };

  // Función auxiliar para detectar si el usuario confirma que la solución funcionó
  const _shouldSuggestResolve = (text: string): boolean => {
    const lowerText = text.toLowerCase();
    const resolveKeywords = [
      'funcionó', 'funciono', 'sirvió', 'sirvio', 'resuelto', 'resolví', 'solucionado', 'solucioné',
      'ya está', 'ya esta', 'listo', 'terminado', 'finalizado', 'completado', 'perfecto', 'bien',
      'me sirvió', 'me sirvio', 'la solución funcionó', 'la solucion funciono'
    ];
    return resolveKeywords.some(keyword => lowerText.includes(keyword));
  };

  // Función para detectar comando de resolver
  const _isResolveCommand = (text: string): boolean => {
    const lowerText = text.toLowerCase().trim();
    return lowerText === 'resolver' || 
           lowerText === 'marcar como resuelto' || 
           lowerText === 'resolver evento';
  };

  // Función para extraer solución del comando
  const _extractSolutionFromCommand = (text: string): string | null => {
    const lowerText = text.toLowerCase().trim();
    if (lowerText.startsWith('resolver:')) {
      return text.substring(9).trim(); // "resolver: " tiene 9 caracteres
    }
    if (lowerText.startsWith('resolver ')) {
      return text.substring(8).trim(); // "resolver " tiene 8 caracteres
    }
    return null;
  };

  // Función para resolver el evento
  const handleResolveEvent = async (solution: string) => {
    if (!eventId || resolving) return;

    setResolving(true);
    try {
      const resolvedEvent = await eventsService.updateEvent(eventId, { status: 'RESOLVED', solution });

      console.log('✅ Evento resuelto exitosamente:', resolvedEvent.id, 'Estado:', resolvedEvent.status);
      
      // Agregar mensaje del usuario con la solución
      const userMessage: ChatMessage = {
        role: 'user',
        content: solution,
        type: 'text',
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMessage]);

      // Agregar confirmación del bot
      const botMessage: ChatMessage = {
        role: 'assistant',
        content: `✅ Evento #${eventId} marcado como resuelto. El supervisor revisará tu solución y validará el evento.`,
        type: 'text',
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, botMessage]);

      setEventStatus('RESOLVED');
      
      // Limpiar conversación y navegar a lista de eventos después de 2 segundos
      setTimeout(async () => {
        console.log('🧹 Limpiando conversación y navegando a lista de eventos...');
        await clearConversation();
        navigation.navigate('EventsList');
      }, 2000);
    } catch (error: any) {
      console.error('❌ Error resolviendo evento:', error);
      
      // Manejar error de red específicamente
      if (error.message === 'Network Error' || !error.response) {
        Alert.alert(
          'Error de Conexión',
          'No se pudo conectar con el servidor. Verifica tu conexión a internet y que el servidor esté corriendo.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Error',
          error.response?.data?.detail || 'No se pudo resolver el evento'
        );
      }
    } finally {
      setResolving(false);
    }
  };

  const handleSendText = async (text: string) => {
    if (!text.trim() || sending || resolving) return;

    // Verificar si es un comando para resolver con solución incluida
    if (eventId && (eventStatus === 'OPEN' || eventStatus === 'IN_PROGRESS')) {
      const solution = _extractSolutionFromCommand(text);
      if (solution) {
        // El usuario escribió "resolver: [solución]"
        await handleResolveEvent(solution);
        return;
      }
      
      if (_isResolveCommand(text)) {
        // El usuario escribió solo "resolver", pedirle que escriba la solución
        const userMessage: ChatMessage = {
          role: 'user',
          content: text,
          type: 'text',
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, userMessage]);
        
        const botMessage: ChatMessage = {
          role: 'assistant',
          content: 'Para resolver el evento, necesito que describas la solución. Escribe: "resolver: [tu descripción de la solución]" o simplemente describe la solución en tu próximo mensaje.',
          type: 'text',
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, botMessage]);
        return;
      }
    }

    // Agregar mensaje del usuario inmediatamente
    const userMessage: ChatMessage = {
      role: 'user',
      content: text,
      type: 'text',
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setSending(true);
    setBotThinking(true); // Mostrar loader mientras el bot "piensa" (procesa con Whisper/BLIP-2/Ollama directamente)

    try {
      const response = await chatService.sendMessage(eventId, 'text', text);

      // Actualizar eventId si es nuevo
      if (!eventId && response.eventId) {
        setEventId(response.eventId);
      }

      // Guardar estado anterior para detectar cambios
      const previousStatus = eventStatus;

      // Actualizar estado del evento si el agente lo modificó
      const newStatus = response.eventUpdate?.status ?? eventStatus;
      setEventStatus(newStatus);

      // Ocultar loader antes de mostrar la respuesta
      setBotThinking(false);

      const botMessage: ChatMessage = {
        role: 'assistant',
        content: response.response,
        type: 'text',
        timestamp: new Date().toISOString(),
        isNewMessage: true,
      };
      setMessages((prev) => [...prev, botMessage]);

      await saveConversation(newStatus);

      if (previousStatus === 'DRAFT' && newStatus === 'OPEN') {
        console.log('✅ Evento creado exitosamente:', response.eventId);
      }

      if (newStatus === 'RESOLVED' && previousStatus !== 'RESOLVED') {
        console.log('✅ Evento resuelto. Navegando a lista de eventos...');
        setTimeout(async () => {
          await clearConversation();
          navigation.navigate('EventsList');
        }, 3000);
      }
    } catch (error: any) {
      console.error('Error enviando mensaje:', error);
      
      // Manejar error de red específicamente
      if (error.message === 'Network Error' || !error.response) {
        Alert.alert(
          'Error de Conexión',
          'No se pudo conectar con el servidor. Verifica tu conexión a internet y que el servidor esté corriendo.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Error',
          error.response?.data?.detail || 'Error al enviar el mensaje'
        );
      }
      
      // Remover mensaje del usuario si falló
      setMessages((prev) => prev.filter((m) => m !== userMessage));
    } finally {
      setSending(false);
      setBotThinking(false);
    }
  };

  const handleSendImage = async () => {
    try {
      // Verificar permisos
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permisos necesarios',
          'Necesitamos acceso a la cámara para tomar fotografías.'
        );
        return;
      }

      // Mostrar opciones
      Alert.alert(
        'Seleccionar imagen',
        '¿Cómo quieres obtener la imagen?',
        [
          {
            text: 'Cámara',
            onPress: async () => {
              try {
                console.log('Abriendo cámara...');
                const result = await ImagePicker.launchCameraAsync({
                  mediaTypes: ImagePicker.MediaTypeOptions.Images,
                  allowsEditing: true,
                  quality: 0.8,
                });

                console.log('Resultado cámara:', result);
                if (!result.canceled && result.assets && result.assets[0]) {
                  console.log('URI de imagen:', result.assets[0].uri);
                  await sendImage(result.assets[0].uri);
                } else {
                  console.log('Usuario canceló o no seleccionó imagen');
                }
              } catch (error: any) {
                console.error('Error en cámara:', error);
                Alert.alert('Error', 'No se pudo abrir la cámara');
              }
            },
          },
          {
            text: 'Galería',
            onPress: async () => {
              try {
                console.log('Abriendo galería...');
                const result = await ImagePicker.launchImageLibraryAsync({
                  mediaTypes: ImagePicker.MediaTypeOptions.Images,
                  allowsEditing: true,
                  quality: 0.8,
                });

                console.log('Resultado galería:', result);
                if (!result.canceled && result.assets && result.assets[0]) {
                  console.log('URI de imagen:', result.assets[0].uri);
                  await sendImage(result.assets[0].uri);
                } else {
                  console.log('Usuario canceló o no seleccionó imagen');
                }
              } catch (error: any) {
                console.error('Error en galería:', error);
                Alert.alert('Error', 'No se pudo abrir la galería');
              }
            },
          },
          { text: 'Cancelar', style: 'cancel' },
        ]
      );
    } catch (error: any) {
      console.error('Error seleccionando imagen:', error);
      Alert.alert('Error', 'No se pudo seleccionar la imagen');
    }
  };

  const sendImage = async (uri: string) => {
    setSending(true);
    setBotThinking(true);

    // Agregar mensaje del usuario con preview
    const userMessage: ChatMessage = {
      role: 'user',
      content: uri,
      type: 'image',
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const response = await chatService.sendMessage(eventId, 'image', null, uri);

      const previousStatus = eventStatus;

      if (!eventId && response.eventId) {
        setEventId(response.eventId);
      }

      const newStatus = response.eventUpdate?.status ?? eventStatus;
      setEventStatus(newStatus);

      setBotThinking(false);

      const botMessage: ChatMessage = {
        role: 'assistant',
        content: response.response,
        type: 'text',
        timestamp: new Date().toISOString(),
        isNewMessage: true,
      };
      setMessages((prev) => [...prev, botMessage]);

      await saveConversation(newStatus);

      if (previousStatus === 'DRAFT' && newStatus === 'OPEN') {
        console.log('✅ Evento creado exitosamente desde imagen:', response.eventId);
      }

      if (newStatus === 'RESOLVED' && previousStatus !== 'RESOLVED') {
        console.log('✅ Evento resuelto. Navegando a lista de eventos...');
        setTimeout(async () => {
          await clearConversation();
          navigation.navigate('EventsList');
        }, 3000);
      }
    } catch (error: any) {
      console.error('Error enviando imagen:', error);
      Alert.alert(
        'Error',
        error.response?.data?.detail || 'Error al enviar la imagen'
      );
      setMessages((prev) => prev.filter((m) => m !== userMessage));
    } finally {
      setSending(false);
    }
  };

  const cleanupRecording = async () => {
    if (audioRecorderRef.current) {
      try {
        const status = await audioRecorderRef.current.getStatusAsync();
        if (status.isRecording) {
          await audioRecorderRef.current.stopAndUnloadAsync();
        }
        audioRecorderRef.current = null;
        setIsRecording(false);
      } catch (error) {
        console.error('Error limpiando grabación:', error);
        audioRecorderRef.current = null;
        setIsRecording(false);
      }
    }
  };

  const handleSendAudio = async () => {
    try {
      if (isRecording) {
        // Detener grabación
        await stopRecording();
      } else {
        // Iniciar grabación
        await startRecording();
      }
    } catch (error: any) {
      console.error('Error con audio:', error);
      Alert.alert('Error', 'No se pudo acceder al micrófono');
    }
  };

  const startRecording = async () => {
    try {
      // Limpiar cualquier grabación previa
      await cleanupRecording();

      // Solicitar permisos
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Crear nueva grabación usando el constructor tradicional
      // Esto asegura que getURI() esté disponible después
      const recording = new Audio.Recording();
      
      // Preparar la grabación
      await recording.prepareToRecordAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      // Iniciar la grabación
      await recording.startAsync();

      audioRecorderRef.current = recording;
      setIsRecording(true);
      console.log('Grabación iniciada correctamente');
    } catch (error) {
      console.error('Error iniciando grabación:', error);
      Alert.alert('Error', 'No se pudo iniciar la grabación');
      await cleanupRecording();
    }
  };

  const stopRecording = async () => {
    console.log('stopRecording llamado, isRecording:', isRecording, 'recorder:', !!audioRecorderRef.current);
    
    if (!audioRecorderRef.current) {
      console.log('No hay recorder activo');
      setIsRecording(false);
      return;
    }

    setIsRecording(false);
    setSending(true);

    try {
      console.log('Deteniendo grabación...');
      
      const recording = audioRecorderRef.current;
      
      // Obtener duración antes de detener
      const statusBefore = await recording.getStatusAsync();
      const durationMillis = (statusBefore as any).durationMillis || 0;
      console.log('Duración de la grabación:', durationMillis, 'milisegundos');
      
      // Detener y descargar la grabación
      await recording.stopAndUnloadAsync();
      
      // Obtener el URI usando getURI() - esto debería funcionar con el constructor tradicional
      const finalUri = recording.getURI();
      console.log('URI obtenida de getURI():', finalUri);
      
      // Limpiar la referencia
      audioRecorderRef.current = null;
      
      if (finalUri) {
        console.log('URI final para enviar:', finalUri);
        await sendAudio(finalUri, durationMillis);
      } else {
        console.log('No se obtuvo URI del audio');
        Alert.alert('Error', 'No se pudo obtener el archivo de audio. Intenta grabar nuevamente.');
      }
    } catch (error: any) {
      console.error('Error deteniendo grabación:', error);
      Alert.alert('Error', `No se pudo detener la grabación: ${error.message || 'Error desconocido'}`);
    } finally {
      setSending(false);
      setIsRecording(false);
    }
  };

  const sendAudio = async (uri: string, durationMillis: number = 0) => {
    setSending(true);
    setBotThinking(true);

    const userMessage: ChatMessage = {
      role: 'user',
      content: uri,
      type: 'audio',
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const response = await chatService.sendMessage(eventId, 'audio', null, uri);

      const previousStatus = eventStatus;

      if (!eventId && response.eventId) {
        setEventId(response.eventId);
      }

      const newStatus = response.eventUpdate?.status ?? eventStatus;
      setEventStatus(newStatus);

      setBotThinking(false);

      const botMessage: ChatMessage = {
        role: 'assistant',
        content: response.response,
        type: 'text',
        timestamp: new Date().toISOString(),
        isNewMessage: true,
      };
      setMessages((prev) => [...prev, botMessage]);

      await saveConversation(newStatus);

      if (previousStatus === 'DRAFT' && newStatus === 'OPEN') {
        console.log('✅ Evento creado exitosamente desde audio:', response.eventId);
      }

      if (newStatus === 'RESOLVED' && previousStatus !== 'RESOLVED') {
        console.log('✅ Evento resuelto. Navegando a lista de eventos...');
        setTimeout(async () => {
          await clearConversation();
          navigation.navigate('EventsList');
        }, 3000);
      }
    } catch (error: any) {
      console.error('Error enviando audio:', error);
      
      // Manejar error de red específicamente
      if (error.message === 'Network Error' || !error.response) {
        Alert.alert(
          'Error de Conexión',
          'No se pudo conectar con el servidor. Verifica tu conexión a internet y que el servidor esté corriendo.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Error',
          error.response?.data?.detail || 'Error al enviar el audio'
        );
      }
      
      setMessages((prev) => prev.filter((m) => m !== userMessage));
    } finally {
      setSending(false);
    }
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    // Solo usar typewriter para mensajes nuevos (isNewMessage !== false)
    // Los mensajes del historial tienen isNewMessage: false
    return <ChatMessageBubble message={item} useTypewriter={item.isNewMessage !== false} />;
  };

  const getStatusSubtitle = () => {
    switch (eventStatus) {
      case 'DRAFT': return 'Describe el problema usando texto, audio o imagen';
      case 'OPEN': return 'Evento abierto - Puedes resolverlo cuando esté listo';
      case 'IN_PROGRESS': return 'Evento en progreso - Trabajando en la solución';
      case 'RESOLVED': return 'Evento resuelto - Esperando validación del supervisor';
      case 'CLOSED': return 'Evento cerrado - Validado por supervisor';
      default: return 'Describe el problema usando texto, audio o imagen';
    }
  };

  // Función para crear un nuevo evento (limpiar y empezar de cero)
  const handleCreateNewEvent = async () => {
    await clearConversation();
  };

  return (
    <View style={styles.container}>
      <Header 
        title={eventStatus === 'draft' ? 'Crear Evento' : `Evento #${eventId || 'N/A'}`} 
        subtitle={getStatusSubtitle()} 
      />
      
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : (
          <>
            {eventStatus === 'resolved' && (
              <View style={[styles.statusBanner, { backgroundColor: theme.colors.successContainer }]}>
                <Text variant="bodyMedium" style={{ color: theme.colors.onSuccessContainer }}>
                  ✅ Evento resuelto. Esperando validación del supervisor.
                </Text>
              </View>
            )}

            {/* Botón para crear nuevo evento ELIMINADO: No debe estar dentro del flujo de crear evento */}
            {/* Si el usuario quiere crear un nuevo evento, debe finalizar el actual primero */}
            {/* o navegar a la lista de eventos y crear desde ahí */}

            <FlatList
              ref={flatListRef}
              data={messages}
              renderItem={renderMessage}
              keyExtractor={(item, index) => `${item.role}-${item.timestamp}-${index}`}
              contentContainerStyle={styles.messagesContainer}
              onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
              keyboardShouldPersistTaps="handled"
              style={styles.messagesList}
            />

            {/* Indicador de que el bot está procesando (loader de tres puntos) */}
            {botThinking && <TypingIndicator visible={botThinking} />}

            {isRecording && (
              <View
                style={[
                  styles.recordingIndicator,
                  { backgroundColor: theme.colors.errorContainer },
                ]}
              >
                <View style={[styles.recordingDot, { backgroundColor: theme.colors.error }]} />
                <Text variant="bodyMedium" style={{ color: theme.colors.error }}>
                  Grabando... Toca el micrófono para detener
                </Text>
              </View>
            )}

            <ChatInput
              onSendText={handleSendText}
              onSendAudio={handleSendAudio}
              onSendImage={handleSendImage}
              disabled={sending}
              isRecording={isRecording}
            />
          </>
        )}
      </KeyboardAvoidingView>
      <BottomNavigation />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  statusBanner: {
    padding: 12,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  keyboardView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  messagesList: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  messagesContainer: {
    paddingVertical: 16,
    paddingBottom: 20,
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  newEventButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  newEventButton: {
    margin: 0,
  },
});
