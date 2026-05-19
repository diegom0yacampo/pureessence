import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ShoppingBag, User, LogOut } from "lucide-react";
import { useCart } from "@/lib/CartContext";
import { useAuth } from "@/lib/AuthContext";
import styles from "./Navbar.module.css";

const logo = "https://raw.githubusercontent.com/diegom0yacampo/pureessence-images/master/assets/logo.png";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { cartCount } = useCart();
  const { user, isAuthenticated, logout } = useAuth();

  const canAccessIntranet = isAuthenticated && user && (user.es_empleado || user.role === 'Admin');

  const links = [
    { to: "/", label: "Home" },
    { to: "/personalizar", label: "Customize" },
    { to: "/coleccion", label: "Collection" },
    ...(canAccessIntranet ? [{ to: "/intranet", label: "Intranet" }] : []),
  ];

  return (
    <nav className={styles.nav}>
      <div className={styles.inner}>

        {/* Logo */}
        <Link to="/" className={styles.logoLink}>
          <img src={logo} alt="Pure Essence" className={styles.logoImg} />
          <div className={styles.logoText}>
            <span className={styles.logoName}>Pure Essence</span>
            <span className={styles.logoSub}>Maison de Parfum</span>
          </div>
        </Link>

        {/* Desktop navigation */}
        <div className={styles.desktopNav}>
          <div className={styles.links}>
            {links.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`${styles.link} ${location.pathname === link.to ? styles.linkActive : ""}`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className={styles.actions}>
            <Link to="/cart" className={styles.iconBtn}>
              <ShoppingBag />
              {cartCount > 0 && <span className={styles.cartBadge}>{cartCount}</span>}
            </Link>

            {isAuthenticated ? (
              <div className={styles.userInfo}>
                <span className={styles.username}>{user?.username}</span>
                <button className={styles.logoutBtn} onClick={() => logout()} title="Logout">
                  <LogOut size={22} />
                </button>
              </div>
            ) : (
              <Link to="/login" className={styles.iconBtn}>
                <User />
              </Link>
            )}
          </div>
        </div>

        {/* Mobile toggle */}
        <div className={styles.mobileActions}>
          <Link to="/cart" className={styles.iconBtn}>
            <ShoppingBag size={24} />
            {cartCount > 0 && <span className={styles.cartBadge}>{cartCount}</span>}
          </Link>
          <button className={styles.menuBtn} onClick={() => setOpen(!open)}>
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`${styles.mobileMenu} ${open ? styles.mobileMenuOpen : ""}`}>
        {links.map(link => (
          <Link
            key={link.to}
            to={link.to}
            onClick={() => setOpen(false)}
            className={`${styles.mobileLink} ${location.pathname === link.to ? styles.mobileLinkActive : ""}`}
          >
            {link.label}
          </Link>
        ))}
        <hr className={styles.mobileDivider} />
        {isAuthenticated ? (
          <button className={styles.mobileLogout} onClick={() => { logout(); setOpen(false); }}>
            <LogOut /> Logout
          </button>
        ) : (
          <Link to="/login" onClick={() => setOpen(false)} className={styles.mobileSignIn}>
            Sign In
          </Link>
        )}
      </div>
    </nav>
  );
}
