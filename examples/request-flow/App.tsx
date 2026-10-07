import { useState } from 'react';

export function DraftEditor() {
  const [body, setBody] = useState('');
  return <textarea value={body} onChange={event => setBody(event.target.value)} />;
}
