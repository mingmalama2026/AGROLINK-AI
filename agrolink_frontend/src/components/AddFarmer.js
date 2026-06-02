import React, { useState } from "react";
import API from "../api"; // axios instance

function AddFarmer({ onFarmerAdded }) {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await API.post("farmers/", { name, location });
      setName("");
      setLocation("");
      if (onFarmerAdded) onFarmerAdded(); // notify parent
    } catch (err) {
      console.error("Error adding farmer:", err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 p-4 border rounded">
      <h2 className="text-lg font-bold">Add Farmer</h2>
      <input
        type="text"
        placeholder="Farmer name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="border p-2 w-full"
      />
      <input
        type="text"
        placeholder="Location"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        className="border p-2 w-full"
      />
      <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">
        Add Farmer
      </button>
    </form>
  );
}

export default AddFarmer;
