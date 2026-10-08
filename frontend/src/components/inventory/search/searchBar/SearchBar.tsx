import styles from "./SearchBar.module.scss"
import type { SearchBarProps } from "../../../types/search";

function SearchBar({searchTerm, setSearchTerm}: SearchBarProps){


    const searchHandle = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value)
    }
    return(
        <div className={styles.searchBarContainer}>
         <input className={styles.SearchBar} 
         type="text" 
         value={searchTerm}
         onChange={searchHandle}
         />
        </div>

    )

}

export default SearchBar;