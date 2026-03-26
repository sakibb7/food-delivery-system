import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../App";
import toast from "react-hot-toast";
import { useGoogleLogin } from "@react-oauth/google";
import { useAppData } from "../context/useAppData";

export default function Login() {
  const [loading, setLoading] = useState(false);
  const { setIsAuth, setUser } = useAppData();
  const navigate = useNavigate();

  const responseGoogle = async (authResult: any) => {
    setLoading(true);

    try {
      const result = await axios.post(`${authService}/api/auth/login`, {
        code: authResult["code"],
      });
      localStorage.setItem("token", result.data.token);

      toast.success(result.data.message);

      setUser(result.data.user);

      setIsAuth(true);

      setLoading(false);

      navigate("/");
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong when login");
      setLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: responseGoogle,
    onError: responseGoogle,
    flow: "auth-code",
  });
  return (
    <div>
      <button onClick={googleLogin} disabled={loading}>
        {loading ? "Loading..." : "Login with google"}
      </button>
    </div>
  );
}
