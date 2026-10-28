-- 0035: an owner can ask for a Dutch-speaking real-estate agent
--
-- Run by hand in the Supabase SQL editor, any time. Safe to run twice.
-- Run it BEFORE the deploy that ships the feature: the listing queries read these columns.
--
-- The request is a flag on the listing (like topic_highlight_requested), not a priced
-- on-site service: the price is always agreed personally, so nothing is charged or
-- invoiced from here. The admin sees the flag as a badge on the listing and gets an e-mail.

alter table properties add column if not exists dutch_agent_requested boolean not null default false;
alter table properties add column if not exists dutch_agent_requested_at timestamptz;

-- Lets the admin lists filter "who wants a Dutch-speaking agent" without scanning every row.
create index if not exists properties_dutch_agent_idx on properties (created_at desc) where dutch_agent_requested;
