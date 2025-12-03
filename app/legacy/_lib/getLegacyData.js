import { categorias as legacyCategories } from "../../../react-quiosco/src/data/categorias";
import { productos as legacyProducts } from "../../../react-quiosco/src/data/productos";

export function getLegacyData() {
  const categories = legacyCategories.map((cat) => ({
    id: cat.id,
    name: cat.nombre,
    icon: `/legacy/img/icono_${cat.icono}.svg`
  }));

  const products = legacyProducts.map((product) => ({
    id: product.id,
    name: product.nombre,
    price: product.precio,
    categoryId: product.categoria_id,
    image: `/legacy/img/${product.imagen}.jpg`
  }));

  return { categories, products };
}
