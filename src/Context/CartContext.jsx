import React, { createContext, useState, useContext } from 'react';
import toast from 'react-hot-toast';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);

  const addToCart = (menuItem, quantity = 1) => {
    setItems((currentItems) => {
      const existingItem = currentItems.find(
        (item) => item.menu_item_id === menuItem.id
      );

      if (existingItem) {
        toast.success(`Updated ${menuItem.name} quantity`);
        return currentItems.map((item) =>
          item.menu_item_id === menuItem.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }

      toast.success(`Added ${menuItem.name} to cart`);
      return [
        ...currentItems,
        {
          menu_item_id: menuItem.id,
          name: menuItem.name,
          price: menuItem.price,
          quantity,
        },
      ];
    });
  };

  const removeFromCart = (menuItemId) => {
    setItems((currentItems) =>
      currentItems.filter((item) => item.menu_item_id !== menuItemId)
    );
    toast.success('Item removed from cart');
  };

  const updateQuantity = (menuItemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(menuItemId);
      return;
    }

    setItems((currentItems) =>
      currentItems.map((item) =>
        item.menu_item_id === menuItemId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const getTotal = () => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const getItemCount = () => {
    return items.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotal,
        getItemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};