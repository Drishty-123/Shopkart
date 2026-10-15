import { useNavigate, Link, useLocation } from "react-router-dom";
import { logoutCustomer } from "../services/api";
import { useCart } from "../context/CartContext";

export default function Navbar({ isAuthenticated, onLogout, wishlistCount = 0 }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { totalItems } = useCart();
  const handleLogout = async () => {
    try { await logoutCustomer(); }
    catch (err) { console.error("Logout error:", err); }
    finally { onLogout?.(); navigate("/login"); }
  };
  const navLink = (to, label) => (
    <Link key={to} to={to} style={location.pathname === to ? {background:"#edf4e5",color:"#203b2b"} : {}}>{label}</Link>
  );
  return (
    <nav className="w-full flex items-center justify-between">
      <div className="flex items-center gap-6">
        <Link to={isAuthenticated ? "/home" : "/login"}><span>shopkart</span></Link>
        {isAuthenticated && <div className="flex items-center gap-1">
          {navLink("/home","Overview")}
          {navLink("/products","Shop")}
          {navLink("/wishlist",`Saved${wishlistCount ? ` · ${wishlistCount}` : ""}`)}
          {navLink("/orders","Orders")}
        </div>}
      </div>
      {isAuthenticated && <div className="flex items-center gap-3">
        <Link to="/cart" style={{background:"#f2f5ef",color:"#203b2b",fontWeight:700}}>Bag{totalItems > 0 ? ` (${totalItems})` : ""}</Link>
        <button onClick={handleLogout}>Sign out ↗</button>
      </div>}
    </nav>
  );
}
