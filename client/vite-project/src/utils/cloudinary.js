const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

// Signed download (works for public & private assets)
export function buildSignedDownloadUrl(cloudinaryUrl, filename = 'resume.pdf') {
  if (!cloudinaryUrl) return '#';
  const encoded = encodeURIComponent(cloudinaryUrl);
  const encodedName = encodeURIComponent(filename);
  return `${API_BASE}/api/files/signed-download?url=${encoded}&filename=${encodedName}`;
}

// Try to open public URL; if blocked (401/CORS), fallback to signed download
export async function openResumeSmart(cloudinaryUrl, filename = 'resume.pdf') {
  if (!cloudinaryUrl) return;
  try {
    const resp = await fetch(cloudinaryUrl, { method: 'HEAD' });
    if (resp.ok) {
      window.open(cloudinaryUrl, '_blank', 'noopener,noreferrer');
      return;
    }
  } catch (_) {}
  const dl = buildSignedDownloadUrl(cloudinaryUrl, filename);
  window.open(dl, '_blank', 'noopener,noreferrer');
}
