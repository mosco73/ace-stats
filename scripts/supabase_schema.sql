-- Esquema de la base Ace Stats v2.0 (Supabase/Postgres)
-- Ejecutado el 19/07/2026 en el SQL Editor. Guardado aca como referencia.
create table jugadores (
  id text primary key, nombre text not null, nombre_dataset text not null,
  pais text not null, mano text not null check (mano in ('R','L')),
  pro_desde int not null, ranking int not null,
  grand_slams int not null default 0, semanas_1 int not null default 0
);
create table partidos (
  id bigint generated always as identity primary key,
  tourney_date int not null, tourney_name text not null, tourney_level text,
  surface text, indoor boolean default false, round text, best_of int,
  winner_name text not null, loser_name text not null,
  winner_rank int, loser_rank int, score text,
  w_bpsaved int, w_bpfaced int, w_svgms int,
  l_bpsaved int, l_bpfaced int, l_svgms int
);
create index idx_partidos_winner on partidos (winner_name);
create index idx_partidos_loser on partidos (loser_name);
create index idx_partidos_fecha on partidos (tourney_date);
create index idx_partidos_torneo on partidos (tourney_name);
alter table jugadores enable row level security;
alter table partidos enable row level security;
create policy "lectura publica jugadores" on jugadores for select using (true);
create policy "lectura publica partidos" on partidos for select using (true);
