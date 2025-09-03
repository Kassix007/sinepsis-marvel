-- name: SearchSpells :many
SELECT title, summary, url, categories
FROM spells
ORDER BY embedding <-> $1
LIMIT $2;

-- name: GetSpells :many
SELECT 
    pageid,
    title,
    url,
    summary,
    categories,
    realities,
    origin,
    power_class,
    access_level,
    aliases,
    infobox,
    embedding
FROM public.spells
LIMIT 5;
