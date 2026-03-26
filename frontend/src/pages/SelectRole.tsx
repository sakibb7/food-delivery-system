import { useState } from "react";
import { useAppData } from "../context/useAppData";
import { useNavigate } from "react-router-dom";
import { authService } from "../App";
import axios from "axios";

type Role = "customer" | "rider" | "seller" | null;

export default function SelectRole() {
  const [role, setRole] = useState<Role>(null);
  const { setUser } = useAppData();
  const navigate = useNavigate();

  const roles: Role[] = ["customer", "rider", "seller"];

  const addRole = async () => {
    try {
      const { data } = await axios.put(
        `${authService}/api/auth/add/role`,
        { role },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      localStorage.setItem("token", data?.token);

      console.log(data, "data after role add");
      setUser(data?.user);

      navigate("/", { replace: true });
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div className="flex flex-col gap-6">
      {roles.map((item, idx) => (
        <button key={idx} onClick={() => setRole(item)}>
          {item}
        </button>
      ))}

      <button onClick={addRole} disabled={!role}>
        Update
      </button>
    </div>
  );
}
