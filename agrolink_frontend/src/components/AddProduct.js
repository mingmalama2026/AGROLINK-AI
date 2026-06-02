import React, { useState } from "react";
import API from "../api"; // axios instance

function AddProduct({ onProductAdded }) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [farmerId, setFarmerId] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await API.post("products/", {
        name,
        price,
        farmer: farmerId, // backend expects farmer ID
      });
      alert("Product added successfully!");
      setName("");
      setPrice("");
      setFarmerId("");
      if (onProductAdded) onProductAdded(); // notify parent to refresh list
    } catch (err) {
      console.error("Error adding product:", err.response?.data || err.message);
      alert("Failed to add product");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 p-4 border rounded">
      <h2 className="text-lg font-bold">Add Product</h2>
      <input
        type="text"
        placeholder="Product name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="border p-2 w-full"
      />
      <input
        type="number"
        placeholder="Price"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        className="border p-2 w-full"
      />
      <input
        type="text"
        placeholder="Farmer ID"
        value={farmerId}
        onChange={(e) => setFarmerId(e.target.value)}
        className="border p-2 w-full"
      />
      <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">
        Add Product
      </button>
    </form>
  );
}

export default AddProduct;
