const BASE_URL = import.meta.env.VITE_API_BASE || '';

async function getAuthToken(): Promise<string | null> {
  const { auth } = await import('./firebase');
  return auth.currentUser ? auth.currentUser.getIdToken() : null;
}

export async function uploadImage(file: File, _folder: string): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);

  const token = await getAuthToken();
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}/upload`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Upload failed');
  }
  const data = await res.json();
  return `${BASE_URL}${data.url}`;
}
