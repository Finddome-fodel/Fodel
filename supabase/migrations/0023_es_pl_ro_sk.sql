-- 0023: Spanish, Polish, Romanian and Slovak
--
-- Run by hand in the Supabase SQL editor, after 0022, BEFORE deploying the
-- branch that adds /es, /pl, /ro and /sk. Safe to run twice.
--
-- 1. The locale_code enum (0001) learns es, pl, ro and sk, so translations,
--    email templates, valuations, blog posts and activity rows can be stored
--    in those languages.
-- 2. Newsletter sign-ups may be in any of the nine languages (0020 allowed five).
-- 3. The property vocabulary gets Spanish, Polish, Romanian and Slovak labels,
--    and the property categories their URL words.
--
-- Full-text search needs no change: the search function (0022) and the
-- generated search_vector column (0004) use 'simple' for any language without a named
-- dictionary, which now covers es, pl, ro and sk. (Postgres has a Spanish
-- dictionary; switching Spanish to it is an optional later change to both.)
--
-- As in 0020, nothing overwrites wording an admin has typed: existing labels
-- and slugs win (the new values sit on the left of the || merge). The site
-- carries the same wording in src/data/taxonomy-i18n.ts, src/i18n/ui.ts
-- (CATEGORY_FALLBACK) and src/data/listing/groups.json.

/* ── 1. Languages ────────────────────────────────────────────────────────── */

-- ALTER TYPE … ADD VALUE cannot be used in the same transaction that adds it;
-- the statements below do not use the new values, so this runs as one script.
alter type locale_code add value if not exists 'es';
alter type locale_code add value if not exists 'pl';
alter type locale_code add value if not exists 'ro';
alter type locale_code add value if not exists 'sk';

/* ── 2. Newsletter language ──────────────────────────────────────────────── */

do $$
declare
  c record;
begin
  if to_regclass('public.newsletter_subscribers') is not null then
    for c in
      select conname from pg_constraint
      where conrelid = 'public.newsletter_subscribers'::regclass
        and contype = 'c'
        and pg_get_constraintdef(oid) ilike '%locale%'
    loop
      execute format('alter table public.newsletter_subscribers drop constraint %I', c.conname);
    end loop;
    alter table public.newsletter_subscribers
      add constraint newsletter_subscribers_locale_check
      check (locale in ('hu', 'nl', 'en', 'de', 'fr', 'es', 'pl', 'ro', 'sk'));
  end if;
end $$;

/* ── 3. Vocabulary labels ────────────────────────────────────────────────── */

-- feature
update taxonomy_terms t set labels = jsonb_build_object('es', v.es, 'pl', v.pl, 'ro', v.ro, 'sk', v.sk) || t.labels
from (values
    ('panoramic-view', 'Vistas panorámicas', 'Widok panoramiczny', 'Priveliște panoramică', 'Panoramatický výhľad'),
    ('waterfront', 'Junto al agua', 'Nad samą wodą', 'La malul apei', 'Priamo pri vode'),
    ('private-jetty', 'Embarcadero privado', 'Prywatny pomost', 'Ponton privat', 'Súkromné mólo'),
    ('boathouse', 'Cobertizo para barcos', 'Hangar na łodzie', 'Adăpost pentru bărci', 'Lodenica'),
    ('hillside', 'En lo alto de una colina', 'Na wzgórzu', 'Pe un deal', 'Na kopci'),
    ('forest-adjacent', 'Cerca del bosque', 'W pobliżu lasu', 'Aproape de pădure', 'Pri lese'),
    ('vineyard', 'Viñedo', 'Winnica', 'Viță-de-vie', 'Vinica'),
    ('winery', 'Bodega en funcionamiento', 'Działająca winnica z winiarnią', 'Cramă în funcțiune', 'Fungujúce vinárstvo'),
    ('cellar', 'Bodega', 'Piwnica na wino', 'Pivniță de vin', 'Vínna pivnica'),
    ('orchard', 'Huerto frutal', 'Sad', 'Livadă', 'Ovocný sad'),
    ('well', 'Pozo propio', 'Własna studnia', 'Fântână proprie', 'Vlastná studňa'),
    ('outbuildings', 'Anexos', 'Budynki gospodarcze', 'Anexe', 'Hospodárske budovy'),
    ('stables', 'Cuadras', 'Stajnie', 'Grajduri', 'Stajne'),
    ('guesthouse', 'Casa de invitados', 'Dom gościnny', 'Casă de oaspeți', 'Dom pre hostí'),
    ('park', 'Parque', 'Park', 'Parc', 'Park'),
    ('terrace', 'Terraza', 'Taras', 'Terasă', 'Terasa'),
    ('original-beams', 'Vigas originales', 'Oryginalne belki', 'Grinzi originale', 'Pôvodné trámy'),
    ('renovated', 'Reformado', 'Po remoncie', 'Renovat', 'Zrekonštruovaný'),
    ('parking', 'Aparcamiento en la parcela', 'Parking na działce', 'Parcare pe teren', 'Parkovanie na pozemku'),
    ('garage', 'Garaje', 'Garaż', 'Garaj', 'Garáž'),
    ('pool', 'Piscina', 'Basen', 'Piscină', 'Bazén'),
    ('balcony', 'Balcón', 'Balkon', 'Balcon', 'Balkón'),
    ('carport', 'Cochera', 'Wiata garażowa', 'Copertină auto', 'Prístrešok na auto'),
    ('storage-building', 'Almacén', 'Budynek magazynowy', 'Clădire de depozitare', 'Skladová budova'),
    ('barn-hall', 'Granero o nave', 'Stodoła lub hala', 'Șură sau hală', 'Stodola alebo hala'),
    ('animal-housing', 'Alojamiento para animales', 'Budynek inwentarski', 'Adăpost pentru animale', 'Maštaľ'),
    ('gazebo', 'Cenador', 'Altana', 'Foișor', 'Záhradný altánok'),
    ('outdoor-oven', 'Horno exterior', 'Piec zewnętrzny', 'Cuptor exterior', 'Vonkajšia pec')
) as v(key, es, pl, ro, sk)
where t.group_key = 'feature' and t.key = v.key;

-- condition
update taxonomy_terms t set labels = jsonb_build_object('es', v.es, 'pl', v.pl, 'ro', v.ro, 'sk', v.sk) || t.labels
from (values
    ('new', 'Como nuevo', 'Jak nowy', 'Ca nou', 'Ako nový'),
    ('renovated', 'Reformado', 'Po remoncie', 'Renovat', 'Zrekonštruovaný'),
    ('good', 'Buen estado', 'Dobry stan', 'Stare bună', 'Dobrý stav'),
    ('needs-renovation', 'Para reformar', 'Do remontu', 'Necesită renovare', 'Na rekonštrukciu')
) as v(key, es, pl, ro, sk)
where t.group_key = 'condition' and t.key = v.key;

-- heating
update taxonomy_terms t set labels = jsonb_build_object('es', v.es, 'pl', v.pl, 'ro', v.ro, 'sk', v.sk) || t.labels
from (values
    ('gas', 'Calefacción de gas', 'Ogrzewanie gazowe', 'Încălzire pe gaz', 'Plynové kúrenie'),
    ('electric', 'Calefacción eléctrica', 'Ogrzewanie elektryczne', 'Încălzire electrică', 'Elektrické kúrenie'),
    ('wood', 'Calefacción de leña', 'Ogrzewanie drewnem', 'Încălzire cu lemne', 'Kúrenie drevom'),
    ('heat-pump', 'Bomba de calor', 'Pompa ciepła', 'Pompă de căldură', 'Tepelné čerpadlo')
) as v(key, es, pl, ro, sk)
where t.group_key = 'heating' and t.key = v.key;

-- blog_category
update taxonomy_terms t set labels = jsonb_build_object('es', v.es, 'pl', v.pl, 'ro', v.ro, 'sk', v.sk) || t.labels
from (values
    ('market', 'Análisis de mercado', 'Analiza rynku', 'Analiză de piață', 'Analýza trhu'),
    ('buyers', 'Guía del comprador', 'Poradnik kupującego', 'Ghidul cumpărătorului', 'Sprievodca pre kupujúcich'),
    ('news', 'Noticias', 'Aktualności', 'Noutăți', 'Novinky'),
    ('case-study', 'Caso práctico', 'Studium przypadku', 'Studiu de caz', 'Prípadová štúdia')
) as v(key, es, pl, ro, sk)
where t.group_key = 'blog_category' and t.key = v.key;

-- wall
update taxonomy_terms t set labels = jsonb_build_object('es', v.es, 'pl', v.pl, 'ro', v.ro, 'sk', v.sk) || t.labels
from (values
    ('tegla', 'Ladrillo', 'Cegła', 'Cărămidă', 'Tehla'),
    ('valyog', 'Adobe (ladrillo de barro)', 'Glinobitka (cegła suszona)', 'Chirpici (cărămidă nearsă)', 'Nepálená tehla (váľky)'),
    ('vegyes', 'Mixto', 'Mieszany', 'Mixt', 'Zmiešaný'),
    ('panel', 'Hormigón / paneles', 'Beton / wielka płyta', 'Beton / panouri', 'Betón / panel'),
    ('fa', 'Madera / construcción ligera', 'Drewno / konstrukcja lekka', 'Lemn / structură ușoară', 'Drevo / ľahká konštrukcia'),
    ('ko', 'Piedra', 'Kamień', 'Piatră', 'Kameň'),
    ('egyeb', 'Otro', 'Inny', 'Altul', 'Iný'),
    ('nem-tudom', 'Desconocido', 'Nieznany', 'Necunoscut', 'Neznámy')
) as v(key, es, pl, ro, sk)
where t.group_key = 'wall' and t.key = v.key;

/* ── 4. Category names and URL words ─────────────────────────────────────── */

update taxonomy_terms t
set labels = jsonb_build_object('es', v.label_es, 'pl', v.label_pl, 'ro', v.label_ro, 'sk', v.label_sk) || t.labels,
    slugs  = jsonb_build_object('es', v.slug_es, 'pl', v.slug_pl, 'ro', v.slug_ro, 'sk', v.slug_sk) || t.slugs
from (values
    ('house', 'Casa', 'Dom', 'Casă', 'Dom', 'casa', 'dom', 'casa', 'dom'),
    ('holiday', 'Casa de vacaciones', 'Dom wakacyjny', 'Casă de vacanță', 'Rekreačný dom', 'casa-de-vacaciones', 'dom-wakacyjny', 'casa-de-vacanta', 'rekreacny-dom'),
    ('farm', 'Finca', 'Gospodarstwo', 'Fermă', 'Farma', 'finca', 'gospodarstwo', 'ferma', 'farma'),
    ('land', 'Terreno', 'Działka', 'Teren', 'Pozemok', 'terreno', 'dzialka', 'teren', 'pozemok'),
    ('commercial', 'Inmueble comercial', 'Nieruchomość komercyjna', 'Proprietate comercială', 'Komerčná nehnuteľnosť', 'inmueble-comercial', 'nieruchomosc-komercyjna', 'proprietate-comerciala', 'komercna-nehnutelnost'),
    ('agricultural', 'Inmueble agrícola', 'Nieruchomość rolna', 'Proprietate agricolă', 'Poľnohospodárska nehnuteľnosť', 'inmueble-agricola', 'nieruchomosc-rolna', 'proprietate-agricola', 'polnohospodarska-nehnutelnost'),
    ('mansion', 'Casa señorial, mansión', 'Dwór, pałac', 'Conac, castel', 'Kaštieľ, kúria', 'casa-senorial', 'dwor', 'conac', 'kastiel'),
    ('apartment', 'Piso', 'Mieszkanie', 'Apartament', 'Byt', 'piso', 'mieszkanie', 'apartament', 'byt'),
    ('industrial', 'Inmueble industrial', 'Nieruchomość przemysłowa', 'Proprietate industrială', 'Priemyselná nehnuteľnosť', 'inmueble-industrial', 'nieruchomosc-przemyslowa', 'proprietate-industriala', 'priemyselna-nehnutelnost'),
    ('investment', 'Inmuebles de inversión', 'Nieruchomości inwestycyjne', 'Proprietăți de investiții', 'Investičné nehnuteľnosti', 'inmueble-de-inversion', 'nieruchomosc-inwestycyjna', 'proprietate-de-investitie', 'investicna-nehnutelnost'),
    ('other', 'Otros inmuebles', 'Inne nieruchomości', 'Alte proprietăți', 'Iné nehnuteľnosti', 'otro-inmueble', 'inna-nieruchomosc', 'alta-proprietate', 'ina-nehnutelnost')
) as v(key, label_es, label_pl, label_ro, label_sk, slug_es, slug_pl, slug_ro, slug_sk)
where t.group_key = 'category' and t.key = v.key;

-- One URL word per category and language, as for the other languages (0011, 0020).
create unique index if not exists taxonomy_category_es_slug_unique
  on taxonomy_terms ((slugs->>'es')) where group_key = 'category' and slugs ? 'es';
create unique index if not exists taxonomy_category_pl_slug_unique
  on taxonomy_terms ((slugs->>'pl')) where group_key = 'category' and slugs ? 'pl';
create unique index if not exists taxonomy_category_ro_slug_unique
  on taxonomy_terms ((slugs->>'ro')) where group_key = 'category' and slugs ? 'ro';
create unique index if not exists taxonomy_category_sk_slug_unique
  on taxonomy_terms ((slugs->>'sk')) where group_key = 'category' and slugs ? 'sk';
