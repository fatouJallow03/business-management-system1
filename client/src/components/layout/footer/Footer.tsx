
import { Link } from "react-router-dom";
import styles from "./Footer.module.scss";
import Logo from "../../ui/Logo/Logo";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.brand}>
          <Link to="/" className={styles.logo}>
       <Logo variant="light" size="md" to="/" />  </Link>

          <p>
            Your business, made simple.
            <br />
            Built for businesses that grow.
          </p>
        </div>

        <nav
          className={styles.links}
          aria-label="Footer navigation"
        >
          <Link to="/">Home</Link>
          <Link to="/register">Get started</Link>
          <Link to="/products">Products</Link>
        </nav>
      </div>

      <div className={styles.bottom}>
        <p>
          © {new Date().getFullYear()} Walo.
          All rights reserved.
        </p>
      </div>
    </footer>
  );
}
