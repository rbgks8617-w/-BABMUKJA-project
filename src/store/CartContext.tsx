import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { CartItem, MenuOption } from "../types/app";

type AddToCartInput = Omit<CartItem, "cartId" | "unitPrice" | "totalPrice">;

type CartContextValue = {
  cartItems: CartItem[];
  totalPrice: number;
  totalQuantity: number;
  addToCart: (item: AddToCartInput) => void;
  changeCartItemQuantity: (cartId: string, amount: number) => void;
  removeFromCart: (cartId: string) => void;
  splitCartItemWithOptions: (cartId: string, nextSelectedOptions?: MenuOption[]) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function normalizeOptions(options: MenuOption[] = []) {
  return [...options].sort((a, b) => a.id.localeCompare(b.id));
}

function createCartKey(menuId: string, selectedOptions: MenuOption[] = []) {
  const optionKey = normalizeOptions(selectedOptions)
    .map((option) => option.id)
    .join("|");

  return `${menuId}::${optionKey}`;
}

function getUnitPrice(item: Pick<CartItem, "basePrice" | "selectedOptions">) {
  const optionTotal = item.selectedOptions.reduce((sum, option) => sum + option.price, 0);
  return item.basePrice + optionTotal;
}

function withCalculatedTotal<T extends Omit<CartItem, "unitPrice" | "totalPrice">>(item: T): CartItem {
  const unitPrice = getUnitPrice(item);
  const quantity = Math.max(1, item.quantity);

  return {
    ...item,
    quantity,
    unitPrice,
    totalPrice: unitPrice * quantity,
  };
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const addToCart = useCallback((item: AddToCartInput) => {
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
  }, []);

  const changeCartItemQuantity = useCallback((cartId: string, amount: number) => {
    setCartItems((prevItems) =>
      prevItems.map((item) => {
        if (item.cartId !== cartId) {
          return item;
        }

        return withCalculatedTotal({
          ...item,
          quantity: Math.max(1, item.quantity + amount),
        });
      }),
    );
  }, []);

  const removeFromCart = useCallback((cartId: string) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.cartId !== cartId));
  }, []);

  const splitCartItemWithOptions = useCallback((cartId: string, nextSelectedOptions: MenuOption[] = []) => {
    const selectedOptions = normalizeOptions(nextSelectedOptions);

    setCartItems((prevItems) => {
      const sourceItem = prevItems.find((item) => item.cartId === cartId);

      if (!sourceItem) {
        return prevItems;
      }

      const nextCartId = createCartKey(sourceItem.menuId, selectedOptions);

      if (nextCartId === cartId) {
        return prevItems;
      }

      const splitItem = withCalculatedTotal({
        ...sourceItem,
        cartId: nextCartId,
        selectedOptions,
        quantity: 1,
      });
      let mergedIntoExistingItem = false;
      const nextItems: CartItem[] = [];

      prevItems.forEach((item) => {
        if (item.cartId === cartId) {
          if (item.quantity > 1) {
            nextItems.push(withCalculatedTotal({ ...item, quantity: item.quantity - 1 }));
          }
          return;
        }

        if (item.cartId === nextCartId) {
          mergedIntoExistingItem = true;
          nextItems.push(withCalculatedTotal({ ...item, quantity: item.quantity + 1 }));
          return;
        }

        nextItems.push(item);
      });

      return mergedIntoExistingItem ? nextItems : [...nextItems, splitItem];
    });
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const totalPrice = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.totalPrice, 0),
    [cartItems],
  );

  const totalQuantity = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems],
  );

  const value = useMemo(
    () => ({
      cartItems,
      totalPrice,
      totalQuantity,
      addToCart,
      changeCartItemQuantity,
      removeFromCart,
      splitCartItemWithOptions,
      clearCart,
    }),
    [
      addToCart,
      cartItems,
      changeCartItemQuantity,
      clearCart,
      removeFromCart,
      splitCartItemWithOptions,
      totalPrice,
      totalQuantity,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return context;
}
