import { useState } from 'react';
export function Search() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<string[]>([]);
  const [status, setStatus] = useState('Ready');
  async function search() {
    setStatus('Searching…');
    try {
      const response = await fetch('/api/search?q=' + encodeURIComponent(query));
      if (!response.ok) throw new Error('Search failed');
      const data = await response.json();
      if (!Array.isArray(data.results)) throw new Error('Unsupported response');
      setResults(data.results);
      setStatus('Results loaded');
    } catch { setStatus('Search unavailable'); }
  }
  return (
    <main>
      <label>
        Search query
        <input value={query} onChange={e => setQuery(e.target.value)} />
      </label>
      <button onClick={search}>Search</button>
      <p role="status">{status}</p>
      <ul>{results.map(result => <li key={result}>{result}</li>)}</ul>
    </main>
  );
}
