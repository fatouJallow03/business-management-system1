import { API_URL } from "./url"



export async function getProducts() {

   const response = await fetch(`${API_URL}/products`)
   if (!response.ok){ 
    throw new Error("failed to fetch products")
   }
   const data = await response.json()
  return data;
 
    
}
  
