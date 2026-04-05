import { useState } from "react";
import { useAppData } from "../context/useAppData";
import axios from "axios";
import { restaurantServices } from "../App";
import toast from "react-hot-toast";

export default function AddRestaurant() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [phone, setPhone] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { loadingLocation, location } = useAppData();

  const handleSubmit = async () => {
    if (!name || !image || !location) {
      alert("All fields are required");
      return;
    }

    const formData = new FormData();

    formData.append("name", name);
    formData.append("description", description);
    formData.append("latitude", String(location?.latitude));
    formData.append("longitude", String(location?.longitude));
    formData.append("formattedAddress", location?.formattedAddress);
    formData.append("file", image);
    formData.append("phone", phone);

    try {
      setSubmitting(true);
      await axios.post(`${restaurantServices}/api/restaurant/new`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      toast.success("Restaurent Added successfully");
    } catch (error) {
      console.log(error);
      setSubmitting(false);
    }
  };

  return (
    <div>
      <form>
        <input
          type="text"
          placeholder="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="text"
          placeholder="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <input
          type="tel"
          placeholder="phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files?.[0] || null)}
        />
        <div className="">
          {loadingLocation
            ? "Fetching location..."
            : location?.formattedAddress || "Location not available"}
        </div>

        <button disabled={submitting} onClick={handleSubmit}>
          {submitting ? "Submitting..." : "Add Restaurant"}
        </button>
      </form>
    </div>
  );
}
