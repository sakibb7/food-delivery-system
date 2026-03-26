import { useNavigate } from "react-router-dom";
import { useAppData } from "../context/useAppData";
import toast from "react-hot-toast";

export default function Account() {
  const { user, setUser, setIsAuth } = useAppData();
  const navigate = useNavigate();

  const logoutHandler = () => {
    localStorage.setItem("token", "");
    setUser(null);
    setIsAuth(false);
    navigate("/login");
    toast.success("Logout success!");
  };
  return (
    <div>
      <div className="">{user?.name}</div>
      <button onClick={logoutHandler}>Logout</button>
    </div>
  );
}
