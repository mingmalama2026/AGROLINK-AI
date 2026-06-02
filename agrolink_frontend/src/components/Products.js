import React, { useEffect, useState } from "react";
import API from "../api";

function Products({ refreshSignal }) {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await API.get("products/");
        setProducts(response.data);
      } catch (err) {
        console.error("Error fetching products:", err);
      }
    };
    fetchProducts();
  }, [refreshSignal]);

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Products</h2>
      <ul className="space-y-2">
        {products.map((product) => (
          <li key={product.id} className="border p-2 rounded">
            {product.name} — Rs. {product.price}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Products;
