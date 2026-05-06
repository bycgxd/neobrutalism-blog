import axios from 'axios';

let pending = false;

export async function trackPageView(page: string, articleId?: number): Promise<void> {
  if (pending) return;
  pending = true;
  try {
    await axios.post('/api/track', { page, articleId });
  } catch {
    // silently ignore
  } finally {
    pending = false;
  }
}
