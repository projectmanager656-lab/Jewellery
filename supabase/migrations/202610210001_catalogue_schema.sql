create table public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories(id) on delete restrict,
  product_code text not null unique,
  name text not null,
  description text not null default '',
  price numeric(12, 2) check (price is null or price >= 0),
  currency text not null default 'INR',
  material text not null default '',
  purity text not null default '',
  weight text not null default '',
  gemstone text not null default '',
  availability boolean not null default true,
  is_published boolean not null default false,
  is_featured boolean not null default false,
  is_new_arrival boolean not null default false,
  is_bestseller boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  storage_path text not null,
  alt_text text not null default '',
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (product_id, storage_path)
);

create table public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create index products_published_category_idx
  on public.products (is_published, category_id);
create index products_published_created_idx
  on public.products (is_published, created_at desc);
create index product_images_product_order_idx
  on public.product_images (product_id, display_order);

create or replace function public.set_product_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger products_set_updated_at
  before update on public.products
  for each row execute function public.set_product_updated_at();

create or replace function public.is_catalogue_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_catalogue_admin() from public;
grant execute on function public.is_catalogue_admin() to anon, authenticated;

grant select on public.categories, public.products, public.product_images to anon, authenticated;
grant insert, update, delete on public.categories, public.products, public.product_images to authenticated;
grant select on public.admin_users to authenticated;

alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.admin_users enable row level security;

create policy "Published catalogue categories are readable"
  on public.categories for select to anon, authenticated using (true);
create policy "Catalogue admins manage categories"
  on public.categories for all to authenticated
  using ((select public.is_catalogue_admin()))
  with check ((select public.is_catalogue_admin()));

create policy "Visitors read published products"
  on public.products for select to anon, authenticated
  using (is_published or (select public.is_catalogue_admin()));
create policy "Catalogue admins manage products"
  on public.products for all to authenticated
  using ((select public.is_catalogue_admin()))
  with check ((select public.is_catalogue_admin()));

create policy "Visitors read images for published products"
  on public.product_images for select to anon, authenticated
  using (
    (select public.is_catalogue_admin())
    or exists (
      select 1
      from public.products
      where products.id = product_images.product_id
        and products.is_published = true
    )
  );
create policy "Catalogue admins manage product images"
  on public.product_images for all to authenticated
  using ((select public.is_catalogue_admin()))
  with check ((select public.is_catalogue_admin()));

create policy "Admins can read their own admin membership"
  on public.admin_users for select to authenticated
  using (user_id = (select auth.uid()));

insert into public.categories (slug, name, sort_order) values
  ('gold', 'Gold jewellery', 10),
  ('diamond', 'Diamond jewellery', 20),
  ('Pendants', 'Pendants', 30),
  ('Necklaces', 'Necklaces', 40),
  ('Earrings', 'Earrings', 50),
  ('Rings', 'Rings', 60),
  ('Bangles', 'Bangles', 70),
  ('Bracelets', 'Bracelets', 80),
  ('Mangalsutras', 'Mangalsutras', 90),
  ('Bridal', 'Bridal jewellery', 100)
on conflict (slug) do nothing;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'jewellery-images',
  'jewellery-images',
  false,
  8388608,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do nothing;

create policy "Visitors read images for published jewellery"
  on storage.objects for select to anon, authenticated
  using (
    bucket_id = 'jewellery-images'
    and (
      (select public.is_catalogue_admin())
      or exists (
        select 1
        from public.product_images
        join public.products on products.id = product_images.product_id
        where product_images.storage_path = storage.objects.name
          and products.is_published = true
      )
    )
  );
create policy "Catalogue admins upload jewellery images"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'jewellery-images'
    and (select public.is_catalogue_admin())
  );
create policy "Catalogue admins update jewellery images"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'jewellery-images'
    and (select public.is_catalogue_admin())
  )
  with check (
    bucket_id = 'jewellery-images'
    and (select public.is_catalogue_admin())
  );
create policy "Catalogue admins delete jewellery images"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'jewellery-images'
    and (select public.is_catalogue_admin())
  );
