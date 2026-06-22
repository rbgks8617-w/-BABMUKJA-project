import React, { createContext, useContext, useMemo, useState } from "react";

const CartContext = createContext(null);

function normalizeOptions(options = []) {
  return [...options].sort((a, b) => a.id.localeCompare(b.id));
}

function createCartKey(menuId, selectedOptions = []) {
  const optionKey = normalizeOptions(selectedOptions)
    .map((option) => option.id)
    .join("|");

  return `${menuId}::${optionKey}`;
}

function getUnitPrice(item) {
  const optionTotal = item.selectedOptions.reduce((sum, option) => sum + option.price, 0);
  return item.basePrice + optionTotal;
}

function withCalculatedTotal(item) {
  const unitPrice = getUnitPrice(item);

  return {
    ...item,
    unitPrice,
    totalPrice: unitPrice * item.quantity,
  };
}

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);

  function addToCart(item) {
    const selectedOptions = normalizeOptions(item.selectedOptions);
    const cartId = createCartKey(item.menuId, selectedOptions);
    const normalizedItem = withCalculatedTotal({
      ...item,
      cartId,
      selectedOptions,
    });

    setCartItems((prevItems) => {
      const existingItem = prevItems.find((prevItem) => prevItem.cartId === cartId);

      if (!existingItem) {
        return [...prevItems, normalizedItem];
      }

      return prevItems.map((prevItem) => {
        if (prevItem.cartId !== cartId) {
          return prevItem;
        }

        return withCalculatedTotal({
          ...prevItem,
          quantity: prevItem.quantity + normalizedItem.quantity,
        });
      });
    });
  }

  function changeCartItemQuantity(cartId, amount) {
    setCartItems((prevItems) =>
      prevItems
        .map((item) => {
          if (item.cartId !== cartId) {
            return item;
          }

          return withCalculatedTotal({
            ...item,
            quantity: item.quantity + amount,
          });
        })
        .filter((item) => item.quantity > 0),
    );
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

  const totalQuantity = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems],
  );

  const value = {
    cartItems,
    totalPrice,
    totalQuantity,
    addToCart,
    changeCartItemQuantity,
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
