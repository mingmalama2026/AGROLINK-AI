import React, { useEffect, useState } from "react";
import API from "../api";

function Farmers({ refreshSignal }) {
  const [farmers, setFarmers] = useState([]);

  useEffect(() => {
    const fetchFarmers = async () => {
      try {
        const response = await API.get("farmers/");
        setFarmers(response.data);
      } catch (err) {
        console.error("Error fetching farmers:", err);
      }
    };
    fetchFarmers();
  }, [refreshSignal]); // re-run when refreshSignal changes

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Farmers</h2>
      <ul className="space-y-2">
        {farmers.map((farmer) => (
          <li key={farmer.id} className="border p-2 rounded">
            {farmer.name} — {farmer.location}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Farmers;
