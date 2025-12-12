'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState
} from "react";

const KioskOrderContext = createContext(null);

export function KioskOrderProvider({ children }) {
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
      resetFlow: () => {
        clearCart();
        setActiveCategoryId(categories?.[0]?.id ?? null);
      },
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
    <KioskOrderContext.Provider value={value}>
      {children}
    </KioskOrderContext.Provider>
  );
}

export function useKioskOrderStore(selector) {
  const context = useContext(KioskOrderContext);
  if (!context) {
    throw new Error("useKioskOrderStore debe usarse dentro de KioskOrderProvider");
  }
  return selector ? selector(context) : context;
}
