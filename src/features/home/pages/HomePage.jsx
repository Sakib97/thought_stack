import { Link } from "react-router-dom";

const HomePage = () => {
    return (
        <div>
            <h1>Welcome to Thought Stack</h1>
            <p>Your one-stop solution for all your article writing needs.</p>
            <button style={{cursor: 'pointer', backgroundColor: 'blue', color:'white', padding: '10px', borderRadius: '5px', border: 'none'}}>
                <Link to="/articles/write" style={{color: 'white', textDecoration: 'none'}}>Write an Article</Link>
            </button>
        </div>
    );
}
 
export default HomePage;