import { Link, useLocation, useSearchParams } from "react-router-dom";
import { useAppData } from "../context/useAppData";
import { useEffect, useState } from "react";

export default function Navbar() {
  const { isAuth, city } = useAppData();
  const currLocation = useLocation();
  const isHomePage = currLocation.pathname === "/";

  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");

  useEffect(() => {
    const timer = setTimeout(() => {
      if (search) {
        setSearchParams({ search });
      } else {
        setSearchParams({});
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [search, setSearchParams]);

  return (
    <div>
      {isAuth && <Link to={"/account"}>Account</Link>}
      {isHomePage && (
        <div className="flex justify-center items-center gap-3">
          <p>{city}</p>
          <input
            placeholder="Search for resturent"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      )}
    </div>
  );
}
