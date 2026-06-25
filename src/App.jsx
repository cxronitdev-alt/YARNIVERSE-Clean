import { useState } from "react";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import TopBar from "./components/layouts/TopBar";
import Navbar from "./components/layouts/Navbar";
import AuthModal from "./Pages/Auth/AuthModal.jsx";
import Footer from "./components/layouts/Footer";
import ScrollToTop from "./components/shared/ScrollToTop";
import { AuthProvider } from "./context/AuthContext";
import { WishlistProvider } from "./context/WishlistContext.jsx";
import { CartProvider } from "./context/CartContext.jsx";
import { CurrencyProvider } from "./context/CurrencyContext.jsx"; // 👈 Imported

function App() {
  const [showAuth, setShowAuth] = useState(false);

  return (
    <AuthProvider>
      {/* 🚀 CurrencyProvider ko yaha rakha taaki TopBar ko live rates mil sakein */}
      <CurrencyProvider>
        {/* CartProvider humesha WishlistProvider ke upar hona chahiye */}
        <CartProvider>
          <WishlistProvider>
            <BrowserRouter>
              {/* 🚀 PERFECT PLACE: Browser Router ke theek niche */}
              <ScrollToTop /> 

              <TopBar />
              <Navbar openAuth={() => setShowAuth(true)} />
              <AppRoutes />
              
              {showAuth && (
                <AuthModal closeModal={() => setShowAuth(false)} />
              )}
              
              <Footer />
            </BrowserRouter>
          </WishlistProvider>
        </CartProvider>
      </CurrencyProvider>
    </AuthProvider>
  );
}

export default App;