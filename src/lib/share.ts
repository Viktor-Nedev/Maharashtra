import { toast } from './toastStore';

/**
 * Share a URL via the native Web Share API (mobile / PWA), falling back to
 * copying the link to the clipboard. Either way the user gets toast feedback —
 * demonstrates PWA-readiness for the "Zero to Live" hackathon.
 */
export async function shareLink(title: string, text: string, url: string) {
  const fullUrl = url.startsWith('http') ? url : window.location.origin + url;

  if (navigator.share) {
    try {
      await navigator.share({ title, text, url: fullUrl });
      return;
    } catch (err) {
      // User cancelled the share sheet — do nothing.
      if (err instanceof DOMException && err.name === 'AbortError') return;
      // Otherwise fall through to clipboard.
    }
  }

  try {
    await navigator.clipboard.writeText(fullUrl);
    toast('Link copied to clipboard', 'success');
  } catch {
    toast('Could not share — copy the URL manually', 'error');
  }
}
