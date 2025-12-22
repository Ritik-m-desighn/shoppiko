// context/CartContext.jsx
'use client';

import { createContext, useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext';

export const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useContext(AuthContext);

  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ LOAD CART (user-based)
  useEffect(() => {
    if (!user) {
      setCartItems([]);
      setLoading(false);
      return;
    }

    const key = `cart_${user._id}`;
    const storedCart = localStorage.getItem(key);

    if (storedCart) {
      setCartItems(JSON.parse(storedCart));
    } else {
      setCartItems([]);
    }

    setLoading(false);
  }, [user]);

  // ✅ SAVE CART (user-based)
  useEffect(() => {
    if (!loading && user) {
      localStorage.setItem(
        `cart_${user._id}`,
        JSON.stringify(cartItems)
      );
    }
  }, [cartItems, loading, user]);

  // 🛒 Cart actions
  const addToCart = (product, quantity = 1) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.productId === product._id);

      if (existing) {
        return prev.map(item =>
          item.productId === product._id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }

      return [
        ...prev,
        {
          productId: product._id,
          title: product.title,
          price: product.price,
          imageUrl: product.imageUrl,
          stock: product.stock,
          quantity,
        },
      ];
    });
  };

  const removeFromCart = (productId) => {
    setCartItems(prev => prev.filter(item => item.productId !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    setCartItems(prev =>
      prev.map(item =>
        item.productId === productId
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => setCartItems([]);

  const totalItems = cartItems.reduce((a, i) => a + i.quantity, 0);
  const totalPrice = cartItems.reduce((a, i) => a + i.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice: totalPrice.toFixed(2),
        loading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
