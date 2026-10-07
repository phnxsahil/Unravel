export async function uploadPhoto(file: File) {
  const response = await fetch('/api/photo', {
    method: 'POST',
    headers: { 'Content-Type': 'image/png' },
    body: file,
  });
  if (!response.ok) throw new Error('Upload failed');
  return response.json();
}
