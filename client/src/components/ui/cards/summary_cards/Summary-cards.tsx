import styles from "./SummaryCards.module.scss";
import type { SummaryCardsProps } from "../../types/product";

export default function SummaryCards({ title, value, icon }: SummaryCardsProps) {
  return (
    <div className={styles.summaryCard}>
      <span className={styles.icon}>{icon}</span>
      <div className={styles.content}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.value}>{value}</p>
      </div>
    </div>
  );
}