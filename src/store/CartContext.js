import React, { createContext, useContext, useMemo, useState } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);

  function addToCart(item) {
    setCartItems((prevItems) => [...prevItems, { ...item, cartId: `${item.menuId}-${Date.now()}` }]);
  }

  function removeFromCart(cartId) {
    setCartItems((prevItems) => prevItems.filter((item) => item.cartId !== cartId));
  }

  function clearCart() {
    setCartItems([]);
  }

  const totalPrice = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.totalPrice, 0),
    [cartItems],
  );

  const value = {
    cartItems,
    totalPrice,
    addToCart,
    removeFromCart,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return context;
}
