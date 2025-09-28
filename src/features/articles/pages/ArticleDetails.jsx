import styles from "../styles/ArticleDetails.module.css";

const ArticleDetails = () => {
    return (
        <div>
            <div className={`${styles.article}`}>

                <div style={{
                    justifyContent: "center", backgroundColor: "white",
                    display: "flex", padding: "1px", fontSize: "30px"
                }}>

                </div>


                {/* {!articleLoading && !articleError && !slugMismatch && article && */}
                <div className={`container`}>
                    {/* <GoToTopButton /> */}

                    <div className={styles.articleMenu}>
                        {/* <Breadcrumb
                                style={{ fontSize: '18px', marginBottom: '10px' }}
                                separator=">"
                                items={[
                                    {
                                        title: "lorem ashdashdashda"
                                            // <Link to={`/category/${slugify(articleData.article.category_name)}`}>
                                            //     {`${articleData.article.category_name}`}
                                            // </Link>

                                    },
                                    {
                                        title: "AOIDFHUIUAHFDDIUAHFD ASUDHIAUH"
                                            // <Link to={`/category/${slugify(articleData.article.category_name)}/${slugify(articleData.article.subcategory_name)}`}>
                                            //     <span style={{ color: 'black' }}>
                                            //         {`${articleData.article.subcategory_name}`}
                                            //     </span>
                                            // </Link>
                                    }
                                ]}
                            /> */}

                        {/* <LanguageToggle onToggle={handleLanguageToggle} /> */}

                    </div>

                    <div className={`${styles.articleHead}`}>

                        {/* {isEnglish && <h1 >{articleData.article.title_en}</h1>}
                            {!isEnglish && <h1 className='bn'>{articleData.article.title_bn}</h1>}

                            {isEnglish && <h5> {articleData.article.subtitle_en}</h5>}
                            {!isEnglish && <h5 className='bn3'> {articleData.article.subtitle_bn}</h5>} */}

                        <h1>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Voluptate autem neque perspiciatis quam dolorum repudiandae pariatur esse, sequi eius velit.</h1>
                        <span>Lorem ipsum dolor sit amet consectetur, adipisicing elit. Itaque sed eligendi, officiis explicabo voluptatem cupiditate. Adipisci, reiciendis enim molestiae temporibus amet tenetur voluptatibus non incidunt ab odio. Quisquam corporis nesciunt aut perspiciatis ratione doloribus cupiditate facilis, illo numquam totam veniam amet asperiores sapiente voluptatem, natus voluptatibus inventore enim autem harum!</span>

                        <img src="https://picsum.photos/900/300" alt="Article" className={styles.articleImage} />
                        {/* <img src={articleData.article.cover_img_link} alt="Article"
                                className={styles.articleImage} /> */}

                        <div className={`${styles.articleImageCaption}`}>
                            {/* {isEnglish && articleData.article.cover_img_cap_en}
                                {!isEnglish && <span className='bn3'> {articleData.article.cover_img_cap_bn}</span>} */}
                            sjjashdjasda aksjdhajhda
                        </div>

                        <div className={`${styles.authorAndDateOfArticle}`}>
                            <div className={`${styles.authorPicOfArticle}`}>
                                {/* <img className={`${styles.authorPicOfArticle}`}
                                        src={articleData.article.author_image_url} alt="" /> */}
                                <img src="https://picsum.photos/90/30" alt="Article" className={`${styles.authorPicOfArticle}`} />

                            </div>
                            <div className={`${styles.authorNameOfArticle}`}>
                                {/* <Link to={`/user/${articleData?.article?.author_slug}`}>
                                    <span style={{ color: 'black', fontSize: '18px', fontWeight: 'bold' }}>
                                        {articleData.article.author_firstname} {articleData.article.author_lastname}
                                    </span>
                                </Link> */}
                                alkhkja asdgjusag

                                <br />
                                <div style={{ fontSize: '13px', color: 'gray' }}>
                                    {/* {getFormattedTime(articleData.article.published_at)} */}
                                    hagas asdguyas
                                </div>
                            </div>
                        </div>

                    </div>
                    <hr />

                    <div className={`${styles.articleBody}`}>
                        <div style={{ textAlign: "justify", fontSize: "18px" }} className={`${styles.articleBodyText}`}>
                            {/* {isEnglish && <div dangerouslySetInnerHTML={{ __html: articleData.article.content_en }} />} */}
                            {/* {!isEnglish && <div dangerouslySetInnerHTML={{ __html: articleData.article.content_bn }} />} */}
                            {/* {!isEnglish && <SafeHtmlRenderer html={articleData.article.content_bn} />} */}
                            Lorem ipsum dolor sit amet consectetur, adipisicing elit. Corporis a perferendis non fuga ipsam minima animi in exercitationem veritatis enim ab, odit blanditiis consequatur quae eaque accusantium debitis distinctio. Ut dicta corrupti odio similique ullam quia alias nulla cupiditate sint.
                        </div>

                    </div>

                    <hr />
                    {/* <div className={`${styles.articleTags}`}>
                        <div className={`${styles.articleTagsTitle}`}>Tags:</div>
                        <div className={`${styles.articleTagsList}`}>
                            {stringToArray(articleData.article.tags).map((tag, index) => (
                                <button key={index} type='button' className={styles.articleTagsButton}>
                                    {tag}
                                </button>
                            ))}

                        </div>
                    </div>
                    <hr /> */}
                </div>
                 {/* } */}



            </div>
        </div>
    );
}

export default ArticleDetails;