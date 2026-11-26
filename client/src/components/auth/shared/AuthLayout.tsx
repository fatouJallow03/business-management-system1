
import type { ReactNode } from "react";
import styles from "./AuthLayout.module.scss";
import AuthBrandPanel from "./AuthBrandPanel";

interface AuthLayoutProps {
  children: ReactNode;
  variant?: "login" | "register";
}

export default function AuthLayout({
  children,
  variant = "login",
}: AuthLayoutProps) {
  return (
    <main className={styles.page}>
      <div className={`${styles.layout} ${styles[variant]}`}>
        <AuthBrandPanel />

        <section className={styles.formPanel}>
          <div className={styles.formContainer}>
            {children}
          </div>
          <div
            className={styles.mobilePattern}
            aria-hidden="true"
          />
        </section>
      </div>
    </main>
  );
}
