import api from './api';
import { Event, EventSummary, EventStatus, EventType, Priority } from '../types';

interface CreateEventParams {
  title: string;
  description?: string;
  eventType: EventType;
  priority: Priority;
  machineName?: string;
  location?: string;
  problemContent?: string;
}

interface UpdateEventParams {
  title?: string;
  description?: string;
  status?: EventStatus;
  priority?: Priority;
  machineName?: string;
  location?: string;
  solution?: string;
}

interface EventListResponse {
  events: EventSummary[];
  total: number;
  limit: number;
  offset: number;
}

class EventsService {
  async getEvents(offset: number = 0, limit: number = 20, status?: string): Promise<{
    items: EventSummary[];
    total: number;
    has_more: boolean;
  }> {
    const params: Record<string, unknown> = { offset, limit };
    if (status) params.status = status;

    const response = await api.get<EventListResponse>('/events', { params, timeout: 10000 });
    const { events, total } = response.data;
    return {
      items: events,
      total,
      has_more: offset + events.length < total,
    };
  }

  async getLastOpenEvent(): Promise<EventSummary | null> {
    try {
      const open = await this.getEvents(0, 1, 'OPEN');
      if (open.items.length > 0) return open.items[0];
      const inProgress = await this.getEvents(0, 1, 'IN_PROGRESS');
      if (inProgress.items.length > 0) return inProgress.items[0];
      return null;
    } catch (error) {
      console.error('Error obteniendo último evento abierto:', error);
      return null;
    }
  }

  async getEventById(id: number): Promise<Event> {
    const response = await api.get<Event>(`/events/${id}`);
    return response.data;
  }

  async createEvent(data: CreateEventParams): Promise<Event> {
    const response = await api.post<Event>('/events', data);
    return response.data;
  }

  async updateEvent(id: number, data: UpdateEventParams): Promise<Event> {
    const response = await api.patch<Event>(`/events/${id}`, data);
    return response.data;
  }
}

export const eventsService = new EventsService();
