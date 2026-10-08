import type { ProductCardProps } from "../../../types/product";
import styles from "./ProductCardContainer.module.scss"

export default function ProductCard({product}: ProductCardProps){
const { name, quantity, image_url, low_stock_threshold } = product 
let stockStatus = ""
if (quantity === 0){
    stockStatus = "out of stock";
} else if (quantity <= low_stock_threshold){
    stockStatus = "low stock"
} else {
    stockStatus = "in stock"
}
return(
    <div className={styles.productCardContainer}>
     <h3 className={styles.title}>
      {name}
     </h3>
     <p className={styles.quantity}>{quantity}</p>
     <div className="styles image">
        {image_url}
     </div>
     <p className={stockStatus}>{stockStatus}</p>
    </div>
)


}