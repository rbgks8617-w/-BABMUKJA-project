import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

type FavoriteContextValue = {
  favoriteMenuIds: string[];
  isFavoriteMenu: (menuId: string) => boolean;
  toggleFavoriteMenu: (menuId: string) => void;
};

const FavoriteContext = createContext<FavoriteContextValue | null>(null);

export function FavoriteProvider({ children }: { children: React.ReactNode }) {
  const [favoriteMenuIds, setFavoriteMenuIds] = useState<string[]>([]);

  const isFavoriteMenu = useCallback((menuId: string) => favoriteMenuIds.includes(menuId), [favoriteMenuIds]);

  const toggleFavoriteMenu = useCallback((menuId: string) => {
    setFavoriteMenuIds((currentIds) =>
      currentIds.includes(menuId)
        ? currentIds.filter((currentId) => currentId !== menuId)
        : [menuId, ...currentIds],
    );
  }, []);

  const value = useMemo<FavoriteContextValue>(
    () => ({
      favoriteMenuIds,
      isFavoriteMenu,
      toggleFavoriteMenu,
    }),
    [favoriteMenuIds, isFavoriteMenu, toggleFavoriteMenu],
  );

  return <FavoriteContext.Provider value={value}>{children}</FavoriteContext.Provider>;
}

export function useFavorites() {
  const context = useContext(FavoriteContext);

  if (!context) {
    throw new Error("useFavorites must be used within FavoriteProvider");
  }

  return context;
}
