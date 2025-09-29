import { useState, useEffect, useRef, useMemo } from "react";
import JoditEditor from 'jodit-react';
import styles from "../styles/ArticleInfo.module.css";
import { Button } from "antd";
import toast, { Toaster } from "react-hot-toast";
const RTE = ({ contentLanguage }) => {
    const editor = useRef(null);
    const [content, setContent] = useState('');

    // storage key based on language
    const storageKey = `articleContent_${contentLanguage}`;

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
            localStorage.setItem(storageKey, content);
            toast(
                contentLanguage === "en"
                    ? "Draft saved successfully"
                    : "ড্রাফট সেভ হয়েছে",
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
        } else {
            toast(
                contentLanguage === "en"
                    ? "Nothing to save"
                    : "সেভ করার মত কিছু নেই",
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
                }
            );
        }
    };

    // clear draft
    const handleClearDraft = () => {
        if (localStorage.getItem(storageKey)) {
            localStorage.removeItem(storageKey);
            setContent("");
            toast(
                contentLanguage === "en"
                    ? "Draft cleared"
                    : "ড্রাফট মুছে ফেলা হয়েছে",
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
                }
            );
        } else {
            toast(
                contentLanguage === "en" ? "Nothing to clear" : "মোছার কিছু নেই",
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
                }
            );
        }
    };


    return (<div style={{ marginTop: 24 }}>
        <Toaster />
        
        <div style={{justifyContent: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
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
                onClick={handleClearDraft}
            >
                <i className="fi fi-rr-trash"></i>
                {contentLanguage === 'en' ? 'Clear Draft' : 'ড্রাফট মুছে ফেলুন'}
            </Button>
        </div>

    </div>);
}

export default RTE; 