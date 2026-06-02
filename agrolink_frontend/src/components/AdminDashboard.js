import React, { useEffect, useState } from "react";
import API from "../api";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Users, ShoppingCart, Shield, Phone, Mail } from "lucide-react";

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [farmers, setFarmers] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductDetails, setShowProductDetails] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;
    const headers = { Authorization: `Bearer ${token}` };

    const fetchData = async () => {
      try {
        const [usersRes, productsRes, farmersRes] = await Promise.all([
          API.get("users/", { headers }),
          API.get("products/", { headers }),
          API.get("farmers/", { headers }),
        ]);
        setUsers(usersRes.data || []);
        setProducts(productsRes.data || []);
        setFarmers(farmersRes.data || []);
      } catch (err) {
        console.error("Failed to fetch admin data", err);
      }
    };

    fetchData();
  }, []);

  const deleteUser = async (id) => {
    try {
      await API.delete(`users/${id}/`);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      console.error("Failed to delete user", err);
    }
  };

  const deleteProduct = async (id) => {
    try {
      await API.delete(`products/${id}/`);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error("Failed to delete product", err);
    }
  };

  const openProduct = (product) => {
    setSelectedProduct(product);
    setShowProductDetails(true);
  };

  const closeProductModal = () => {
    setSelectedProduct(null);
    setShowProductDetails(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold text-gray-900 mb-6">Welcome, Admin!</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Users</p>
              <p className="text-3xl font-bold">{users.length}</p>
            </div>
            <Users className="w-10 h-10 text-blue-600" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Farmers</p>
              <p className="text-3xl font-bold">{farmers.length}</p>
            </div>
            <Shield className="w-10 h-10 text-green-600" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Products</p>
              <p className="text-3xl font-bold">{products.length}</p>
            </div>
            <ShoppingCart className="w-10 h-10 text-purple-600" />
          </CardContent>
        </Card>
      </div>

      {/* User Management */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Manage Users</CardTitle>
          <CardDescription>View and delete users</CardDescription>
        </CardHeader>
        <CardContent>
          {users.map((user) => (
            <div key={user.id} className="flex items-center justify-between border-b py-2">
              <div>
                <p className="font-semibold">{user.username}</p>
                <Badge variant="outline" className="text-xs">
                  {user.role}
                </Badge>
              </div>
              <Button variant="destructive" size="sm" onClick={() => deleteUser(user.id)}>
                Delete
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Product Management */}
      <Card>
        <CardHeader>
          <CardTitle>Manage Products</CardTitle>
          <CardDescription>View and delete products</CardDescription>
        </CardHeader>
        <CardContent>
          {products.map((product) => (
            <div key={product.id} className="flex items-center justify-between border-b py-2">
              <div>
                <p className="font-semibold">{product.name}</p>
                {product.image && (
                  <img src={typeof product.image === 'string' ? product.image : product.image?.url} alt={product.name} className="w-40 h-24 object-cover rounded mb-2" />
                )}
                <p className="text-sm text-gray-600">
                  Farmer: {product.farmer_name || (product.farmer && (product.farmer.user || product.farmer.name || product.farmer)) || 'Unknown'}
                </p>
              </div>

              <div className="flex gap-2">
                <Button size="sm" variant="ghost" onClick={() => openProduct(product)}>
                  View
                </Button>
                <Button variant="destructive" size="sm" onClick={() => deleteProduct(product.id)}>
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {showProductDetails && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={closeProductModal} />
          <div className="bg-white rounded-lg max-w-2xl w-full z-10 p-6 overflow-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold">Product Details</h3>
              <Button variant="ghost" onClick={closeProductModal}>Close</Button>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-lg font-semibold">{selectedProduct.name}</h4>
                <p className="text-sm text-gray-600">{selectedProduct.description}</p>
              </div>

              <div className="p-4 border rounded-lg">
                <h5 className="font-semibold mb-2">Farmer Details</h5>
                <p>
                  <strong>Name:</strong> {selectedProduct.farmer?.user || selectedProduct.farmer_name || 'N/A'}
                </p>
                <p>
                  <strong>Location:</strong> {selectedProduct.farmer?.address || selectedProduct.farmer_location || 'N/A'}
                </p>
                <p>
                  <strong>Phone:</strong> {selectedProduct.farmer?.phone || 'N/A'}
                </p>
                <p>
                  <strong>Email:</strong> {selectedProduct.farmer?.email || 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
