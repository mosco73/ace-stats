import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function DbTestPage() {
  const { count, error: countError } = await supabase
    .from('partidos')
    .select('*', { count: 'exact', head: true });

const { data: sinner, error: sinnerError } = await supabase
    .from('jugadores')
    .select('nombre_dataset')
    .eq('id', 'sinner')
    .single();

  let partidosSinner: any[] = [];
  if (sinner) {
    const { data } = await supabase
      .from('partidos')
      .select('*')
      .or(`winner_name.eq.${sinner.nombre_dataset},loser_name.eq.${sinner.nombre_dataset}`)
      .order('tourney_date', { ascending: false })
      .limit(5);
    partidosSinner = data ?? [];
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white p-8">
      <h1 className="text-2xl font-bold mb-4">Test de conexión Supabase</h1>

      <p className="mb-2">
        Total de partidos en la base: <strong>{count ?? 'ERROR'}</strong>
      </p>
      {countError && (
        <p className="text-red-400 mb-4">Error contando partidos: {countError.message}</p>
      )}
      {sinnerError && (
        <p className="text-red-400 mb-4">Error buscando a Sinner: {sinnerError.message}</p>
      )}

      <h2 className="text-xl font-semibold mt-6 mb-2">Últimos 5 partidos de Sinner</h2>
      <pre className="bg-zinc-900 p-4 rounded-lg overflow-x-auto text-xs">
        {JSON.stringify(partidosSinner, null, 2)}
      </pre>
    </main>
  );
}