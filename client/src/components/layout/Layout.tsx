
import { Outlet } from "react-router-dom";
import styles from "./Layout.module.scss";
import Footer from "./footer/Footer";
import Header from "./header/Header";

export default function Layout() {
  return (
    <div className={styles.layout}>
      <Header />

      <main className={styles.main}>
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}
