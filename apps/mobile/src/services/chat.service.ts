import api from './api';
import * as FileSystem from 'expo-file-system';
import { AgentMessageResponse, MessageType } from '../types';

async function uriToBase64(uri: string): Promise<string> {
  return FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });
}

function getMimeType(uri: string, messageType: MessageType): string {
  if (messageType === 'audio') {
    if (uri.endsWith('.m4a')) return 'audio/m4a';
    if (uri.endsWith('.wav')) return 'audio/wav';
    if (uri.endsWith('.caf')) return 'audio/x-caf';
    return 'audio/mpeg';
  }
  if (messageType === 'image') {
    if (uri.endsWith('.png')) return 'image/png';
    if (uri.endsWith('.webp')) return 'image/webp';
    return 'image/jpeg';
  }
  return 'application/octet-stream';
}

class ChatService {
  async sendMessage(
    eventId: number | null,
    messageType: MessageType,
    content?: string | null,
    fileUri?: string | null
  ): Promise<AgentMessageResponse> {
    const body: Record<string, unknown> = { messageType };

    if (eventId !== null) body.eventId = eventId;
    if (content) body.content = content;

    if (fileUri) {
      const base64 = await uriToBase64(fileUri);
      const fileName = fileUri.split('/').pop() || `file.${messageType === 'audio' ? 'm4a' : 'jpg'}`;
      body.file = base64;
      body.fileName = fileName;
      body.fileMimeType = getMimeType(fileUri, messageType);
    }

    const response = await api.post<AgentMessageResponse>('/agent/message', body);
    return response.data;
  }
}

export const chatService = new ChatService();
