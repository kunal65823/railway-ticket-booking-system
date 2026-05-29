import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';

export default function SupabaseDemo() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      const { data, error } = await supabase.from('todos').select('*').limit(50);
      if (error) {
        console.error('Supabase error:', error.message || error);
      } else if (mounted) {
        setItems(data || []);
      }
      setLoading(false);
    }
    load();
    return () => { mounted = false; };
  }, []);

  if (loading) return <div className="p-6">Loading todos...</div>;

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Supabase Todos</h2>
      {items.length === 0 ? (
        <div>No todos found in `todos` table.</div>
      ) : (
        <ul className="list-disc pl-6">
          {items.map((t) => (
            <li key={t.id}>{t.name || JSON.stringify(t)}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
