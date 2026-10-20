-- 0020: English, German and French
--
-- Run by hand in the Supabase SQL editor, after 0019. Safe to run twice.
--
-- 1. Newsletter sign-ups may now be French (0019 allowed hu, nl, en, de).
-- 2. The property vocabulary gets English, German and French labels, and the
--    property categories their English, German and French URL words.
--
-- Nothing here overwrites wording an admin has typed: existing labels and
-- slugs always win (the new values go on the left of the || merge). The site
-- carries the same wording in src/data/taxonomy-i18n.ts and
-- src/i18n/ui.ts (CATEGORY_FALLBACK), so it reads correctly before this runs.

/* ── 1. Newsletter language ──────────────────────────────────────────────── */

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
      check (locale in ('hu', 'nl', 'en', 'de', 'fr'));
  end if;
end $$;

/* ── 2. Vocabulary labels ────────────────────────────────────────────────── */

-- feature
update taxonomy_terms t set labels = jsonb_build_object('en', v.en, 'de', v.de, 'fr', v.fr) || t.labels
from (values
    ('panoramic-view', 'Panoramic view', 'Panoramablick', 'Vue panoramique'),
    ('waterfront', 'Waterfront', 'Direkt am Wasser', 'Au bord de l’eau'),
    ('private-jetty', 'Private jetty', 'Eigener Steg', 'Ponton privé'),
    ('boathouse', 'Boathouse', 'Bootshaus', 'Abri à bateaux'),
    ('hillside', 'On a hilltop', 'Auf einem Hügel', 'Sur une colline'),
    ('forest-adjacent', 'Near the forest', 'In Waldnähe', 'Près de la forêt'),
    ('vineyard', 'Vineyard', 'Weinberg', 'Vignoble'),
    ('winery', 'Working winery', 'Betriebenes Weingut', 'Domaine viticole en activité'),
    ('cellar', 'Wine cellar', 'Weinkeller', 'Cave à vin'),
    ('orchard', 'Orchard', 'Obstgarten', 'Verger'),
    ('well', 'Private well', 'Eigener Brunnen', 'Puits privé'),
    ('outbuildings', 'Outbuildings', 'Nebengebäude', 'Dépendances'),
    ('stables', 'Stables', 'Pferdestall', 'Écuries'),
    ('guesthouse', 'Guest house', 'Gästehaus', 'Maison d’hôtes'),
    ('park', 'Park', 'Park', 'Parc'),
    ('terrace', 'Terrace', 'Terrasse', 'Terrasse'),
    ('original-beams', 'Original beams', 'Originale Holzbalken', 'Poutres d’origine'),
    ('renovated', 'Renovated', 'Renoviert', 'Rénové'),
    ('parking', 'Parking on the plot', 'Parkplatz auf dem Grundstück', 'Stationnement sur le terrain'),
    ('garage', 'Garage', 'Garage', 'Garage'),
    ('pool', 'Pool', 'Pool', 'Piscine'),
    ('balcony', 'Balcony', 'Balkon', 'Balcon'),
    ('carport', 'Carport', 'Carport', 'Abri pour voiture'),
    ('storage-building', 'Storage building', 'Lagergebäude', 'Bâtiment de stockage'),
    ('barn-hall', 'Barn or hall', 'Scheune oder Halle', 'Grange ou hangar'),
    ('animal-housing', 'Animal housing', 'Tierstall', 'Bâtiment pour animaux'),
    ('gazebo', 'Gazebo', 'Gartenpavillon', 'Pavillon de jardin'),
    ('outdoor-oven', 'Outdoor oven', 'Außenofen', 'Four extérieur')
) as v(key, en, de, fr)
where t.group_key = 'feature' and t.key = v.key;

-- condition
update taxonomy_terms t set labels = jsonb_build_object('en', v.en, 'de', v.de, 'fr', v.fr) || t.labels
from (values
    ('new', 'Like new', 'Neuwertig', 'Comme neuf'),
    ('renovated', 'Renovated', 'Renoviert', 'Rénové'),
    ('good', 'Good condition', 'Guter Zustand', 'Bon état'),
    ('needs-renovation', 'Needs renovation', 'Renovierungsbedürftig', 'À rénover')
) as v(key, en, de, fr)
where t.group_key = 'condition' and t.key = v.key;

-- heating
update taxonomy_terms t set labels = jsonb_build_object('en', v.en, 'de', v.de, 'fr', v.fr) || t.labels
from (values
    ('gas', 'Gas heating', 'Gasheizung', 'Chauffage au gaz'),
    ('electric', 'Electric heating', 'Elektroheizung', 'Chauffage électrique'),
    ('wood', 'Wood heating', 'Holzheizung', 'Chauffage au bois'),
    ('heat-pump', 'Heat pump', 'Wärmepumpe', 'Pompe à chaleur')
) as v(key, en, de, fr)
where t.group_key = 'heating' and t.key = v.key;

-- blog_category
update taxonomy_terms t set labels = jsonb_build_object('en', v.en, 'de', v.de, 'fr', v.fr) || t.labels
from (values
    ('market', 'Market analysis', 'Marktanalyse', 'Analyse du marché'),
    ('buyers', 'Buyer’s guide', 'Käuferratgeber', 'Guide de l’acheteur'),
    ('news', 'News', 'Neuigkeiten', 'Actualités'),
    ('case-study', 'Case study', 'Fallstudie', 'Étude de cas')
) as v(key, en, de, fr)
where t.group_key = 'blog_category' and t.key = v.key;

-- wall
update taxonomy_terms t set labels = jsonb_build_object('en', v.en, 'de', v.de, 'fr', v.fr) || t.labels
from (values
    ('tegla', 'Brick', 'Ziegel', 'Brique'),
    ('valyog', 'Adobe (mud brick)', 'Lehm (Adobe)', 'Adobe (brique crue)'),
    ('vegyes', 'Mixed', 'Gemischt', 'Mixte'),
    ('panel', 'Concrete / panel', 'Beton / Platte', 'Béton / panneaux'),
    ('fa', 'Timber / light frame', 'Holz / Leichtbau', 'Bois / construction légère'),
    ('ko', 'Stone', 'Stein', 'Pierre'),
    ('egyeb', 'Other', 'Sonstiges', 'Autre'),
    ('nem-tudom', 'Unknown', 'Unbekannt', 'Inconnu')
) as v(key, en, de, fr)
where t.group_key = 'wall' and t.key = v.key;


/* ── 3. Category names and URL words ─────────────────────────────────────── */

update taxonomy_terms t
set labels = jsonb_build_object('en', v.label_en, 'de', v.label_de, 'fr', v.label_fr) || t.labels,
    slugs  = jsonb_build_object('en', v.slug_en, 'de', v.slug_de, 'fr', v.slug_fr) || t.slugs
from (values
    ('house', 'House', 'Haus', 'Maison', 'house', 'haus', 'maison'),
    ('holiday', 'Holiday home', 'Ferienhaus', 'Maison de vacances', 'holiday-home', 'ferienhaus', 'maison-de-vacances'),
    ('farm', 'Farm', 'Bauernhof', 'Ferme', 'farm', 'bauernhof', 'ferme'),
    ('land', 'Land', 'Grundstück', 'Terrain', 'land', 'grundstueck', 'terrain'),
    ('commercial', 'Commercial property', 'Gewerbeimmobilie', 'Immobilier commercial', 'commercial-property', 'gewerbeimmobilie', 'immobilier-commercial'),
    ('agricultural', 'Agricultural property', 'Agrarimmobilie', 'Immobilier agricole', 'agricultural-property', 'agrarimmobilie', 'immobilier-agricole'),
    ('mansion', 'Country house, manor', 'Landhaus, Herrenhaus', 'Manoir, maison de maître', 'manor-house', 'landhaus', 'manoir'),
    ('apartment', 'Flat', 'Wohnung', 'Appartement', 'flat', 'wohnung', 'appartement'),
    ('industrial', 'Industrial property', 'Industrieimmobilie', 'Immobilier industriel', 'industrial-property', 'industrieimmobilie', 'immobilier-industriel')
) as v(key, label_en, label_de, label_fr, slug_en, slug_de, slug_fr)
where t.group_key = 'category' and t.key = v.key;

-- One URL word per category and language, as for Hungarian and Dutch (0011).
create unique index if not exists taxonomy_category_en_slug_unique
  on taxonomy_terms ((slugs->>'en')) where group_key = 'category' and slugs ? 'en';
create unique index if not exists taxonomy_category_de_slug_unique
  on taxonomy_terms ((slugs->>'de')) where group_key = 'category' and slugs ? 'de';
create unique index if not exists taxonomy_category_fr_slug_unique
  on taxonomy_terms ((slugs->>'fr')) where group_key = 'category' and slugs ? 'fr';
