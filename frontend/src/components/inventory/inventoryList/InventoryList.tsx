import { useEffect, useState } from "react"
import { getProducts } from "../../api/products";
import Loader from "../../loader/Loader";


export default function InventoryList(){
 const [products, setProducts] = useState<Product[]>([])

 const [loader, setLoader] = useState(true)
 
 useEffect(() => {
    const fetchProducts = async () => {
    const data = await getProducts();
    setProducts(data)
    setLoader(false)
 }
 fetchProducts()

 },[])

 if (loader)
    return(
        <div>
          {products}
          <Loader/>
        </div>
        
    )
}