import { useFormik } from 'formik';
import { ArticleInfoSchema } from '../../../schemas/ArticleValidationSchema';
import { Button, Input, Checkbox } from "antd";
import styles from "../styles/ArticleInfo.module.css";
import toast, { Toaster } from 'react-hot-toast';

const ArticleInfo = () => {
    // console.log("article", ArticleInfoSchema);
    // Load draft if available
    const savedDraft = localStorage.getItem("articleInfo");
    const parsedDraft = savedDraft ? JSON.parse(savedDraft) : null;

    const defaultValues = {
        title_en: "",
        subtitle_en: "",
        title_bn: "",
        subtitle_bn: "",
        cover_img_link: "",
        cover_img_cap_en: "",
        cover_img_cap_bn: "",
        author_name: "",
        author_img_link: "",
        author_email: "",
        publish_author_email: false,
    };

    const formik = useFormik({
        initialValues: parsedDraft || defaultValues,
        validationSchema: ArticleInfoSchema,
        enableReinitialize: true, // re-init if localSorage changes
        onSubmit: (values) => {
            // console.log("Form submitted:", values);
            localStorage.setItem("articleInfo", JSON.stringify(values));
            toast('Draft Info Saved !',
                {
                    icon: <i style={{ color: "green" }} className="fi fi-rr-check-circle"></i>,
                    style: {
                        borderRadius: '10px',
                        background: '#fff',
                        color: 'black',
                        border: '2px solid green',
                        fontSize: '18px',
                    },
                    duration: 2000
                });
        },
    });

    const handleClearDraft = () => {
        if (localStorage.getItem("articleInfo")) {
            localStorage.removeItem("articleInfo");
            formik.resetForm({ values: defaultValues });
            // toast.success("Draft cleared");
            toast('Draft Info Cleared !',
                {
                    icon: <i style={{ color: "red" }} className="fa-solid fa-trash-can"></i>,
                    style: {
                        borderRadius: '10px',
                        background: '#fff',
                        color: 'black',
                        border: '2px solid red',
                        fontSize: '18px',
                    },
                    duration: 1000
                })
        } else {
            toast('Nothing to clear !',
                {
                    icon: <i style={{ color: "red" }} className="fi fi-br-exclamation"></i>,
                    style: {
                        borderRadius: '10px',
                        background: '#fff',
                        color: 'black',
                        border: '2px solid red',
                        fontSize: '18px',
                    },
                    duration: 2000
                })
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <Toaster />
                <h1>Article Info</h1>
                <form className={styles.formStyle}
                    onSubmit={formik.handleSubmit}>
                    {/* Title EN */}
                    <div className={styles.inputDiv}>
                        <label>Title (EN) *</label>
                        <Input
                            size='large'
                            name="title_en"
                            value={formik.values.title_en}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            className={formik.touched.title_en && formik.errors.title_en ? styles.inputError : ""}
                        />
                        {formik.touched.title_en && formik.errors.title_en && (
                            <div className={styles.errorMessage}>{formik.errors.title_en}</div>
                        )}
                    </div>

                    {/* Subtitle EN */}
                    <div className={styles.inputDiv}>
                        <label>Subtitle (EN) *</label>
                        <Input size='large'
                            name="subtitle_en"
                            value={formik.values.subtitle_en}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            className={formik.touched.subtitle_en && formik.errors.subtitle_en ? styles.inputError : ""}
                        />
                        {formik.touched.subtitle_en && formik.errors.subtitle_en && (
                            <div className={styles.errorMessage}>{formik.errors.subtitle_en}</div>
                        )}

                    </div>
                    
                    <hr style={{border: '2px solid black'}} />

                    {/* Title BN */}
                    <div className={styles.inputDiv}>
                        <label>Title (বাংলা) *</label>
                        <Input size='large'
                            name="title_bn"
                            value={formik.values.title_bn}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            className={formik.touched.title_bn && formik.errors.title_bn ? styles.inputError : ""}
                        />
                        {formik.touched.title_bn && formik.errors.title_bn && (
                            <div className={styles.errorMessage}>{formik.errors.title_bn}</div>
                        )}
                    </div>

                    {/* Subtitle BN */}
                    <div className={styles.inputDiv}>
                        <label>Subtitle (বাংলা) *</label>
                        <Input size='large'
                            name="subtitle_bn"
                            value={formik.values.subtitle_bn}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            className={formik.touched.subtitle_bn && formik.errors.subtitle_bn ? styles.inputError : ""}
                        />
                        {formik.touched.subtitle_bn && formik.errors.subtitle_bn && (
                            <div className={styles.errorMessage}>{formik.errors.subtitle_bn}</div>
                        )}
                    </div>
                    <hr style={{border: '2px solid black'}} />

                    {/* Cover Image Link */}
                    <div className={styles.inputDiv}>
                        <label>Cover Image Link *</label>
                        <Input size='large'
                            name="cover_img_link"
                            value={formik.values.cover_img_link}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            className={formik.touched.cover_img_link && formik.errors.cover_img_link ? styles.inputError : ""}
                        />
                        {formik.touched.cover_img_link && formik.errors.cover_img_link && (
                            <div className={styles.errorMessage}>{formik.errors.cover_img_link}</div>
                        )}
                    </div>

                    {/* Cover Image Caption EN */}
                    <div className={styles.inputDiv}>
                        <label>Cover Image Caption (EN) *</label>
                        <Input size='large'
                            name="cover_img_cap_en"
                            value={formik.values.cover_img_cap_en}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            className={formik.touched.cover_img_cap_en && formik.errors.cover_img_cap_en ? styles.inputError : ""}
                        />
                        {formik.touched.cover_img_cap_en && formik.errors.cover_img_cap_en && (
                            <div className={styles.errorMessage}>{formik.errors.cover_img_cap_en}</div>
                        )}
                    </div>

                    {/* Cover Image Caption BN */}
                    <div className={styles.inputDiv}>
                        <label>Cover Image Caption (বাংলা) *</label>
                        <Input size='large'
                            name="cover_img_cap_bn"
                            value={formik.values.cover_img_cap_bn}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            className={formik.touched.cover_img_cap_bn && formik.errors.cover_img_cap_bn ? styles.inputError : ""}
                        />
                        {formik.touched.cover_img_cap_bn && formik.errors.cover_img_cap_bn && (
                            <div className={styles.errorMessage}>{formik.errors.cover_img_cap_bn}</div>
                        )}
                    </div>

                    <hr style={{border: '2px solid black'}} />

                    {/* Author Name */}
                    <div className={styles.inputDiv}>
                        <label>Author Name *</label>
                        <Input size='large'
                            name="author_name"
                            value={formik.values.author_name}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            className={formik.touched.author_name && formik.errors.author_name ? styles.inputError : ""}
                        />
                        {formik.touched.author_name && formik.errors.author_name && (
                            <div className={styles.errorMessage}>{formik.errors.author_name}</div>
                        )}
                    </div>

                    {/* Author Profile Image Link */}
                    <div className={styles.inputDiv}>
                        <label>Author Profile Image Link *</label>
                        <Input size='large'
                            name="author_img_link"
                            value={formik.values.author_img_link}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            className={formik.touched.author_img_link && formik.errors.author_img_link ? styles.inputError : ""}
                        />
                        {formik.touched.author_img_link && formik.errors.author_img_link && (
                            <div className={styles.errorMessage}>{formik.errors.author_img_link}</div>
                        )}
                    </div>

                    {/* Author Email */}
                    <div className={styles.inputDiv}>
                        <label>Author Email *</label>
                        <Input size='large'
                            name="author_email"
                            value={formik.values.author_email}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            className={formik.touched.author_email && formik.errors.author_email ? styles.inputError : ""}
                        />
                        {formik.touched.author_email && formik.errors.author_email && (
                            <div className={styles.errorMessage}>{formik.errors.author_email}</div>
                        )}
                    </div>

                    {/* Publish Author Email */}
                    <div className={styles.inputDiv}>
                        <Checkbox
                            name="publish_author_email"
                            checked={formik.values.publish_author_email}
                            onChange={formik.handleChange}
                        >
                            Publish Author Email
                        </Checkbox>
                        {formik.touched.publish_author_email && formik.errors.publish_author_email && (
                            <div className={styles.errorMessage}>{formik.errors.publish_author_email}</div>
                        )}
                    </div>

                    {/* Buttons */}
                    <div style={{ textAlign: 'center' }}>
                        <Button disabled={!formik.isValid} className={styles.saveButton} type="primary" htmlType="submit">
                            <i className="fi fi-rr-disk"></i> Save Draft
                        </Button>
                        &nbsp;&nbsp;&nbsp;&nbsp;
                        <Button className={styles.deleteButton} type="primary" onClick={handleClearDraft}>
                            <i className="fi fi-rr-trash"></i> Clear Draft
                        </Button>
                    </div>
                </form>

            </div>
            <hr />
        </div>

    );
}

export default ArticleInfo;