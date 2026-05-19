import React, { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('CustomLab_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    localStorage.setItem('CustomLab_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (item) => {
    setCart((prevCart) => {
      // Para perfumes personalizados, pueden ser únicos. Para productos estándar, comprobamos el ID.
      const isCustom = !!item.customDetails;
      
      if (!isCustom) {
        const existingItemIndex = prevCart.findIndex((i) => i.id === item.id && !i.customDetails);
        if (existingItemIndex > -1) {
          const newCart = [...prevCart];
          newCart[existingItemIndex].quantity += (item.quantity || 1);
          return newCart;
        }
      }
      
      return [...prevCart, { ...item, quantity: item.quantity || 1 }];
    });
  };

  const removeFromCart = (index) => {
    setCart((prevCart) => prevCart.filter((_, i) => i !== index));
  };

  const updateQuantity = (index, delta) => {
    setCart((prevCart) => {
      const newCart = [...prevCart];
      const newQuantity = (newCart[index].quantity || 1) + delta;
      if (newQuantity > 0) {
        newCart[index].quantity = newQuantity;
        return newCart;
      }
      return prevCart;
    });
  };

  const clearCart = () => setCart([]);

  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      cartTotal,
      cartCount
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
