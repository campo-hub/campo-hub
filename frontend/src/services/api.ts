import { getIdToken } from './auth';

const BASE_URL = import.meta.env.VITE_API_BASE || '';

async function request(path: string, options: RequestInit = {}, requireAuth = false) {
  const headers = new Headers(options.headers || {});
  if (options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (requireAuth) {
    const token = await getIdToken();
    if (!token) throw new Error('Authentication required');
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Request failed with status ${response.status}`);
  }

  return response.json();
}

export async function getProfile() {
  return request('/users/me', undefined, true);
}

export async function getListings() {
  return request('/listings');
}

export async function getListing(id: string) {
  return request(`/listings/${id}`);
}

export async function createListing(listing: any) {
  return request('/listings', {
    method: 'POST',
    body: JSON.stringify(listing),
  }, true);
}

export async function getFeed() {
  return request('/feed');
}

export async function createFeedPost(post: any) {
  return request('/feed', {
    method: 'POST',
    body: JSON.stringify(post),
  }, true);
}

export async function likeFeedPost(id: string) {
  return request(`/feed/${id}/like`, {
    method: 'POST',
  }, true);
}

export async function commentFeedPost(id: string, text: string) {
  return request(`/feed/${id}/comment`, {
    method: 'POST',
    body: JSON.stringify({ text }),
  }, true);
}

export async function shareFeedPost(id: string) {
  return request(`/feed/${id}/share`, {
    method: 'POST',
  }, true);
}

export async function getChats() {
  return request('/chats', undefined, true);
}

export async function getChat(id: string) {
  return request(`/chats/${id}`, undefined, true);
}

export async function createChat(otherUid: string, listingId?: string) {
  return request('/chats', {
    method: 'POST',
    body: JSON.stringify({ otherUid, listingId }),
  }, true);
}

export async function sendChatMessage(chatId: string, text: string) {
  return request(`/chats/${chatId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ text }),
  }, true);
}

export async function getServices() {
  return request('/services');
}

export async function getService(id: string) {
  return request(`/services/${id}`);
}

export async function createService(service: any) {
  return request('/services', {
    method: 'POST',
    body: JSON.stringify(service),
  }, true);
}

export async function updateProfileBackend(data: { name?: string; photoURL?: string }) {
  return request('/users/me', {
    method: 'PATCH',
    body: JSON.stringify(data),
  }, true);
}

export interface EventItem {
  _id: string;
  title: string;
  date: string;
  location: string;
  description: string;
}

export async function getEvents() {
  return request('/events');
}

export async function createEvent(event: { title: string; date: string; location: string; description: string }) {
  return request('/events', {
    method: 'POST',
    body: JSON.stringify(event),
  }, true);
}

export async function getAdminStats() {
  return request('/admin/stats', undefined, true);
}
