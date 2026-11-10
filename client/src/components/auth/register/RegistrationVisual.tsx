
import { useEffect, useState } from "react";
import Logo from "../../ui/Logo/Logo";
import styles from "./RegisterForm.module.scss";

const images = [
  "/images/register-village.webp",
  "/images/register-coast.webp",
  "/images/register-market.webp",
];

export default function RegistrationVisual() {
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const interval = window.setInterval(() => {
      setActiveImage((current) => (current + 1) % images.length);
    }, 7000);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <aside className={styles.visualPanel}>
      <div className={styles.imageContainer}>
        {images.map((image, index) => (
          <div
            key={image}
            className={`${styles.visualImage} ${
              activeImage === index ? styles.visibleImage : ""
            }`}
            style={{ backgroundImage: `url("${image}")` }}
            aria-hidden="true"
          />
        ))}
      </div>

      <div className={styles.visualOverlay} />

      <div className={styles.visualContent}>
        <Logo variant="light" size="lg" />

        <div className={styles.visualMessage}>
          <p className={styles.visualEyebrow}>
            ROOTED IN BUSINESS. BUILT FOR GROWTH.
          </p>

          <h2>
            Your business,
            <br />
            made simple.
          </h2>

          <p>
            Less paperwork. More progress. Everything you need
            to manage your business, all in one place.
          </p>
        </div>

        <div className={styles.imageDots}>
          {images.map((image, index) => (
            <button
              key={image}
              type="button"
              className={activeImage === index ? styles.activeDot : ""}
              onClick={() => setActiveImage(index)}
              aria-label={`Show heritage image ${index + 1}`}
              aria-pressed={activeImage === index}
            />
          ))}
        </div>
      </div>
    </aside>
  );
}
