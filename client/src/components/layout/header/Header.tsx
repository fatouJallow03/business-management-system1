
import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import styles from "./Header.module.scss";
import Logo from "../../ui/Logo/Logo";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link to="/" className={styles.logo}>
          <Logo variant="dark" size="md" to="/" />
        </Link>

        <nav
          id="main-navigation"
          className={`${styles.nav} ${
            menuOpen ? styles.navOpen : ""
          }`}
          aria-label="Main navigation"
        >
          <NavLink
            to="/"
            end
            onClick={() => setMenuOpen(false)}
          >
            Home
          </NavLink>

          <NavLink
            to="/products"
            onClick={() => setMenuOpen(false)}
          >
            Products
          </NavLink>

          <Link
            to="/register"
            className={styles.registerButton}
            onClick={() => setMenuOpen(false)}
          >
            Get started
          </Link>
        </nav>

        <button
          type="button"
          className={styles.menuButton}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="main-navigation"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>
    </header>
  );
}
