import { createContext, useContext, useState, useEffect } from "react";
// 👇 Apna useAuth import karein (Path apne hisaab se theek kar lena)
import { useAuth } from "./AuthContext"; 

const CartContext = createContext();

export function CartProvider({ children }) {
  const { user } = useAuth(); // Current logged-in user get karein
  
  // 🔥 FIX: Har user ke liye ek unique naam banayenge
  const cartKey = user ? `yarniverse_cart_${user.uid}` : "yarniverse_cart_guest";

  const [cartItems, setCartItems] = useState([]);
  const [openCart, setOpenCart] = useState(false);

  // ✅ NAYA: Jab bhi koi User Login ya Logout karega, uska apna cart load hoga
  useEffect(() => {
    const saved = localStorage.getItem(cartKey);
    if (saved) {
      setCartItems(JSON.parse(saved));
    } else {
      setCartItems([]); // Naye user ke liye bilkul khali cart
    }
  }, [cartKey]); // cartKey change hote hi ye wapas chalega

  // ✅ NAYA: Cart update hone par ussi specific user ke naam par save hoga
  useEffect(() => {
    localStorage.setItem(cartKey, JSON.stringify(cartItems));
  }, [cartItems, cartKey]);

  const parsePrice = (priceVal) => {
    if (!priceVal) return 0;
    if (typeof priceVal === "number") return priceVal;
    const cleanPrice = priceVal.toString().replace(/,/g, "").trim();
    const parsed = parseFloat(cleanPrice);
    return isNaN(parsed) ? 0 : parsed;
  };

  const addToCart = (product, openDrawer = true) => { 
    setCartItems((prev) => {
      const exists = prev.find((item) => item.id === product.id);
      if (exists) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });

    if (openDrawer) {
      setOpenCart(true); 
    }
  };

  const updateQuantity = (id, amount) => {
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newQty = item.quantity + amount;
          return newQty > 0 ? { ...item, quantity: newQty } : item;
        }
        return item;
      })
    );
  };

  const removeFromCart = (id) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getSubtotal = () => {
    return cartItems.reduce((acc, item) => {
      const actualPrice = parsePrice(item.price);
      return acc + (actualPrice * item.quantity);
    }, 0);
  };

  const getDiscount = () => getSubtotal() * 0.10; 
  const getTotalBill = () => getSubtotal() - getDiscount();

  return (
    <CartContext.Provider value={{ 
      cartItems, 
      addToCart, 
      updateQuantity, 
      removeFromCart, 
      clearCart, 
      openCart, 
      setOpenCart, 
      getSubtotal, 
      getDiscount, 
      getTotalBill, 
      parsePrice
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);