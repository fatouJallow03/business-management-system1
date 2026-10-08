import { API_URL } from "./url"



const getProducts = async() => {
try {
   const response = await fetch(`${API_URL}/products`)
   if (!response.ok){ 
    throw new Error("failed to fetch products")
   }
   const data = await response.json()
  return data;
} catch (error) {
    console.error(error);
    throw error;

}

  
    
}
  
