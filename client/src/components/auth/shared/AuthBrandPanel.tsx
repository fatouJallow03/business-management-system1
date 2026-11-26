
import Logo from "../../ui/Logo/Logo";
import styles from "./AuthBrandPanel.module.scss";

export default function AuthBrandPanel() {
  return (
    <aside className={styles.brandPanel}>
      <div className={styles.brandContent}>
      <Logo variant="light" size="md" />
        <div className={styles.message}>
          <p className={styles.eyebrow}>
            ROOTED IN BUSINESS. BUILT FOR GROWTH.
          </p>

          <h2>
            Your business,
            <br />
            made simple.
          </h2>

          <p className={styles.description}>
            Less paperwork. More progress.
            Everything you need to manage your
            business, all in one place.
          </p>
        </div>

        <p className={styles.signature}>
          Built for businesses that grow.
        </p>
      </div>

      <div className={styles.pattern} aria-hidden="true">
        <svg width="100%" height="100%">
          <defs>
            <pattern
              id="walo-kente"
              width="96"
              height="96"
              patternUnits="userSpaceOnUse"
            >
              <rect width="96" height="96" fill="#513629" />

              <path
                d="M0 0 L48 48 L0 96
                   M96 0 L48 48 L96 96"
                stroke="#E8B98F"
                strokeWidth="3"
                fill="none"
              />

              <path
                d="M12 0 L48 36 L84 0
                   M12 96 L48 60 L84 96"
                stroke="#B97850"
                strokeWidth="3"
                fill="none"
              />

              <path
                d="M48 28 L68 48 L48 68 L28 48 Z"
                fill="#D8A46D"
              />

              <path
                d="M48 38 L58 48 L48 58 L38 48 Z"
                fill="#604333"
              />

              <rect
                x="4"
                y="40"
                width="12"
                height="16"
                fill="#A64B32"
              />

              <rect
                x="80"
                y="40"
                width="12"
                height="16"
                fill="#A64B32"
              />
            </pattern>
          </defs>

          <rect
            width="100%"
            height="100%"
            fill="url(#walo-kente)"
          />
        </svg>
      </div>
    </aside>
  );
}
