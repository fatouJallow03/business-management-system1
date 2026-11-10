
import { Link } from "react-router-dom";
import styles from "./Logo.module.scss";

type LogoProps = {
  variant?: "dark" | "light";
  size?: "sm" | "md" | "lg";
  to?: string;
  className?: string;
};

export default function Logo({
  variant = "dark",
  size = "md",
  to,
  className = "",
}: LogoProps) {
  const logo = (
    <img
      src={`/logos/walo-${variant}.svg`}
      alt="Walo"
      className={`${styles.logo} ${styles[size]} ${className}`}
    />
  );

  if (to) {
    return (
      <Link to={to} aria-label="Walo home">
        {logo}
      </Link>
    );
  }

  return logo;
}
