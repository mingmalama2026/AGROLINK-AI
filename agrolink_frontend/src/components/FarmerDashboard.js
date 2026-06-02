import React, { useState, useEffect } from "react";
import API from "../api";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Plus, Sparkles, TrendingUp, Package, Users, X, LogOut } from "lucide-react";


function FarmerDashboard({ onLogout }) {
  const [products, setProducts] = useState([]);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("crops");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("kg");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [aiPrice, setAiPrice] = useState(null);
  const [farmerProfile, setFarmerProfile] = useState(null);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editPhone, setEditPhone] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editUsername, setEditUsername] = useState("");

  const userName = localStorage.getItem("userName") || "Farmer";

  // load products for this farmer on mount
  const fetchProducts = async () => {
    try {
      // prefer dedicated endpoint, fallback to full list
      let res;
      try {
        res = await API.get("products/mine/");
      } catch (e) {
        res = await API.get("products/");
      }
      // Handle either array response or paginated { results: [...] }
      const data = res.data || [];
      let all = [];
      if (Array.isArray(data)) all = data;
      else if (data.results && Array.isArray(data.results)) all = data.results;
      else all = [];

      // If we used /products/mine/ the response is already scoped
      if (Array.isArray(all)) {
        setProducts(all);
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error("Failed to load products:", err.response?.data || err.message);
    }
  };

  useEffect(() => {
    let mounted = true;
    if (mounted) {
      fetchProducts();
      fetchFarmerProfile();
    }
    return () => { mounted = false; };
  }, [userName]);

  const fetchFarmerProfile = async () => {
    try {
      try {
        const res = await API.get("farmers/me/");
        setFarmerProfile(res.data || null);
        return;
      } catch (e) {
        // fallback to listing farmers and matching by username
      }
      const res = await API.get("farmers/");
      const data = res.data || [];
      let list = [];
      if (Array.isArray(data)) list = data;
      else if (data.results && Array.isArray(data.results)) list = data.results;
      else list = [];
      const mine = list.find((f) => f.user === userName || (f.user && f.user.username === userName));
      if (mine) setFarmerProfile(mine);
      else setFarmerProfile(null);
    } catch (err) {
      console.error("Failed to load farmer profile:", err.response?.data || err.message);
    }
  };
  const mockBuyers = [
    {
      id: 1,
      name: "Fresh Mart Ltd",
      location: "Kathmandu",
      matchScore: 95,
      products: ["Vegetables", "Fruits"],
    },
    {
      id: 2,
      name: "Green Valley Shop",
      location: "Pokhara",
      matchScore: 87,
      products: ["Organic Crops"],
    },
  ];

  const handlePricePredict = () => {
    if (quantity && price && category) {
      const basePrices = {
        crops: 50,
        livestock: 5000,
        handicrafts: 100,
        processed: 200,
      };
      const predicted = basePrices[category] * (1 + Math.random() * 0.2);
      setAiPrice(predicted.toFixed(2));
    }
  };

  const handleAddProduct = async (e) => {
  e.preventDefault();
  try {
    const formData = new FormData();
    formData.append("name", name);
    formData.append("category", category);
    formData.append("unit", unit);
    formData.append("description", description);
    formData.append("quantity", quantity);
    formData.append("price", price);
    if (image) formData.append("image", image);

    // Let the browser/axios set the Content-Type (including boundary) for FormData
    let response;
    if (editingId) {
      // Edit existing product
      response = await API.patch(`products/${editingId}/`, formData);
    } else {
      // Create new product
      response = await API.post("products/", formData);
    }

    // Refresh list from server to avoid client-side state mismatches
    await fetchProducts();
    setShowAddProduct(false);
    setEditingId(null);
    resetForm();
  } catch (error) {
    console.error("Failed to add product:", error.response?.data || error.message);
    alert("Failed to add product. Check console for details.");
  }
};

  

  const resetForm = () => {
    setName("");
    setCategory("crops");
    setDescription("");
    setQuantity("");
    setUnit("kg");
    setPrice("");
    setImage(null);
    if (previewImage && previewImage.startsWith && previewImage.startsWith('blob:')) {
      try { URL.revokeObjectURL(previewImage); } catch (e) { /* ignore */ }
    }
    setPreviewImage(null);
    setAiPrice(null);
  };

  const stats = [
    {
      label: "Total Products",
      value: products.length,
      icon: Package,
      color: "text-green-600",
      bg: "bg-green-100",
    },
    {
      label: "Verified Products",
      value: products.filter((p) => p.verified).length,
      icon: Sparkles,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      label: "Potential Buyers",
      value: mockBuyers.length,
      icon: Users,
      color: "text-purple-600",
      bg: "bg-purple-100",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome, {userName}!</h2>
          <p className="text-gray-600">Manage your products and connect with buyers</p>
          <div className="mt-2 text-sm text-gray-700">
            <span className="mr-4"><strong>Phone:</strong> {farmerProfile?.phone || 'N/A'}</span>
            <span><strong>Address:</strong> {farmerProfile?.address || 'N/A'}</span>
          </div>
        </div>
        <div>
          <Button className="bg-blue-600 hover:bg-blue-700 mr-2" onClick={() => {
            setEditPhone(farmerProfile?.phone || '');
            setEditAddress(farmerProfile?.address || '');
            setEditEmail(farmerProfile?.email || localStorage.getItem('userEmail') || '');
            setEditUsername(farmerProfile?.user || localStorage.getItem('userName') || '');
            setShowEditProfile(true);
          }}>Edit Profile</Button>
        </div>
        
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 ${stat.bg} rounded-lg flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* AI Recommended Buyers */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <CardTitle>AI Recommended Buyers for You</CardTitle>
          </div>
          <CardDescription>
            These buyers are looking for products similar to yours
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockBuyers.map((buyer) => (
              <div
                key={buyer.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-900">{buyer.name}</h4>
                    <span className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                      {buyer.matchScore}% Match
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{buyer.location}</p>
                  {buyer.products && (
                    <div className="flex gap-1 flex-wrap">
                      {buyer.products.map((product) => (
                        <span
                          key={product}
                          className="inline-block px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded"
                        >
                          {product}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 ml-4 whitespace-nowrap"
                  onClick={() => alert(`View buyer profile: ${buyer.name}`)}
                >
                  View Profile
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* My Products Section */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">My Products</h3>
          <p className="text-gray-600">Manage and track your product listings</p>
        </div>
        <Button
          className="gap-2 bg-green-600 hover:bg-green-700"
          onClick={() => { resetForm(); setShowAddProduct(true); }}
        >
          <Plus className="w-4 h-4" />
          Add Product
        </Button>
      </div>

      {/* Add Product Modal */}
      {showAddProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{editingId ? 'Edit Product' : 'Add New Product'}</CardTitle>
                <CardDescription>
                  List your agricultural products, livestock, or handicrafts
                </CardDescription>
              </div>
              <button
                onClick={() => {
                  setShowAddProduct(false);
                  resetForm();
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleAddProduct} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Product Name</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Fresh Tomatoes"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <select
                      id="category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="crops">Crops/Vegetables</option>
                      <option value="livestock">Livestock</option>
                      <option value="handicrafts">Handicrafts</option>
                      <option value="processed">Processed Foods</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="unit">Unit</Label>
                    <select
                      id="unit"
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="kg">Kilograms (kg)</option>
                      <option value="liters">Liters</option>
                      <option value="pieces">Pieces</option>
                      <option value="animals">Animals</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <textarea
                    id="description"
                    placeholder="Describe your product in detail..."
                    rows="3"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity Available</Label>
                    <Input
                      id="quantity"
                      type="number"
                      placeholder="0"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price">Your Price (NPR per {unit})</Label>
                    <Input
                      id="price"
                      type="number"
                      placeholder="0"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image">Product Image</Label>
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      setImage(file || null);
                      if (file) {
                        // revoke previous blob if needed
                        if (previewImage && previewImage.startsWith && previewImage.startsWith('blob:')) {
                          try { URL.revokeObjectURL(previewImage); } catch (e) {}
                        }
                        const url = URL.createObjectURL(file);
                        setPreviewImage(url);
                      } else {
                        if (previewImage && previewImage.startsWith && previewImage.startsWith('blob:')) {
                          try { URL.revokeObjectURL(previewImage); } catch (e) {}
                        }
                        setPreviewImage(null);
                      }
                    }}
                  />
                  {previewImage && (
                    <img src={previewImage} alt="preview" className="w-full h-40 object-cover rounded-lg mt-2" />
                  )}
                </div>

                {/* AI Price Recommendation */}
                <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                    <h4 className="font-semibold text-gray-900">AI Price Suggestion</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Get AI-powered price recommendations based on market data
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePricePredict}
                    disabled={!quantity || !price || !category}
                    className="w-full gap-2 border-purple-300 hover:bg-purple-50"
                  >
                    <Sparkles className="w-4 h-4" />
                    Get AI Price Suggestion
                  </Button>
                  {aiPrice && (
                    <div className="mt-3 p-3 bg-white rounded border border-purple-300">
                      <p className="text-sm text-gray-600">Suggested Price:</p>
                      <p className="text-2xl font-bold text-purple-700">
                        NPR {parseFloat(aiPrice).toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Based on category, quantity, and current market trends
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowAddProduct(false);
                      resetForm();
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    {editingId ? 'Save Changes' : 'Add Product'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit Profile Modal */}
      {showEditProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="flex items-center justify-between">
              <div>
                <CardTitle>Edit Profile</CardTitle>
                <CardDescription>Update your phone number and address</CardDescription>
              </div>
              <button onClick={() => setShowEditProfile(false)} className="text-gray-500 hover:text-gray-700"><X className="w-5 h-5" /></button>
            </CardHeader>
            <CardContent>
              <form onSubmit={async (e) => {
                e.preventDefault();
                try {
                  // First update user info (username/email) if provided
                  const userPayload = {};
                  if (editUsername) userPayload.username = editUsername;
                  if (editEmail) userPayload.email = editEmail;
                  if (Object.keys(userPayload).length) {
                    try {
                      const userRes = await API.patch('users/me/', userPayload);
                      if (userRes?.data?.username) localStorage.setItem('userName', userRes.data.username);
                      if (userRes?.data?.email) localStorage.setItem('userEmail', userRes.data.email);
                    } catch (userErr) {
                      console.error('User update failed', userErr.response?.data || userErr.message);
                      alert('Failed to update user: ' + (userErr.response?.data ? JSON.stringify(userErr.response.data) : userErr.message));
                      return;
                    }
                  }

                  // Then update/create farmer profile via dedicated endpoint if available
                  try {
                    const farmerRes = await API.patch('farmers/me/', { phone: editPhone, address: editAddress });
                    if (farmerRes?.data) setFarmerProfile(farmerRes.data);
                  } catch (farmerErr) {
                    try {
                      if (!farmerProfile) {
                        const created = await API.post('farmers/', { phone: editPhone, address: editAddress });
                        if (created?.data) setFarmerProfile(created.data);
                      } else {
                        const patched = await API.patch(`farmers/${farmerProfile.id}/`, { phone: editPhone, address: editAddress });
                        if (patched?.data) setFarmerProfile(patched.data);
                      }
                    } catch (innerErr) {
                      console.error('Farmer update failed', innerErr.response?.data || innerErr.message);
                      alert('Failed to update farmer profile: ' + (innerErr.response?.data ? JSON.stringify(innerErr.response.data) : innerErr.message));
                      return;
                    }
                  }

                  // refresh products after profile change
                  await fetchProducts();
                  setShowEditProfile(false);
                } catch (error) {
                  console.error('Failed to save profile', error.response?.data || error.message);
                  alert('Failed to save profile: ' + (error.response?.data ? JSON.stringify(error.response.data) : error.message));
                }
              }} className="space-y-4">
                <div>
                  <Label>Username</Label>
                  <Input value={editUsername} onChange={(e) => setEditUsername(e.target.value)} placeholder="Username" />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input value={editEmail} onChange={(e) => setEditEmail(e.target.value)} placeholder="you@example.com" />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input value={editPhone} onChange={(e) => setEditPhone(e.target.value)} placeholder="e.g., +977-98xxxx" />
                </div>
                <div>
                  <Label>Address</Label>
                  <Input value={editAddress} onChange={(e) => setEditAddress(e.target.value)} placeholder="Your location" />
                </div>
                <div className="flex gap-3 pt-4">
                  <Button variant="outline" onClick={() => setShowEditProfile(false)} className="flex-1">Cancel</Button>
                  <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700">Save</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Products Grid */}
      {products.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((p) => (
            <Card key={p.id}>
              <CardContent className="p-6">
                {p.image && (
                  <img
                    src={typeof p.image === 'string' ? p.image : (p.image?.url || '')}
                    alt={p.name}
                    className="w-full h-40 object-cover rounded-lg mb-4"
                  />
                )}
                <h3 className="font-bold text-lg">{p.name}</h3>
                <span className="inline-block text-xs bg-green-100 text-green-700 px-2 py-1 rounded my-2">
                  {p.category || "Uncategorized"}
                </span>
                <p className="text-gray-600 text-sm mb-2">{p.description}</p>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs text-gray-500">Price per {p.unit || "unit"}</p>
                    <p className="text-green-700 font-bold">NPR {p.price}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Available</p>
                    <p className="text-gray-900 font-semibold">{p.quantity} {p.unit}</p>
                  </div>
                </div>
                <div className="mt-3 text-sm text-gray-600">
                  <p><strong>Seller:</strong> {p.farmer?.user || 'Unknown'}</p>
                  <p><strong>Phone:</strong> {p.farmer?.phone || p.farmer?.email || 'N/A'}</p>
                  <p><strong>Address:</strong> {p.farmer?.address || 'N/A'}</p>
                </div>
                <div className="mt-4 flex gap-2 justify-end">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      // open edit modal and populate form
                      setEditingId(p.id);
                      setName(p.name || '');
                      setCategory(p.category || 'crops');
                      setUnit(p.unit || 'kg');
                      setDescription(p.description || '');
                      setQuantity(p.quantity || '');
                      setPrice(p.price || '');
                      setImage(null);
                      // show existing product image if present
                      const img = p.image && (typeof p.image === 'string' ? p.image : p.image?.url || null);
                      setPreviewImage(img || null);
                      setShowAddProduct(true);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    className="bg-red-600 hover:bg-red-700"
                    onClick={async () => {
                      if (!window.confirm('Delete this product?')) return;
                      try {
                        await API.delete(`products/${p.id}/`);
                        await fetchProducts();
                      } catch (err) {
                        console.error('Delete failed', err.response?.data || err.message);
                        alert('Failed to delete product. See console.');
                      }
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No products yet</h3>
            <p className="text-gray-600 mb-4">
              Start by adding your first product to connect with buyers
            </p>
            <Button
              className="gap-2 bg-green-600 hover:bg-green-700"
              onClick={() => { resetForm(); setShowAddProduct(true); }}
            >
              <Plus className="w-4 h-4" />
              Add Your First Product
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default FarmerDashboard;
