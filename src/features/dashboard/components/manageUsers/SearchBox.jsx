import styles from '../../styles/Filters.module.css'
import { Input, Space } from 'antd';
const { Search } = Input;
const SearchBox = () => {
    return (
        <div>
            <Search 
            placeholder="Search users by email or name..." 
            size='large'
            enterButton />
        </div>
    );
}
 
export default SearchBox;