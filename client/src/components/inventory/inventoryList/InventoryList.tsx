import { useEffect, useState } from "react"
import Loader from "../../loader/Loader";
import type { Product } from "../../../types/product";
import styles from "./InventoryList.module.scss"
import SearchBar from "../search/searchBar/SearchBar";
import { getProducts } from "../../../api/products";
import ProductCard from "../../cards/productCard/ProductCard";



type StockFilter = "all" | "inStock" | "lowStock" | "outOfStock";
export default function InventoryList(){
 const [products, setProducts] = useState<Product[]>([])
const [stockFilter, setStockFilter] = useState<StockFilter>("all");
 const [loader, setLoader] = useState(true)
 const [searchTerm, setSearchTerm] = useState("");
 
 useEffect(() => {
 const fetchProducts = async () => {
  try {
    const data = await getProducts();
    setProducts(data);
  } catch (error) {
    console.error("Failed to load products:", error);
  } finally {
    setLoader(false);
  }
};
 fetchProducts()

 },[])

 if (loader){
    return <Loader />
 }
   const filterdStock = products.filter((product) => {
  if (stockFilter === "all") {
    return true;

  } else if (stockFilter === "outOfStock") {
    return product.quantity === 0;

  } else if (stockFilter === "lowStock") {
    return (
      product.quantity > 0 &&
      product.quantity <= product.low_stock_threshold
    );

  } else if (stockFilter === "inStock") {
    return product.quantity > product.low_stock_threshold;
  }

  return false;
});

const searchProducts = filterdStock.filter((product) =>
  product.name.toLowerCase().includes(searchTerm.toLowerCase())
);
 

 const handleStockFilter = (filter: StockFilter) => {
  setStockFilter(filter);
};
    return(
        <>

        <SearchBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
         />

        <div className={styles.filterBtns}>
            <button onClick={() => handleStockFilter("all")}>all</button>
            <button onClick={() => handleStockFilter("lowStock")}>low Stock</button>
            <button onClick={() => handleStockFilter("outOfStock")}>out Of Stock</button>
        </div>
         {searchProducts.map((product) => (
         <ProductCard
         key={product.id}
         product={product}
         />
         ))}
          </>

    )
}