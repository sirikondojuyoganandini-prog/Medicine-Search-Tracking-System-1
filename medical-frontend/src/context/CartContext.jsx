import { createContext, useContext, useState, useEffect } from 'react';
import { useNotification } from './NotificationContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { showToast } = useNotification();
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem('meditrack_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [activeShop, setActiveShop] = useState(() => {
    const saved = localStorage.getItem('meditrack_cart_shop');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    localStorage.setItem('meditrack_cart', JSON.stringify(items));
    localStorage.setItem('meditrack_cart_shop', JSON.stringify(activeShop));
  }, [items, activeShop]);

  const addToCart = (medicine, quantity = 1, shopInfo = null) => {
    const targetShop = shopInfo || (medicine.shopId?._id ? medicine.shopId : null);
    const targetShopId = targetShop?._id ? targetShop._id.toString() : targetShop?.toString();

    // Check if adding from a different pharmacy
    if (activeShop && targetShopId && activeShop._id.toString() !== targetShopId && items.length > 0) {
      const confirmSwitch = window.confirm(
        `Your cart already contains medicines from "${activeShop.shopName}". Each order is fulfilled by one pharmacy.\n\nDo you want to clear your current cart and start ordering from "${targetShop.shopName || 'this pharmacy'}"?`
      );
      if (!confirmSwitch) return false;
      // Clear cart
      setItems([]);
      setActiveShop(targetShop);
    } else if (!activeShop && targetShop) {
      setActiveShop(targetShop);
    }

    const effectivePrice = medicine.discountPrice > 0 ? medicine.discountPrice : medicine.price;
    const existingIndex = items.findIndex((item) => item.medicineId === medicine._id);

    if (existingIndex > -1) {
      const existing = items[existingIndex];
      const newQty = existing.quantity + quantity;
      if (newQty > medicine.stock) {
        showToast(`Cannot add more. Available stock is ${medicine.stock}`, 'error');
        return false;
      }
      const updated = [...items];
      updated[existingIndex] = {
        ...existing,
        quantity: newQty,
        subtotal: Math.round(newQty * effectivePrice * 100) / 100,
      };
      setItems(updated);
      showToast(`Updated "${medicine.name}" quantity to ${newQty}`, 'success');
    } else {
      if (quantity > medicine.stock) {
        showToast(`Requested quantity exceeds available stock (${medicine.stock})`, 'error');
        return false;
      }
      const newItem = {
        medicineId: medicine._id,
        name: medicine.name,
        price: effectivePrice,
        originalPrice: medicine.price,
        quantity: quantity,
        maxStock: medicine.stock,
        dosageForm: medicine.dosageForm,
        subtotal: Math.round(quantity * effectivePrice * 100) / 100,
        shopId: targetShopId,
        shopName: targetShop?.shopName || 'Pharmacy',
      };
      setItems([...items, newItem]);
      showToast(`Added "${medicine.name}" to cart`, 'success');
    }
    return true;
  };

  const updateQuantity = (medicineId, newQty) => {
    if (newQty <= 0) {
      removeFromCart(medicineId);
      return;
    }
    setItems((prev) =>
      prev.map((item) => {
        if (item.medicineId === medicineId) {
          if (newQty > item.maxStock) {
            showToast(`Available stock limit is ${item.maxStock}`, 'error');
            return item;
          }
          return {
            ...item,
            quantity: newQty,
            subtotal: Math.round(newQty * item.price * 100) / 100,
          };
        }
        return item;
      })
    );
  };

  const removeFromCart = (medicineId) => {
    const remaining = items.filter((item) => item.medicineId !== medicineId);
    setItems(remaining);
    if (remaining.length === 0) {
      setActiveShop(null);
    }
    showToast('Item removed from cart', 'info');
  };

  const clearCart = () => {
    setItems([]);
    setActiveShop(null);
  };

  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = items.reduce((sum, item) => sum + item.subtotal, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        activeShop,
        cartCount,
        cartTotal: Math.round(cartTotal * 100) / 100,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
