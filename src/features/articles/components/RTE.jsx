import { useState, useEffect, useRef, useMemo } from "react";
import JoditEditor from 'jodit-react';
import styles from "../styles/ArticleInfo.module.css";
import { Button, Modal } from "antd";
import { Toaster } from "react-hot-toast";
import { showToast } from "../../../components/layout/CustomToast";

const RTE = ({ contentLanguage, content, setContent, isEditMode  }) => {
    const [showModal, setShowModal] = useState(false);
    const editor = useRef(null);
    // const [content, setContent] = useState('');

    // storage key based on language
    const storageKey = isEditMode ? `articleEditContent_${contentLanguage}` : `articleContent_${contentLanguage}`;
    // const storageKey = `articleContent_${contentLanguage}`; 

    // load content on mount
    useEffect(() => {
        const savedContent = localStorage.getItem(storageKey);
        if (savedContent) {
            setContent(savedContent);
        }
    }, [storageKey]);

    const config = useMemo(
        () => ({
            readonly: false, // all options from https://xdsoft.net/jodit/docs/,
            autofocus: false,
            placeholder: contentLanguage === 'en' ? 'Start Article Body...' : 'লিখা শুরু করুন...',
            minHeight: 500,
            maxHeight: 600,
            maxWidth: 900,
            // toolbarSticky: true,
            toolbarStickyOffset: 50,
            askBeforePasteHTML: false,
            defaultActionOnPaste: "insert_only_text",
            removeButtons:
                // language === 'bn' ?
                // ['font', 'speechRecognize', 'about', 'copyformat', 'classSpan', 'source', 'ai-commands', 'ai-assistant'] :
                ['speechRecognize', 'about', 'copyformat', 'classSpan', 'ai-commands', 'ai-assistant', 'file']
            ,
            events: {
                error: (error) => {
                    // Handle the error
                    console.error("Jodit Editor Error:", error);
                    // toast.error("An error occurred in the editor.", { duration: 2000 });
                },
            },
            // defaultMode: 3,
            statusbar: true,
            showXPathInStatusbar: false,
            showCharsCounter: false,
            hidePoweredByJodit: true,
            toolbarAdaptive: false,
            // toolbarAdaptive: true,
            controls: {
                paragraph: {
                    list: ({
                        p: 'Pharagraph',
                        h1: 'Heading 1',
                        h2: 'Heading 2',
                        h3: 'Heading 3',
                        h4: 'Heading 4',
                        blockquote: 'Quote',
                        div: 'Div',
                        pre: 'Source code'
                    })
                },
            },

        }),
        [contentLanguage]
    );

    // save draft
    const handleSaveDraft = () => {
        if (content.trim()) {
            // Prevent horizontal scrolling in the editor by indenting the first line of paragraphs
            // Create a temporary div to manipulate the HTML
            const tempDiv = document.createElement("div");
            tempDiv.innerHTML = content;

            // Add the "rteImage" class to all images
            const images = tempDiv.getElementsByTagName("img");
            for (let img of images) {
                for (let img of images) {
                    img.removeAttribute("width");
                    img.removeAttribute("height");
                    img.style.maxWidth = "100%";
                    img.style.height = "auto";
                    img.style.display = "block";
                    img.style.objectFit = "contain";
                }
            }

            // Save updated content back to localStorage
            const updatedContent = tempDiv.innerHTML;
            localStorage.setItem(storageKey, updatedContent);

            showToast(
                contentLanguage === "en"
                    ? "Draft saved successfully"
                    : "ড্রাফট সেভ হয়েছে",
                "save"
            );
        } else {
            showToast(
                contentLanguage === "en"
                    ? "Nothing to save"
                    : "সেভ করার মত কিছু নেই",
                "exclamation"
            );
        }
    };

    // clear draft
    const handleClearDraft = () => {
        setShowModal(false);
        
        if (localStorage.getItem(storageKey)) {
            localStorage.removeItem(storageKey);
            setContent("");
            showToast(
                contentLanguage === "en"
                    ? "Draft cleared"
                    : "ড্রাফট মুছে ফেলা হয়েছে",
                "delete"
            );
        } else {
            showToast(
                contentLanguage === "en" ? "Nothing to clear" : "মোছার কিছু নেই",
                "exclamation"
            );
        }
    };


    return (<div style={{ marginTop: 24 }}>
        <Toaster />

        <div style={{ justifyContent: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {contentLanguage === 'en' ? <h1>Article Content in English</h1> :
                <h1 style={{ marginTop: 40 }}>Article Content in Bangla</h1>}
            <JoditEditor
                ref={editor}
                value={content}
                config={config}
                tabIndex={1} // tabIndex of textarea
                onBlur={newContent => setContent(newContent)} // preferred to use only this option to update the content for performance reasons
                // onChange={newContent => { }}
                onChange={() => { }} // handled onBlur
            />
        </div>


        {/* Buttons */}
        <div style={{ textAlign: 'center', marginTop: 24 }}>
            <Button className={styles.saveButton}
                type="primary" htmlType="submit" onClick={handleSaveDraft}>
                <i className="fi fi-rr-disk"></i>
                {contentLanguage === 'en' ? 'Save Draft' : 'সেভ ড্রাফট'}
            </Button>
            &nbsp;&nbsp;&nbsp;&nbsp;
            <Button className={styles.deleteButton}
                type="primary"
                onClick={() => setShowModal(true)}
            >
                <i className="fi fi-rr-trash"></i>
                {contentLanguage === 'en' ? 'Clear Draft' : 'ড্রাফট মুছে ফেলুন'}
            </Button>
            &nbsp;&nbsp;&nbsp;&nbsp;
            {/* preview button */}
            <Button className={styles.previewButton}
                type="primary"
                onClick={() => {
                    const previewWindow = window.open("", "_blank");
                    previewWindow.document.write(`
                        <html>
                            <head>
                                <title>Article Preview</title>
                                <style>
                                    body { font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; }
                                    img { max-width: 100%; height: auto; display: block; margin: 10px 0; object-fit: contain; }
                                </style>
                            </head>
                            <body>
                            
                                ${content}
                            </body>
                        </html>
                    `);
                    previewWindow.document.close();
                }}
            >
                <i className="fi fi-rr-eye"></i>
                {contentLanguage === 'en' ? 'Preview' : 'প্রিভিউ'}
            </Button>
        </div>

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
            {contentLanguage === 'en' ?
                <>
                    Are you sure you want to clear this draft content ?
                    This action cannot be undone.
                </>
                :
                <>
                    আপনি কি নিশ্চিত যে আপনি এই খসড়া কন্টেন্টটি মুছে ফেলতে চান?
                    এটি আর ফেরত পাওয়া যাবে না।
                </>
            }

        </Modal>

    </div>);
}

export default RTE;