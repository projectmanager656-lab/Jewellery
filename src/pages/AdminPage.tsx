import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { LogOut, Pencil, Plus, Trash2, Upload, X } from "lucide-react";
import {
  apiRequest,
  emptyProductDraft,
  productDraftPayload,
} from "../data/mongodb-api";
import type { AdminProduct, ApiCategory, ProductDraft } from "../data/mongodb-api";
import { ProductImage } from "../components/ProductImage";

interface AdminPageProps {
  onCatalogueChanged: () => Promise<void>;
}

interface AdminIdentity {
  id: string;
  email: string;
  role: "admin";
}

function draftFromProduct(product: AdminProduct): ProductDraft {
  return {
    categoryId: product.categoryId || "",
    code: product.code,
    name: product.name,
    description: product.description,
    price: product.price ?? null,
    currency: product.currency || "INR",
    material: product.material,
    purity: product.purity,
    weight: product.weight,
    gemstone: product.gemstone,
    availability: product.isAvailable,
    isPublished: product.isPublished,
    isFeatured: Boolean(product.featured),
    isNewArrival: Boolean(product.newArrival),
    isBestseller: Boolean(product.bestseller),
  };
}

function errorMessage(cause: unknown, fallback: string) {
  return cause instanceof Error ? cause.message : fallback;
}

export function AdminPage({ onCatalogueChanged }: AdminPageProps) {
  const [admin, setAdmin] = useState<AdminIdentity | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [draft, setDraft] = useState<ProductDraft>(emptyProductDraft);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [images, setImages] = useState<File[]>([]);
  const [replaceImages, setReplaceImages] = useState(false);
  const [categoryDraft, setCategoryDraft] = useState({ name: "", slug: "", sortOrder: 0 });
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [categoryFormOpen, setCategoryFormOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const imagePreviews = useMemo(() => images.map((file) => URL.createObjectURL(file)), [images]);

  useEffect(() => () => imagePreviews.forEach((url) => URL.revokeObjectURL(url)), [imagePreviews]);

  const loadAdminData = useCallback(async () => {
    const [{ items: productRows }, { items: categoryRows }] = await Promise.all([
      apiRequest<{ items: AdminProduct[] }>("/admin/products"),
      apiRequest<{ items: ApiCategory[] }>("/categories"),
    ]);
    setProducts(productRows);
    setCategories(categoryRows);
  }, []);

  useEffect(() => {
    let active = true;
    void apiRequest<{ admin: AdminIdentity }>("/auth/session")
      .then(({ admin: identity }) => {
        if (active) setAdmin(identity);
      })
      .catch((cause: unknown) => {
        if (!active) return;
        if ((cause as { status?: number })?.status !== 401) {
          setError(errorMessage(cause, "Could not connect to the MongoDB API."));
        }
      })
      .finally(() => {
        if (active) setAuthChecked(true);
      });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!admin) return;
    void loadAdminData().catch((cause: unknown) => {
      setError(errorMessage(cause, "Could not load admin data."));
    });
  }, [admin, loadAdminData]);

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const result = await apiRequest<{ admin: AdminIdentity }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      setAdmin(result.admin);
      setPassword("");
    } catch (cause) {
      setError(errorMessage(cause, "Could not sign in."));
    } finally {
      setBusy(false);
    }
  }

  function editProduct(product: AdminProduct) {
    setEditingId(product.id);
    setDraft(draftFromProduct(product));
    setImages([]);
    setReplaceImages(false);
    setNotice("");
    setError("");
  }

  function resetDraft() {
    setEditingId(null);
    setDraft(emptyProductDraft);
    setImages([]);
    setReplaceImages(false);
    setNotice("");
  }

  function editCategory(category: ApiCategory) {
    setEditingCategoryId(category.id);
    setCategoryDraft({ name: category.name, slug: category.slug, sortOrder: category.sortOrder });
    setCategoryFormOpen(true);
  }

  function resetCategoryDraft() {
    setEditingCategoryId(null);
    setCategoryDraft({ name: "", slug: "", sortOrder: categories.length });
    setCategoryFormOpen(false);
  }

  async function saveCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const payload = {
        name: categoryDraft.name.trim(),
        slug: categoryDraft.slug.trim(),
        sortOrder: Number(categoryDraft.sortOrder),
      };
      if (editingCategoryId) {
        await apiRequest(`/admin/categories/${editingCategoryId}`, { method: "PATCH", body: JSON.stringify(payload) });
      } else {
        await apiRequest("/admin/categories", { method: "POST", body: JSON.stringify(payload) });
      }
      await loadAdminData();
      await onCatalogueChanged();
      setNotice(editingCategoryId ? "Category updated." : "Category created.");
      resetCategoryDraft();
    } catch (cause) {
      setError(errorMessage(cause, "Category could not be saved."));
    } finally {
      setBusy(false);
    }
  }

  async function removeCategory(category: ApiCategory) {
    if (!window.confirm(`Delete the ${category.name} category?`)) return;
    setBusy(true);
    setError("");
    try {
      await apiRequest(`/admin/categories/${category.id}`, { method: "DELETE" });
      await loadAdminData();
      await onCatalogueChanged();
      if (editingCategoryId === category.id) resetCategoryDraft();
      setNotice(`${category.name} category deleted.`);
    } catch (cause) {
      setError(errorMessage(cause, "Category could not be deleted."));
    } finally {
      setBusy(false);
    }
  }

  async function removeProductImage(product: AdminProduct, imageId: string) {
    setBusy(true);
    setError("");
    try {
      await apiRequest(`/admin/products/${product.id}/images/${imageId}`, { method: "DELETE" });
      await loadAdminData();
      await onCatalogueChanged();
    } catch (cause) {
      setError(errorMessage(cause, "Image could not be removed."));
    } finally {
      setBusy(false);
    }
  }

  async function saveProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const existingProduct = editingId ? products.find((product) => product.id === editingId) : undefined;
    if (draft.isPublished && !images.length && !existingProduct?.gallery.length) {
      setError("Add at least one product image before publishing this product.");
      return;
    }
    if (images.some((image) => image.size > 8 * 1024 * 1024)) {
      setError("Each image must be 8 MB or smaller.");
      return;
    }
    if (images.some((image) => !["image/jpeg", "image/png", "image/webp", "image/avif"].includes(image.type))) {
      setError("Choose JPEG, PNG, WebP, or AVIF image files.");
      return;
    }
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const payload = productDraftPayload({ ...draft, isPublished: false });
      let productId = editingId;
      if (productId) {
        await apiRequest(`/admin/products/${productId}`, { method: "PATCH", body: JSON.stringify(payload) });
      } else {
        const result = await apiRequest<{ product: AdminProduct }>("/admin/products", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        productId = result.product.id;
      }
      if (images.length && productId) {
        const form = new FormData();
        for (const image of images) form.append("images", image);
        await apiRequest(`/admin/products/${productId}/images`, { method: "POST", body: form });
      }
      if (replaceImages && images.length && existingProduct && productId) {
        for (const image of existingProduct.images) {
          await apiRequest(`/admin/products/${productId}/images/${image.id}`, { method: "DELETE" });
        }
      }
      if (draft.isPublished && productId) {
        await apiRequest(`/admin/products/${productId}`, {
          method: "PATCH",
          body: JSON.stringify({ isPublished: true }),
        });
      }
      await loadAdminData();
      await onCatalogueChanged();
      setNotice(draft.isPublished ? "Product saved and published." : "Product saved as a draft.");
      resetDraft();
    } catch (cause) {
      setError(errorMessage(cause, "Product could not be saved."));
    } finally {
      setBusy(false);
    }
  }

  async function removeProduct(product: AdminProduct) {
    if (!window.confirm(`Delete ${product.name}? This also removes its stored images.`)) return;
    setBusy(true);
    setError("");
    try {
      await apiRequest(`/admin/products/${product.id}`, { method: "DELETE" });
      await loadAdminData();
      await onCatalogueChanged();
      if (editingId === product.id) resetDraft();
      setNotice(`${product.name} deleted.`);
    } catch (cause) {
      setError(errorMessage(cause, "Product could not be deleted."));
    } finally {
      setBusy(false);
    }
  }

  async function signOut() {
    try {
      await apiRequest("/auth/logout", { method: "POST" });
      setAdmin(null);
      setProducts([]);
      setCategories([]);
      resetDraft();
    } catch (cause) {
      setError(errorMessage(cause, "Could not sign out."));
    }
  }

  if (!authChecked) return <main className="px-5 py-20 text-center text-sm text-[#716a75]">Checking staff access…</main>;

  if (!admin) {
    return (
      <main className="mx-auto max-w-md px-5 py-16">
        <p className="text-[9px] font-semibold tracking-[0.16em] text-[#846a8e]">AUTHORIZED STAFF</p>
        <h1 className="mt-2 font-serif text-4xl text-[#29242b]">Catalogue admin</h1>
        <p className="mt-3 text-xs leading-5 text-[#716a75]">Sign in with an admin account configured on the server. Only authorized staff can edit catalogue data.</p>
        <form onSubmit={signIn} className="mt-7 grid gap-4 border border-[#e8e2ea] p-6">
          <label className="grid gap-1.5 text-[11px] text-[#514c53]">Email<input type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.currentTarget.value)} className="h-11 border-b border-[#dcd6de] px-1 text-sm outline-none focus:border-[#43224e]" /></label>
          <label className="grid gap-1.5 text-[11px] text-[#514c53]">Password<input type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.currentTarget.value)} className="h-11 border-b border-[#dcd6de] px-1 text-sm outline-none focus:border-[#43224e]" /></label>
          <button disabled={busy} className="min-h-11 bg-[#43224e] px-5 text-xs text-white disabled:opacity-60">{busy ? "Signing in…" : "Sign in"}</button>
          {error && <p role="alert" className="text-xs text-red-800">{error}</p>}
        </form>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-[1480px] px-4 py-10 sm:px-7 lg:px-12">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4"><div><p className="text-[9px] font-semibold tracking-[0.16em] text-[#846a8e]">AUTHORIZED STAFF · {admin.email}</p><h1 className="mt-2 font-serif text-4xl text-[#29242b]">Catalogue management</h1><p className="mt-2 text-xs text-[#716a75]">Catalogue changes are authorized and validated by the MongoDB API.</p></div><button type="button" onClick={() => void signOut()} className="inline-flex min-h-10 items-center gap-2 border border-[#ded9df] px-4 text-xs text-[#43224e]"><LogOut size={15} /> Sign out</button></div>
      {(error || notice) && <p role={error ? "alert" : "status"} className={`mb-5 border px-4 py-3 text-xs ${error ? "border-red-200 bg-red-50 text-red-800" : "border-[#d8e5d8] bg-[#f4faf3] text-[#355c37]"}`}>{error || notice}</p>}
      <section className="mb-8 border border-[#e8e2ea] bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><h2 className="font-serif text-2xl text-[#29242b]">Categories ({categories.length})</h2><p className="mt-1 text-xs text-[#716a75]">Customer navigation and filters use these MongoDB category names.</p></div>
          <button type="button" onClick={() => { resetCategoryDraft(); setCategoryFormOpen(true); }} className="inline-flex min-h-9 items-center gap-2 border border-[#d8c6a1] px-3 text-xs text-[#43224e]"><Plus size={14} /> Add category</button>
        </div>
        {categories.length ? <ul className="mt-4 flex flex-wrap gap-2">{categories.map((category) => <li key={category.id} className="inline-flex items-center gap-2 border border-[#eeeaf0] bg-[#faf8fb] px-3 py-2 text-xs text-[#514c53]"><span>{category.name}</span><button type="button" onClick={() => editCategory(category)} aria-label={`Edit ${category.name}`} className="text-[#43224e]"><Pencil size={13} /></button><button type="button" onClick={() => void removeCategory(category)} aria-label={`Delete ${category.name}`} className="text-[#8b4b4b]"><Trash2 size={13} /></button></li>)}</ul> : <p className="mt-4 text-xs text-[#827985]">No categories have been added yet. Create one before adding products.</p>}
        {categoryFormOpen && <form onSubmit={saveCategory} className="mt-5 grid gap-3 border-t border-[#eeeaf0] pt-5 sm:grid-cols-[1fr_1fr_120px_auto_auto] sm:items-end">
          <label className="grid gap-1 text-[10px] text-[#625a65]">Category name<input required maxLength={120} value={categoryDraft.name} onChange={(event) => { const name = event.currentTarget.value; setCategoryDraft((current) => ({ ...current, name, ...(!editingCategoryId ? { slug: name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") } : {}) })); }} className="h-10 border-b border-[#dcd6de] px-1 text-xs" /></label>
          <label className="grid gap-1 text-[10px] text-[#625a65]">URL slug<input required maxLength={80} pattern="[A-Za-z0-9][A-Za-z0-9_-]*" value={categoryDraft.slug} onChange={(event) => setCategoryDraft({ ...categoryDraft, slug: event.currentTarget.value })} className="h-10 border-b border-[#dcd6de] px-1 text-xs" /></label>
          <label className="grid gap-1 text-[10px] text-[#625a65]">Sort order<input type="number" min="0" step="1" required value={categoryDraft.sortOrder} onChange={(event) => setCategoryDraft({ ...categoryDraft, sortOrder: Number(event.currentTarget.value) })} className="h-10 border-b border-[#dcd6de] px-1 text-xs" /></label>
          <button disabled={busy} className="inline-flex min-h-10 items-center justify-center gap-1 bg-[#43224e] px-4 text-xs text-white disabled:opacity-60">{editingCategoryId ? "Save" : "Create"}</button>
          <button type="button" onClick={resetCategoryDraft} className="inline-flex min-h-10 items-center justify-center gap-1 px-3 text-xs text-[#716a75]"><X size={14} /> Cancel</button>
        </form>}
      </section>
      <div className="grid gap-8 xl:grid-cols-[minmax(0,1.2fr)_minmax(340px,0.8fr)]">
        <section>
          <div className="mb-4 flex items-center justify-between"><h2 className="font-serif text-2xl text-[#29242b]">Products ({products.length})</h2><button type="button" onClick={resetDraft} className="inline-flex min-h-10 items-center gap-2 border border-[#d8c6a1] px-4 text-xs text-[#43224e]"><Plus size={15} /> Add product</button></div>
          <div className="overflow-x-auto border border-[#e8e2ea]"><table className="w-full min-w-[620px] text-left text-xs"><thead className="bg-[#f7f4f8]"><tr>{["Product", "Code", "Status", "Availability", "Actions"].map((label) => <th key={label} className="p-3 text-[9px] font-semibold tracking-wide text-[#6c6470]">{label}</th>)}</tr></thead><tbody>{products.map((product) => <tr key={product.id} className="border-t border-[#eeeaf0]"><td className="p-3"><span className="font-medium text-[#29242b]">{product.name}</span><span className="mt-1 block text-[10px] text-[#817a84]">{product.category}</span></td><td className="p-3 text-[#716a75]">{product.code}</td><td className="p-3">{product.isPublished ? "Published" : "Draft"}</td><td className="p-3">{product.isAvailable ? "Available" : "Unavailable"}</td><td className="p-3"><div className="flex gap-3"><button type="button" onClick={() => editProduct(product)} aria-label={`Edit ${product.name}`} className="text-[#43224e]"><Pencil size={15} /></button><button type="button" onClick={() => void removeProduct(product)} aria-label={`Delete ${product.name}`} className="text-red-700"><Trash2 size={15} /></button></div></td></tr>)}</tbody></table></div>
        </section>
        <section className="border border-[#e8e2ea] p-5 sm:p-6"><h2 className="font-serif text-2xl text-[#29242b]">{editingId ? "Edit product" : "Add product"}</h2><form onSubmit={saveProduct} className="mt-5 grid gap-3">
          <label className="grid gap-1 text-[10px] text-[#625a65]">Product name<input required value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.currentTarget.value })} className="h-10 border-b border-[#dcd6de] px-1 text-xs" /></label>
          <label className="grid gap-1 text-[10px] text-[#625a65]">Product code<input required value={draft.code} onChange={(event) => setDraft({ ...draft, code: event.currentTarget.value })} className="h-10 border-b border-[#dcd6de] px-1 text-xs" /></label>
          <label className="grid gap-1 text-[10px] text-[#625a65]">Category<select required disabled={!categories.length} value={draft.categoryId} onChange={(event) => setDraft({ ...draft, categoryId: event.currentTarget.value })} className="h-10 border-b border-[#dcd6de] bg-white px-1 text-xs"><option value="">{categories.length ? "Choose category" : "Create a category first"}</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
          <label className="grid gap-1 text-[10px] text-[#625a65]">Description<textarea rows={3} value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.currentTarget.value })} className="border-b border-[#dcd6de] px-1 py-2 text-xs" /></label>
          <div className="grid grid-cols-2 gap-3">{(["price", "material", "purity", "weight", "gemstone"] as const).map((field) => <label key={field} className="grid gap-1 text-[10px] capitalize text-[#625a65]">{field}{field === "price" ? <input type="number" min="0" step="0.01" value={draft.price ?? ""} onChange={(event) => setDraft({ ...draft, price: event.currentTarget.value ? Number(event.currentTarget.value) : null })} className="h-10 border-b border-[#dcd6de] px-1 text-xs" /> : <input value={draft[field]} onChange={(event) => setDraft({ ...draft, [field]: event.currentTarget.value })} className="h-10 border-b border-[#dcd6de] px-1 text-xs" />}</label>)}</div>
          <label className="grid gap-1 text-[10px] text-[#625a65]">Jewellery images<input type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple onChange={(event) => setImages(Array.from(event.currentTarget.files ?? []))} className="py-2 text-xs" /><span className="text-[10px] text-[#827985]">Uploads require server-side Cloudinary configuration. JPEG, PNG, WebP, or AVIF; up to 8 MB each.</span></label>
          {editingId && products.find((item) => item.id === editingId)?.images.length ? <div><p className="mb-2 text-[10px] font-medium text-[#625a65]">Current images</p><div className="grid grid-cols-3 gap-2 sm:grid-cols-4">{products.find((item) => item.id === editingId)?.images.map((image, index) => <figure key={image.id} className="relative"><ProductImage src={image.url} alt={image.altText || `${draft.name} image ${index + 1}`} className="product-thumb overflow-hidden border border-[#eeeaf0]" /><button type="button" disabled={busy} onClick={() => void removeProductImage(products.find((item) => item.id === editingId)!, image.id)} aria-label={`Remove image ${index + 1}`} className="absolute right-1 top-1 grid size-7 place-items-center rounded-full bg-white/95 text-[#6b3340] shadow disabled:opacity-50"><X size={14} /></button><figcaption className="mt-1 truncate text-[9px] text-[#827985]">{image.altText || `Image ${index + 1}`}</figcaption></figure>)}</div></div> : null}
          {images.length > 0 && <div><p className="mb-2 text-[10px] font-medium text-[#625a65]">New image preview</p><div className="grid grid-cols-3 gap-2 sm:grid-cols-4">{imagePreviews.map((preview, index) => <figure key={`${images[index].name}-${index}`} className="relative"><ProductImage src={preview} alt={images[index].name} className="product-thumb overflow-hidden border border-[#eeeaf0]" /><figcaption className="mt-1 truncate text-[9px] text-[#827985]">{images[index].name}</figcaption></figure>)}</div><button type="button" onClick={() => setImages([])} className="mt-2 text-[10px] text-[#6b3340] underline">Clear selected images</button>{editingId && <label className="mt-2 flex items-center gap-2 text-[10px] text-[#514c53]"><input type="checkbox" checked={replaceImages} onChange={(event) => setReplaceImages(event.currentTarget.checked)} className="accent-[#43224e]" />Replace current images after the new uploads finish</label>}</div>}
          <div className="grid grid-cols-2 gap-2 text-xs">{([ ["availability", "Available"], ["isPublished", "Published on site"], ["isFeatured", "Featured"], ["isNewArrival", "New arrival"], ["isBestseller", "Bestseller selection"] ] as const).map(([field, label]) => <label key={field} className="flex items-center gap-2"><input type="checkbox" checked={draft[field]} onChange={(event) => setDraft({ ...draft, [field]: event.currentTarget.checked })} className="accent-[#43224e]" />{label}</label>)}</div>
          <button disabled={busy} className="mt-2 inline-flex min-h-11 items-center justify-center gap-2 bg-[#43224e] px-5 text-xs text-white disabled:opacity-60"><Upload size={15} />{busy ? "Saving…" : editingId ? "Save product" : "Create product"}</button>
          {editingId && <button type="button" onClick={resetDraft} className="text-xs text-[#716a75] underline">Cancel edit</button>}
        </form></section>
      </div>
    </main>
  );
}
