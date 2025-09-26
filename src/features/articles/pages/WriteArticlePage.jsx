import { useState } from "react";


const WriteArticlePage = () => {
    return (
        <div>
            <h1>Write Article</h1>
            {/* Add your article writing form or components here */}
            <form>
                <div>
                    <label htmlFor="title">Title English:</label>
                    <input type="text" id="title" name="title" required />
                </div>
                <div>
                    <label htmlFor="subtitle">Subtitle English:</label>
                    <textarea id="subtitle" name="subtitle" rows="10" required></textarea>
                </div>
                <div>
                    <label htmlFor="content">Content English:</label>
                    <textarea id="content" name="content" rows="10" required></textarea>
                </div>
                <button type="submit">Publish</button>
            </form>
        </div>
    );
}
 
export default WriteArticlePage;