// src/components/BuyerDashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import API from "../api"; // your axios instance
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  ShoppingCart,
  Sparkles,
  MapPin,
  Search,
  Filter,
  Phone,
  Mail,
} from "lucide-react";

function ProductCard({ product, onContact, onView }) {
  return (
    <div className="border rounded-lg p-4 flex flex-col h-full">
      <div className="flex-1">
        {product.image && (
          <img src={typeof product.image === 'string' ? product.image : product.image?.url} alt={product.name} className="w-full h-40 object-cover rounded mb-3" />
        )}
        <h4 className="font-semibold text-gray-900">{product.name}</h4>
        {product.description && (
          <p className="text-sm text-gray-600 mt-1">{product.description}</p>
        )}
      </div>
      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm font-medium text-gray-800">
          {product.price ? `Rs.${product.price}` : "Price N/A"}
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={onView}>
            View
          </Button>
          <Button variant="outline" size="sm" onClick={onContact}>
            Contact
          </Button>
        </div>
      </div>
    </div>
  );
}

function BuyerDashboard({ onLogout }) {
  const [products, setProducts] = useState([]);
  const [farmers, setFarmers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductDetails, setShowProductDetails] = useState(false);

  const stats = [
    { label: "Products", value: products.length, bg: "bg-green-100", color: "text-green-600" },
    { label: "Farmers", value: farmers.length, bg: "bg-blue-100", color: "text-blue-600" },
    { label: "Saved", value: 0, bg: "bg-purple-100", color: "text-purple-600" },
  ];

  const aiRecommendations = useMemo(() => {
    const byFarmer = farmers.map((f) => ({
      ...f,
      products: products.filter((p) => p.farmer === f.id).slice(0, 3).map((p) => p.name),
      matchScore: Math.min(95, Math.floor(Math.random() * 40) + 60),
    }));
    return byFarmer.slice(0, 3);
  }, [farmers, products]);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    const headers = { Authorization: `Bearer ${token}` };

    const fetchProducts = async () => {
      try {
        const res = await API.get("products/", { headers });
        setProducts(res.data);
      } catch (err) {
        console.error("Failed to fetch products", err);
      }
    };

    const fetchFarmers = async () => {
      try {
        const res = await API.get("farmers/", { headers });
        setFarmers(res.data);
      } catch (err) {
        console.error("Failed to fetch farmers", err);
      }
    };

    fetchProducts();
    fetchFarmers();
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const q = searchQuery.trim().toLowerCase();
      if (q) {
        const farmerName = (farmers.find((f) => f.id === p.farmer)?.name || "").toLowerCase();
        const matchesSearch =
          p.name.toLowerCase().includes(q) ||
          (p.description || "").toLowerCase().includes(q) ||
          farmerName.includes(q) ||
          String(p.price).includes(q);
        if (!matchesSearch) return false;
      }

      if (categoryFilter !== "all") {
        if ((p.category || "uncategorized") !== categoryFilter) return false;
      }

      if (locationFilter !== "all") {
        const farmer = farmers.find((f) => f.id === p.farmer);
        const farmerLocation = (farmer?.location || "").toLowerCase();
        if (locationFilter !== farmerLocation) return false;
      }

      return true;
    });
  }, [products, farmers, searchQuery, categoryFilter, locationFilter]);

  const openProduct = (product) => {
    setSelectedProduct(product);
    setShowProductDetails(true);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setCategoryFilter("all");
    setLocationFilter("all");
  };

  const getFarmerContact = (product) => {
    // If product contains nested farmer object (from updated ProductSerializer), use it
    if (product.farmer && typeof product.farmer === 'object') {
      return {
        name: product.farmer.user || product.farmer.name || 'Unknown',
        location: product.farmer.address || product.farmer.location || 'Unknown',
        phone: product.farmer.phone || '',
        email: product.farmer.email || '',
      };
    }

    const farmer = farmers.find((f) => f.id === product.farmer) || {};
    return {
      name: farmer.user || farmer.name || product.farmer_name || 'Unknown',
      location: farmer.address || farmer.location || product.farmer_location || 'Unknown',
      phone: farmer.phone || product.farmer_phone || '',
      email: farmer.email || product.farmer_email || '',
    };
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome, {localStorage.getItem("userName") || "Buyer"}!
        </h2>
        <p className="text-gray-600">Find and contact verified farmers directly</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 ${stat.bg} rounded-lg flex items-center justify-center`}>
                  <ShoppingCart className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <CardTitle>AI Recommended Farmers for You</CardTitle>
          </div>
          <CardDescription>Based on product availability and location</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {aiRecommendations.map((farmer) => (
              <div
                key={farmer.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-900">{farmer.name}</h4>
                    <span className="text-xs bg-gray-200 text-gray-800 px-2 py-1 rounded">
                      {farmer.matchScore}% Match
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <MapPin className="w-4 h-4" />
                    <span>{farmer.location}</span>
                  </div>
                  {farmer.products && (
                    <div className="flex gap-1 flex-wrap">
                      {farmer.products.map((product) => (
                        <span key={product} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded border border-gray-300">
                          {product}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() =>
                      window.alert(
                        `Contact ${farmer.name}\nLocation: ${farmer.location}\nUse product list to view phone/email.`
                      )
                    }
                  >
                    View Profile
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">All Categories</option>
                <option value="crops">Crops/Vegetables</option>
                <option value="livestock">Livestock</option>
                <option value="handicrafts">Handicrafts</option>
                <option value="processed">Processed Foods</option>
              </select>
            </div>

            <div>
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">All Locations</option>
                {Array.from(new Set(farmers.map((f) => (f.location || "unknown").toLowerCase()))).map((loc) => (
                  <option key={loc} value={loc}>
                    {loc.charAt(0).toUpperCase() + loc.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {(searchQuery || categoryFilter !== "all" || locationFilter !== "all") && (
            <div className="mt-4 flex items-center gap-2">
              <p className="text-sm text-gray-600">
                Found {filteredProducts.length} product{filteredProducts.length !== 1 ? "s" : ""}
              </p>
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Available Products</h3>
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onContact={() => {
                  const contact = getFarmerContact(product);
                  setSelectedProduct({ ...product, farmer_contact: contact });
                  setShowProductDetails(true);
                }}
                onView={() => {
                  const contact = getFarmerContact(product);
                  setSelectedProduct({ ...product, farmer_contact: contact });
                  setShowProductDetails(true);
                }}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-600 mb-4">Try adjusting your filters or search terms</p>
              <Button variant="outline" onClick={clearFilters}>
                Clear all filters
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {showProductDetails && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => { setShowProductDetails(false); setSelectedProduct(null); }} />
          <div className="bg-white rounded-lg max-w-2xl w-full z-10 p-6 overflow-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold">Product Details</h3>
              <Button variant="ghost" onClick={() => { setShowProductDetails(false); setSelectedProduct(null); }}>Close</Button>
            </div>

            <div className="space-y-4">
              <div>
                {selectedProduct.image && (
                  <img src={typeof selectedProduct.image === 'string' ? selectedProduct.image : selectedProduct.image?.url} alt={selectedProduct.name} className="w-full h-56 object-cover rounded mb-3" />
                )}
                <h4 className="text-lg font-semibold">{selectedProduct.name}</h4>
                <p className="text-sm text-gray-600">{selectedProduct.description}</p>
              </div>

              <div className="p-4 border rounded-lg">
                <h5 className="font-semibold mb-2">Farmer Details</h5>
                <p>
                  <strong>Name:</strong> {selectedProduct.farmer_contact?.name || selectedProduct.farmer_name || "N/A"}
                </p>
                <p>
                  <strong>Location:</strong> {selectedProduct.farmer_contact?.location || selectedProduct.farmer_location || "N/A"}
                </p>
                <p>
                  <strong>Phone:</strong> {selectedProduct.farmer_contact?.phone || 'N/A'}
                </p>
                <p>
                  <strong>Email:</strong> {selectedProduct.farmer_contact?.email || 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BuyerDashboard;
