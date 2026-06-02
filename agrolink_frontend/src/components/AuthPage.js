
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "./ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

import { Leaf, ShoppingCart, Shield } from "lucide-react";
import API from "../api";
import Modal from "./ui/modal";

function AuthPage({ onLogin }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [selectedRole, setSelectedRole] = useState("farmer");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  
  const roleOptions = [
    {
      value: "farmer",
      label: "Farmer",
      Icon: Leaf,
      borderClass: "border-green-600",
      bgClass: "bg-green-50",
      textClass: "text-green-600",
    },
    {
      value: "buyer",
      label: "Buyer",
      Icon: ShoppingCart,
      borderClass: "border-blue-600",
      bgClass: "bg-blue-50",
      textClass: "text-blue-600",
    },
    {
      value: "admin",
      label: "Admin",
      Icon: Shield,
      borderClass: "border-purple-600",
      bgClass: "bg-purple-50",
      textClass: "text-purple-600",
    },
  ];

  const handleSubmit = async (e) => { 
    e.preventDefault(); 
    try { 
      if (activeTab === "login") { // 🔹 Login flow 
        const response = await API.post("token/", { username, password }); 
        console.log("Login response:", response.data);
        const accessToken = response.data.access;
        
        // Save tokens FIRST
        localStorage.setItem("accessToken", accessToken); 
        localStorage.setItem("refreshToken", response.data.refresh); 
        localStorage.setItem("userName", username); 
        
        // Fetch user role from backend using direct fetch
        try { 
          const meResponse = await fetch("http://127.0.0.1:8000/api/users/me/", {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${accessToken}`,
              "Content-Type": "application/json"
            }
          });
          
          if (meResponse.ok) {
            const userData = await meResponse.json();
            console.log("User data from backend:", userData);
            const actualRole = userData.role;
            console.log("User role from backend:", actualRole);
            localStorage.setItem("role", actualRole); 
          } else {
            console.error("Failed to fetch user:", meResponse.status);
            // fallback: use selectedRole from login tab 
            localStorage.setItem("role", selectedRole); 
          }
        } catch (err) { 
          console.error("Failed to fetch user role:", err);
          // fallback: use selectedRole from login tab 
          localStorage.setItem("role", selectedRole); 
        }
        
        setUsername(""); 
        setPassword(""); 
        setActiveTab("login"); 
        // Flip state in App.js and redirect 
        onLogin(); 
        navigate("/"); 
      } else if (activeTab === "signup") { 
        // 🔹 Signup flow 
        await API.post("users/", {
          username,
          password,
          role: selectedRole,
          first_name: fullName,
          email: "",
        });
        setShowSuccessModal(true);
      } 
    } catch (err) { 
      console.error("Auth error:", err.response?.data || err.message); 
      let errorMessage = 
        err.response?.data?.detail || 
        err.response?.data?.message || 
        err.message || 
        "Authentication failed. Please check your credentials."; 
      // If backend returned field errors object, show it clearly
      if (err.response?.data && typeof err.response.data === "object") {
        try {
          errorMessage = JSON.stringify(err.response.data);
        } catch (e) {
          /* ignore stringify error */
        }
      }
      alert(errorMessage); 
    } 
  };
  

  
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-8 items-center">
        <div className="hidden md:block">
          <div className="flex items-center gap-3 mb-6">

            <div className="w-16 h-16 bg-green-200 rounded-2xl flex items-center justify-center">
              <Leaf className="w-10 h-10 text-green-600" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">AgroLink AI</h1>
              <p className="text-gray-600">Smart Farmer-Business Connection Portal</p>
            </div>
          </div>

          <div className="space-y-4 mt-8">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-green-600 font-bold">1</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Connect Directly</h3>
                <p className="text-gray-600 text-sm">
                  No middlemen – farmers and buyers connect directly
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-blue-600 font-bold">2</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">AI-Powered Matching</h3>
                <p className="text-gray-600 text-sm">
                  Smart recommendations for best farmer-buyer pairs
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-purple-600 font-bold">3</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Fair Pricing</h3>
                <p className="text-gray-600 text-sm">
                  AI-based price suggestions for better deals
                </p>
              </div>
            </div>
          </div>
        </div>

        
        <Card className="w-full">
          <CardHeader>
            <div className="md:hidden flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <Leaf className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-xl">AgroLink AI</CardTitle>
              </div>
            </div>

            <CardTitle className="text-2xl">Welcome</CardTitle>
            <CardDescription>
              {activeTab === "login"
                ? "Sign in to your account"
                : "Create a new account to get started"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v)}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              
              <TabsContent value="login">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Select Your Role</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {roleOptions.map((option) => {
                        const { Icon, value, label, borderClass, bgClass, textClass } = option;
                        const isSelected = selectedRole === value;
                        return (
                          <button
                            key={value}
                            type="button"
                            onClick={() => setSelectedRole(value)}
                            className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center ${
                              isSelected ? `${borderClass} ${bgClass}` : "border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            <Icon className={`w-6 h-6 mx-auto mb-1 ${isSelected ? textClass : "text-gray-400"}`} />
                            <p className="text-xs font-medium text-gray-700">{label}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      type="text"
                      placeholder="Enter your username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
                    Sign In as {selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}
                  </Button>

                  
                </form>
              </TabsContent>

              
              <TabsContent value="signup">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input
                      type="text"
                      placeholder="Enter your full name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Username</Label>
                    <Input
                      type="text"
                      placeholder="Enter a unique username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Password</Label>
                    <Input
                      type="password"
                      placeholder="Create a strong password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Select Your Role</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {roleOptions.map((option) => {
                        const { Icon, value, label, borderClass, bgClass, textClass } = option;
                        const isSelected = selectedRole === value;
                        return (
                          <button
                            key={value}
                            type="button"
                            onClick={() => setSelectedRole(value)}
                            className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center ${
                              isSelected ? `${borderClass} ${bgClass}` : "border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            <Icon className={`w-6 h-6 mx-auto mb-1 ${isSelected ? textClass : "text-gray-400"}`} />
                            <p className="text-xs font-medium text-gray-700">{label}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
                    Create Account
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
      <Modal
        open={showSuccessModal}
        title="Account created"
        message="Account created successfully. You can now log in."
        onClose={() => {
          setShowSuccessModal(false);
          setActiveTab('login');
          setUsername('');
          setPassword('');
          setFullName('');
        }}
      />
    </div>
  );
}

export default AuthPage;
