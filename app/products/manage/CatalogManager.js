"use client";

import { useEffect, useMemo, useState } from "react";
import Button from "../../_components/ui/Button";
import Card, { CardBody, CardHeader } from "../../_components/ui/Card";
import {
  createCategory,
  createProduct,
  deleteCategory,
  deleteProduct,
  fetchCategories,
  fetchProducts,
  getSupabaseStatus,
  uploadProductImage,
} from "../_lib/catalogApi";

const initialCategory = { name: "", description: "" };
const initialProduct = {
  name: "",
  price: "",
  description: "",
  category_id: "",
  sku: "",
  imageUrl: "",
  imageFile: null,
};

export default function CatalogManager() {
  const supabase = getSupabaseStatus();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [categoryForm, setCategoryForm] = useState(initialCategory);
  const [productForm, setProductForm] = useState(initialProduct);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [submittingCategory, setSubmittingCategory] = useState(false);
  const [submittingProduct, setSubmittingProduct] = useState(false);

  useEffect(() => {
    if (!supabase.hasConfig) return;
    void loadCategories();
    void loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase.hasConfig]);

  const categoriesById = useMemo(() => {
    return categories.reduce((map, cat) => {
      map[cat.id] = cat;
      return map;
    }, {});
  }, [categories]);

  const resetFeedback = () => {
    setStatusMessage("");
    setErrorMessage("");
  };

  const loadCategories = async () => {
    setLoadingCategories(true);
    const { data, error } = await fetchCategories();
    if (error) {
      setErrorMessage(error);
    } else {
      setCategories(data);
    }
    setLoadingCategories(false);
  };

  const loadProducts = async () => {
    setLoadingProducts(true);
    const { data, error } = await fetchProducts();
    if (error) {
      setErrorMessage(error);
    } else {
      setProducts(data);
    }
    setLoadingProducts(false);
  };

  const handleCategorySubmit = async (event) => {
    event.preventDefault();
    resetFeedback();
    setSubmittingCategory(true);

    if (!categoryForm.name.trim()) {
      setErrorMessage("La categoría necesita un nombre");
      setSubmittingCategory(false);
      return;
    }

    const payload = {
      name: categoryForm.name.trim(),
      description: categoryForm.description.trim() || null,
    };

    const { error } = await createCategory(payload);
    if (error) {
      setErrorMessage(error);
    } else {
      setStatusMessage("Categoría creada en Supabase");
      setCategoryForm(initialCategory);
      void loadCategories();
    }

    setSubmittingCategory(false);
  };

  const handleCategoryDelete = async (id) => {
    resetFeedback();
    const { error } = await deleteCategory(id);
    if (error) {
      setErrorMessage(error);
    } else {
      setStatusMessage("Categoría eliminada");
      void loadCategories();
      void loadProducts();
    }
  };

  const handleProductSubmit = async (event) => {
    event.preventDefault();
    resetFeedback();
    setSubmittingProduct(true);

    if (!productForm.name.trim()) {
      setErrorMessage("El producto necesita un nombre");
      setSubmittingProduct(false);
      return;
    }

    if (!productForm.category_id) {
      setErrorMessage("Selecciona una categoría para el producto");
      setSubmittingProduct(false);
      return;
    }

    const priceNumber = Number(productForm.price);
    const priceCents = Number.isFinite(priceNumber)
      ? Math.round(priceNumber * 100)
      : 0;

    let imageUrl = productForm.imageUrl.trim();
    if (productForm.imageFile) {
      const upload = await uploadProductImage(productForm.imageFile);
      if (upload.error) {
        setErrorMessage(upload.error);
        setSubmittingProduct(false);
        return;
      }
      imageUrl = upload.publicUrl ?? imageUrl;
    }

    const payload = {
      name: productForm.name.trim(),
      description: productForm.description.trim() || null,
      price_cents: Math.max(priceCents, 0),
      category_id: productForm.category_id,
      sku: productForm.sku.trim() || null,
      image_url: imageUrl || null,
      is_available: true,
    };

    const { error } = await createProduct(payload);
    if (error) {
      setErrorMessage(error);
    } else {
      setStatusMessage("Producto guardado en Supabase");
      setProductForm(initialProduct);
      void loadProducts();
    }

    setSubmittingProduct(false);
  };

  const handleProductDelete = async (id) => {
    resetFeedback();
    const { error } = await deleteProduct(id);
    if (error) {
      setErrorMessage(error);
    } else {
      setStatusMessage("Producto eliminado");
      void loadProducts();
    }
  };

  const selectedCategory = categoriesById[productForm.category_id];
  const formatPrice = (priceCents) => {
    const number = Number(priceCents || 0) / 100;
    return `$${number.toFixed(2)}`;
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <p className="text-sm text-text-soft">Carga de catálogo</p>
        <h1 className="text-2xl font-semibold">Productos en Supabase</h1>
        <p className="text-sm text-text-muted">
          Crea categorías primero y luego agrega productos con precios, fotos y
          SKU para tu kiosko.
        </p>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="px-2 py-1 rounded-full border border-border-subtle text-text-muted">
            URL: {supabase.supabaseUrl ? "configurada" : "faltante"}
          </span>
          <span className="px-2 py-1 rounded-full border border-border-subtle text-text-muted">
            Clave: {supabase.hasConfig ? "detectada" : "faltante"}
          </span>
          <span className="px-2 py-1 rounded-full border border-border-subtle text-text-muted">
            Bucket fotos: {supabase.bucketName}
          </span>
        </div>
        {!supabase.hasConfig ? (
          <div className="rounded-lg border border-border-subtle bg-app-soft px-3 py-2 text-sm text-text-muted">
            Añade NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY en tu
            entorno para escribir en Supabase desde esta pantalla.
          </div>
        ) : null}
        {statusMessage ? (
          <div className="rounded-lg border border-success bg-app-soft px-3 py-2 text-sm text-success">
            {statusMessage}
          </div>
        ) : null}
        {errorMessage ? (
          <div className="rounded-lg border border-danger bg-app-soft px-3 py-2 text-sm text-danger">
            {errorMessage}
          </div>
        ) : null}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <Card className="h-full">
          <CardHeader
            title="Crear categoría"
            subtitle="Agrupa productos y mantén tu catálogo ordenado"
          />
          <CardBody className="space-y-3">
            <form className="space-y-3" onSubmit={handleCategorySubmit}>
              <div className="space-y-1">
                <label className="text-sm font-medium">Nombre</label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-border-subtle bg-app-soft px-3 py-2 text-sm focus:border-brand focus:outline-none"
                  placeholder="Ej. Bebidas"
                  value={categoryForm.name}
                  onChange={(e) =>
                    setCategoryForm({ ...categoryForm, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Descripción</label>
                <textarea
                  className="w-full rounded-lg border border-border-subtle bg-app-soft px-3 py-2 text-sm focus:border-brand focus:outline-none"
                  placeholder="Notas internas"
                  value={categoryForm.description}
                  onChange={(e) =>
                    setCategoryForm({
                      ...categoryForm,
                      description: e.target.value,
                    })
                  }
                  rows={3}
                />
              </div>
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={submittingCategory || !supabase.hasConfig}
                >
                  {submittingCategory ? "Guardando..." : "Guardar categoría"}
                </Button>
              </div>
            </form>

            <div className="pt-3 border-t border-border-subtle">
              <p className="text-sm font-medium mb-2">Categorías creadas</p>
              {loadingCategories ? (
                <p className="text-sm text-text-muted">Cargando...</p>
              ) : categories.length === 0 ? (
                <p className="text-sm text-text-muted">
                  Crea tu primera categoría para asignar productos.
                </p>
              ) : (
                <ul className="space-y-2 text-sm">
                  {categories.map((cat) => (
                    <li
                      key={cat.id}
                      className="flex items-center justify-between rounded-lg border border-border-subtle bg-app-soft px-3 py-2 gap-3"
                    >
                      <div>
                        <p className="font-semibold">{cat.name}</p>
                        {cat.description ? (
                          <p className="text-xs text-text-muted">
                            {cat.description}
                          </p>
                        ) : null}
                      </div>
                      <div className="flex items-center gap-2">
                        {typeof cat.sort_order === "number" ? (
                          <span className="text-xs text-text-soft">
                            Orden {cat.sort_order}
                          </span>
                        ) : null}
                        <Button
                          variant="ghost"
                          className="px-2 py-1 text-xs"
                          type="button"
                          onClick={() => handleCategoryDelete(cat.id)}
                          disabled={!supabase.hasConfig}
                        >
                          Eliminar
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </CardBody>
        </Card>

        <Card className="h-full">
          <CardHeader
            title="Agregar producto"
            subtitle="Asigna categoría, precio y foto"
          />
          <CardBody className="space-y-4">
            <form className="space-y-3" onSubmit={handleProductSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Nombre</label>
                  <input
                    type="text"
                    className="w-full rounded-lg border border-border-subtle bg-app-soft px-3 py-2 text-sm focus:border-brand focus:outline-none"
                    placeholder="Ej. Combo Clásico"
                    value={productForm.name}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        name: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Precio</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="w-full rounded-lg border border-border-subtle bg-app-soft px-3 py-2 text-sm focus:border-brand focus:outline-none"
                    placeholder="120.00"
                    value={productForm.price}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        price: e.target.value,
                      })
                    }
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Categoría</label>
                  <select
                    className="w-full rounded-lg border border-border-subtle bg-app-soft px-3 py-2 text-sm focus:border-brand focus:outline-none"
                    value={productForm.category_id}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        category_id: e.target.value,
                      })
                    }
                    required
                  >
                    <option value="">Selecciona</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  {selectedCategory?.description ? (
                    <p className="text-xs text-text-muted">
                      {selectedCategory.description}
                    </p>
                  ) : null}
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium">SKU (opcional)</label>
                  <input
                    type="text"
                    className="w-full rounded-lg border border-border-subtle bg-app-soft px-3 py-2 text-sm focus:border-brand focus:outline-none"
                    placeholder="SKU interno"
                    value={productForm.sku}
                    onChange={(e) =>
                      setProductForm({ ...productForm, sku: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">Descripción</label>
                <textarea
                  className="w-full rounded-lg border border-border-subtle bg-app-soft px-3 py-2 text-sm focus:border-brand focus:outline-none"
                  placeholder="Ingredientes, tamaño o notas del cliente"
                  value={productForm.description}
                  onChange={(e) =>
                    setProductForm({
                      ...productForm,
                      description: e.target.value,
                    })
                  }
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Imagen (archivo)</label>
                  <input
                    type="file"
                    accept="image/*"
                    className="w-full text-sm"
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        imageFile: e.target.files?.[0] ?? null,
                      })
                    }
                  />
                  <p className="text-xs text-text-muted">
                    Se sube al bucket {supabase.bucketName} (se crea la URL
                    pública).
                  </p>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Imagen (URL)</label>
                  <input
                    type="url"
                    className="w-full rounded-lg border border-border-subtle bg-app-soft px-3 py-2 text-sm focus:border-brand focus:outline-none"
                    placeholder="https://..."
                    value={productForm.imageUrl}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        imageUrl: e.target.value,
                      })
                    }
                  />
                  <p className="text-xs text-text-muted">
                    Si eliges archivo, esta URL se reemplaza automáticamente.
                  </p>
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={submittingProduct || !supabase.hasConfig}
                >
                  {submittingProduct ? "Guardando..." : "Guardar producto"}
                </Button>
              </div>
            </form>

            <div className="pt-3 border-t border-border-subtle">
              <p className="text-sm font-medium mb-2">Productos creados</p>
              {loadingProducts ? (
                <p className="text-sm text-text-muted">Cargando...</p>
              ) : products.length === 0 ? (
                <p className="text-sm text-text-muted">
                  Aún no hay productos. Guarda el primero para verlo aquí.
                </p>
              ) : (
                <ul className="space-y-2 text-sm max-h-80 overflow-auto pr-1">
                  {products.map((prod) => (
                    <li
                      key={prod.id}
                      className="rounded-lg border border-border-subtle bg-app-soft px-3 py-2 flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <p className="font-semibold truncate">{prod.name}</p>
                        <p className="text-xs text-text-muted truncate">
                          {prod.categories?.name || "Sin categoría"}
                        </p>
                      </div>
                      <div className="text-right min-w-[80px]">
                        <p className="font-semibold">{formatPrice(prod.price_cents)}</p>
                        {prod.is_available === false ? (
                          <p className="text-[11px] uppercase text-warning">
                            No disponible
                          </p>
                        ) : null}
                      </div>
                      <Button
                        variant="ghost"
                        className="px-2 py-1 text-xs"
                        type="button"
                        onClick={() => handleProductDelete(prod.id)}
                        disabled={!supabase.hasConfig}
                      >
                        Eliminar
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
