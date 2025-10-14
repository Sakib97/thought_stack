import { useFormik } from 'formik';
import { ArticleInfoSchema } from '../../../schemas/ArticleValidationSchema';
import { Button, Input, Checkbox, Modal } from "antd";
import styles from "../styles/ArticleInfo.module.css";
import toast, { Toaster } from 'react-hot-toast';
import { useState } from 'react';
import { showToast } from '../../../components/layout/CustomToast';

// import { Modal } from 'react-bootstrap';

const ArticleInfo = ({ isEditMode }) => {
    // console.log("article", ArticleInfoSchema);
    const [showModal, setShowModal] = useState(false);

    // Load draft if available
    const savedDraft = isEditMode ?
        localStorage.getItem("articleEditInfo") :
        localStorage.getItem("articleInfo");
    // const savedDraft = localStorage.getItem("articleInfo");
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

            isEditMode ? localStorage.setItem("articleEditInfo", JSON.stringify(values))
                : localStorage.setItem("articleInfo", JSON.stringify(values));

            showToast(isEditMode ? "Edit Draft Info Saved !" : "Article Info Draft Saved !",
                "success");
        },
    });

    const handleClearDraft = () => {
        setShowModal(false);
        const draftKey = isEditMode ? "articleEditInfo" : "articleInfo";
        if (localStorage.getItem(draftKey)) {
            localStorage.removeItem(draftKey);
            formik.resetForm({ values: defaultValues });
            showToast("Draft Info Cleared !", "delete");
        } else {
            showToast("Nothing to clear !", "exclamation");
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
                            placeholder='Title (EN)'
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
                            placeholder='Subtitle (EN) [2 / 3 lines]'
                            value={formik.values.subtitle_en}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            className={formik.touched.subtitle_en && formik.errors.subtitle_en ? styles.inputError : ""}
                        />
                        {formik.touched.subtitle_en && formik.errors.subtitle_en && (
                            <div className={styles.errorMessage}>{formik.errors.subtitle_en}</div>
                        )}

                    </div>

                    <hr style={{ border: '2px solid black' }} />

                    {/* Title BN */}
                    <div className={styles.inputDiv}>
                        <label>Title (বাংলা) *</label>
                        <Input size='large'
                            name="title_bn"
                            placeholder='Title (বাংলা)'
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
                            placeholder='Subtitle (বাংলা) [2 / 3 lines]'
                            value={formik.values.subtitle_bn}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            className={formik.touched.subtitle_bn && formik.errors.subtitle_bn ? styles.inputError : ""}
                        />
                        {formik.touched.subtitle_bn && formik.errors.subtitle_bn && (
                            <div className={styles.errorMessage}>{formik.errors.subtitle_bn}</div>
                        )}
                    </div>
                    <hr style={{ border: '2px solid black' }} />

                    {/* Cover Image Link */}
                    <div className={styles.inputDiv}>
                        <label>Cover Image Link *</label>
                        <Input size='large'
                            name="cover_img_link"
                            placeholder='Cover Image Link (ideal size: 900x400)'
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
                            placeholder='Cover Image Caption (EN)'
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
                            placeholder='Cover Image Caption (বাংলা)'
                            value={formik.values.cover_img_cap_bn}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            className={formik.touched.cover_img_cap_bn && formik.errors.cover_img_cap_bn ? styles.inputError : ""}
                        />
                        {formik.touched.cover_img_cap_bn && formik.errors.cover_img_cap_bn && (
                            <div className={styles.errorMessage}>{formik.errors.cover_img_cap_bn}</div>
                        )}
                    </div>

                    <hr style={{ border: '2px solid black' }} />

                    {/* Author Name */}
                    <div className={styles.inputDiv}>
                        <label>Author Name *</label>
                        <Input size='large'
                            name="author_name"
                            placeholder='Author Name'
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
                            placeholder='Author Profile Image Link (ideal size: 300x300)'
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
                            placeholder='Author Email'
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

                    <hr style={{ border: '2px solid black' }} />
                    
                    {/* Event Banner Title */}
                    <div className={styles.inputDiv}>
                        <label>Event Banner Title (EN)</label>
                        <Input size='large'
                            name="event_title_en"
                            placeholder="e.g. Fahad's Column or History Series"
                            value={formik.values.event_title_en}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            // className={formik.touched.author_email && formik.errors.author_email ? styles.inputError : ""}
                        />
                    </div>

                    <div className={styles.inputDiv}>
                        <label>Event Banner Title (বাংলা)</label>
                        <Input size='large'
                            name="event_title_bn"
                            placeholder="e.g. ফাহাদ'স কলাম বা ইতিহাস সিরিজ"
                            value={formik.values.event_title_bn}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            // className={formik.touched.author_email && formik.errors.author_email ? styles.inputError : ""}
                        />
                        {/* {formik.touched.author_email && formik.errors.author_email && (
                            <div className={styles.errorMessage}>{formik.errors.author_email}</div>
                        )} */}
                    </div>

                    {/* Buttons */}
                    <div style={{ textAlign: 'center' }}>
                        <Button disabled={!formik.isValid}
                            className={styles.saveButton} type="primary"
                            htmlType="submit">
                            <i className="fi fi-rr-disk"></i> Save Draft
                        </Button>
                        &nbsp;&nbsp;&nbsp;&nbsp;
                        <Button className={styles.deleteButton}
                            type="primary"
                            // onClick={handleClearDraft}
                            onClick={() => setShowModal(true)}
                        >
                            <i className="fi fi-rr-trash"></i> Clear Draft
                        </Button>
                    </div>
                </form>
                {/* Ant Design Modal */}
                <Modal
                    title="Confirm Clear"
                    centered
                    open={showModal}
                    onOk={handleClearDraft}
                    onCancel={() => setShowModal(false)}
                    okText="Clear Draft"
                    okButtonProps={{ danger: true }}
                    cancelText="Cancel"
                >
                    Are you sure you want to clear this draft? This action cannot be undone.
                </Modal>


            </div>
            <hr />
        </div>

    );
}

export default ArticleInfo;