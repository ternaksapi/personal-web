alter table public.reads
    add column if not exists note text,
    add column if not exists source_domain text;

comment on column public.reads.tags is
    'Topic labels for the public reads page. The UI treats this as topics, not free-form tags.';

comment on column public.reads.category is
    'Legacy compatibility column. New entries store the first topic here.';

comment on column public.reads.note is
    'Optional personal note explaining why this read is on the shelf.';

comment on column public.reads.source_domain is
    'Domain extracted from the article URL, such as example.com.';
