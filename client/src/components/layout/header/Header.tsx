
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  ChevronDown,
  LogOut,
  LoaderCircle,
} from "lucide-react";

import Logo from "../../ui/Logo/Logo";
import { useAuth } from "../../../hooks/useAuth";

import styles from "./Header.module.scss";

/**
 * Displays Walo's authenticated application header.
 *
 * Provides business information, account details
 * and secure logout functionality.
 *
 * @returns The authenticated application header.
 */
export default function Header() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [menuOpen, setMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [error, setError] = useState("");

  const initial =
    user?.username.charAt(0).toUpperCase() || "W";

  /**
   * Logs out the authenticated user.
   *
   * Clears the authentication session through
   * AuthContext and redirects the user to login.
   */
  const handleLogout = async () => {
    if (loggingOut) return;

    setLoggingOut(true);
    setError("");

    try {
      await logout();

      setMenuOpen(false);

      navigate("/login", { replace: true });
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to sign out. Please try again."
      );
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        {/* WALO LOGO */}

        <div className={styles.logo}>
          <Logo variant="dark" size="sm" to="/" />
        </div>

        {/* USER ACCOUNT */}

        <div
          className={styles.account}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setMenuOpen(false);
              document
                .getElementById("account-trigger")
                ?.focus();
            }
          }}
          onBlur={(event) => {
            if (
              !event.currentTarget.contains(
                event.relatedTarget
              )
            ) {
              setMenuOpen(false);
            }
          }}
        >
          <button
            id="account-trigger"
            type="button"
            className={styles.accountButton}
            aria-label="Account options"
            aria-expanded={menuOpen}
            aria-controls="account-dropdown"
            onClick={() =>
              setMenuOpen((previous) => !previous)
            }
          >
            <span
              className={styles.avatar}
              aria-hidden="true"
            >
              {initial}
            </span>

            <span className={styles.accountDetails}>
              <span className={styles.businessName}>
                {user?.businessName}
              </span>

              <span className={styles.role}>
                {user?.role}
              </span>
            </span>

            <ChevronDown
              size={16}
              aria-hidden="true"
              className={`${styles.chevron} ${
                menuOpen ? styles.chevronOpen : ""
              }`}
            />
          </button>

          {/* ACCOUNT DROPDOWN */}

          {menuOpen && (
            <div
              id="account-dropdown"
              className={styles.dropdown}
            >
              <div className={styles.dropdownHeading}>
                <strong>{user?.username}</strong>
                <span>{user?.email}</span>
              </div>

              <div className={styles.divider} />

              <button
                type="button"
                className={styles.logoutButton}
                onClick={handleLogout}
                disabled={loggingOut}
              >
                {loggingOut ? (
                  <LoaderCircle
                    size={18}
                    className={styles.spinner}
                    aria-hidden="true"
                  />
                ) : (
                  <LogOut size={18} aria-hidden="true" />
                )}

                {loggingOut
                  ? "Signing out..."
                  : "Sign out"}
              </button>

              {error && (
                <p
                  className={styles.error}
                  role="alert"
                >
                  {error}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
