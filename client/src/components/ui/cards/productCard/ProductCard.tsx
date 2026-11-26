import type { ProductCardProps } from "../../../types/product";
import styles from "./ProductCardContainer.module.scss"

export default function ProductCard({product}: ProductCardProps){
const { name, quantity, image_url, low_stock_threshold } = product 
let stockStatus: string;
let stockClass: string;
if (quantity === 0){
    stockStatus = "out of stock";
   stockClass = styles.outOfStock
} else if (quantity <= low_stock_threshold){
    stockStatus = "low stock"
    stockClass = styles.lowStock
} else {
    stockStatus = "in stock"
    stockClass = styles.inStock
};

return(
    <div className={styles.productCardContainer}>
     <h3 className={styles.title}>
      {name}
     </h3>
     <p className={styles.quantity}>{quantity}</p>
     <div className={styles.imageContainer}>
      {image_url && (
    <img
      src={image_url}
      alt={name}
      className={styles.image}
      />
     )}
    </div>
     <p className={stockClass}>{stockStatus}</p>
    </div>
)


}