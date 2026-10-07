import { useState } from "react";
import { uploadPhoto } from "./api";

export function ProfilePhoto() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState("Choose a photo to begin.");
  async function upload() {
    if (!file) return;
    setStatus("Uploading photo…");
    try {
      await uploadPhoto(file);
      setStatus("Photo uploaded");
    } catch {
      setStatus("Upload failed. Try again.");
    }
  }
  return <main className="reference-photo">
    <span>UNRAVEL · DISPOSABLE REFERENCE APP</span>
    <h1>Your profile photo</h1>
    <p>This little app gives you a real upload to explore. Use its bundled test image; data is disposable.</p>
    <label htmlFor="photo">Choose photo</label>
    <input id="photo" type="file" accept="image/png" onChange={e => setFile(e.target.files?.[0] || null)} />
    <button onClick={upload} disabled={!file}>Upload photo</button>
    <p role="status">{status}</p>
  </main>;
}
