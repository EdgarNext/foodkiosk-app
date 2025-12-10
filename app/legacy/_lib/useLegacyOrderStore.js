'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState
} from "react";

const LegacyOrderContext = createContext(null);

export function LegacyOrderProvider({ children }) {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [activeCategoryId, setActiveCategoryId] = useState(null);
  const [cart, setCart] = useState([]);
  const [lastAction, setLastAction] = useState("");

  const setCatalog = useCallback(({ categories, products }) => {
    setCategories(categories || []);
    setProducts(products || []);
    setActiveCategoryId(categories?.[0]?.id ?? null);
  }, []);

  const addToCart = useCallback((product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: (item.quantity ?? 1) + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((productId) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
    setLastAction("");
  }, []);

  const total = useMemo(
    () =>
      cart.reduce(
        (acc, item) => acc + (item.price ?? 0) * (item.quantity ?? 1),
        0
      ),
    [cart]
  );

  const value = useMemo(
    () => ({
      categories,
      products,
      activeCategoryId,
      setActiveCategoryId,
      cart,
      addToCart,
      removeFromCart,
      clearCart,
      total,
      lastAction,
      setLastAction,
      setCatalog
    }),
    [
      categories,
      products,
      activeCategoryId,
      cart,
      addToCart,
      removeFromCart,
      clearCart,
      total,
      lastAction,
      setCatalog
    ]
  );

  return (
    <LegacyOrderContext.Provider value={value}>
      {children}
    </LegacyOrderContext.Provider>
  );
}

export function useLegacyOrderStore(selector) {
  const context = useContext(LegacyOrderContext);
  if (!context) {
    throw new Error("useLegacyOrderStore debe usarse dentro de LegacyOrderProvider");
  }
  return selector ? selector(context) : context;
}
