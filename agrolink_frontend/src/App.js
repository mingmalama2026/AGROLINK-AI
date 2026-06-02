import React, { useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import AuthPage from "./components/AuthPage";
import FarmerDashboard from "./components/FarmerDashboard";
import BuyerDashboard from "./components/BuyerDashboard";
import AdminDashboard from "./components/AdminDashboard";
import Navbar from "./components/Navbar";
import Farmers from "./components/Farmers";
import Products from "./components/Products";
import AddFarmer from "./components/AddFarmer";
import AddProduct from "./components/AddProduct";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("accessToken")
  );
  const [role, setRole] = useState(localStorage.getItem("role"));
  const [refreshFarmers, setRefreshFarmers] = useState(0);
  const [refreshProducts, setRefreshProducts] = useState(0);
  const navigate = useNavigate();

  const userName = localStorage.getItem("userName") || "User";

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("role");
    localStorage.removeItem("userName");
    setIsLoggedIn(false);
    setRole(null);
    navigate("/login");
  };

  return (
    <>
      {/* Navbar only visible when logged in */}
      {isLoggedIn && (
        <Navbar
          isLoggedIn={isLoggedIn}
          userName={userName}
          role={role}
          onLogout={handleLogout}
        />
      )}

      <Routes>
        {/* Login/Signup route */}
        <Route
          path="/login"
          element={
            <AuthPage
              onLogin={() => {
                setIsLoggedIn(true);
                setRole(localStorage.getItem("role")); // ✅ update role
                navigate("/"); // ✅ redirect to dashboard
              }}
            />
          }
        />

        {/* Dashboard route */}
        <Route
          path="/"
          element={
            isLoggedIn ? (
              role === "farmer" ? (
                <FarmerDashboard onLogout={handleLogout} />
              ) : role === "buyer" ? (
                <BuyerDashboard onLogout={handleLogout} />
              ) : role === "admin" ? (
                <AdminDashboard onLogout={handleLogout} />
              
              ) : (
                <div className="grid grid-cols-2 gap-6 p-6">
                  <div>
                    <Farmers refreshSignal={refreshFarmers} />
                    <AddFarmer
                      onFarmerAdded={() => setRefreshFarmers(Date.now())}
                    />
                  </div>
                  <div>
                    <Products refreshSignal={refreshProducts} />
                    <AddProduct
                      onProductAdded={() => setRefreshProducts(Date.now())}
                    />
                  </div>
                </div>
              )
            ) : (
              <AuthPage
                onLogin={() => {
                  setIsLoggedIn(true);
                  setRole(localStorage.getItem("role"));
                  navigate("/"); // ✅ redirect after login
                }}
              />
            )
          }
        />
      </Routes>
    </>
  );
}

export default App;
