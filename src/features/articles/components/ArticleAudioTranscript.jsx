import { useState, useEffect } from "react";
import { supabase } from "../../../config/supabaseClient";
import { showToast } from "../../../components/layout/CustomToast";
import ListGroup from 'react-bootstrap/ListGroup';
import Button from 'react-bootstrap/Button';
import { Collapse, Progress, Modal } from 'antd';
import styles from "../styles/ArticleAudioTranscript.module.css";
import { InboxOutlined } from '@ant-design/icons';
import { Upload } from 'antd';
import { useLanguage } from "../../../context/LanguageProvider";
import { slugify } from "../../../utils/slugAndStringUtil";

const { Dragger } = Upload;

const ArticleAudioTranscript = ({ editArticleTitleEn, isEditMode }) => {
    // console.log("article title: ", editArticleTitleEn, isEditMode);

    const { language } = useLanguage();
    const [fileList, setFileList] = useState([]);
    const [progress, setProgress] = useState({}); // { filename: { percent, status } }
    const [isUploading, setIsUploading] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [deletingFile, setDeletingFile] = useState(null); // Track which file is being deleted
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [fileToDelete, setFileToDelete] = useState(null); // Which uploaded file is selected to delete

    // Get the correct article title based on mode
    const getArticleTitleEn = () => {
        if (isEditMode) {
            return editArticleTitleEn;
        }
        const savedDraft = localStorage.getItem('articleInfo');
        const parsedDraft = savedDraft ? JSON.parse(savedDraft) : null;
        return parsedDraft ? parsedDraft.title_en : null;
    };

    const articleTitleEn = getArticleTitleEn();



    const instructions = {
        en: [
            <>Upload <b>audio files</b> and <b>transcripts</b> of the article for both Bengali and English.</>,
            <span style={{ color: 'red' }}>** Toggle <b>EN</b> from <b>Navbar</b> to upload <b>English</b> audio and transcript.</span>,
            <span style={{ color: 'red' }}>** Toggle <b>BN</b> from <b>Navbar</b> to upload <b>Bengali</b> audio and transcript.</span>,
            <>If any file is missing, the <b>audio-synced text highlighting</b> will be unavailable for that language.</>,
            <>Supported formats: <b>.mp3</b> for audio, <b>.json</b> for transcripts.</>,
            <>Max file size: <b>10MB</b> each.</>,
            <>Ensure transcripts are time-synced for accurate word highlighting during playback.</>,
            <>You can upload all files together.</>
        ],
        bn: [
            <>বাংলা এবং ইংরেজি উভয় ভাষার জন্য আর্টিকেলের <b>অডিও ফাইল</b> এবং <b>ট্রান্সক্রিপ্ট</b> আপলোড করুন।</>,
            <span style={{ color: 'red' }}>** <b>Navbar</b> থেকে <b>EN</b> টগল করে ইংরেজি অডিও এবং ট্রান্সক্রিপ্ট আপলোড করুন।</span>,
            <span style={{ color: 'red' }}>** <b>Navbar</b> থেকে <b>BN</b> টগল করে বাংলা অডিও এবং ট্রান্সক্রিপ্ট আপলোড করুন।</span>,
            <>যদি কোনো ফাইল অনুপস্থিত থাকে, সেই ভাষার জন্য <b>অডিও-সিঙ্কড টেক্সট হাইলাইটিং</b> দেখা যাবে না।</>,
            <>ফরম্যাট: অডিওর জন্য <b>.mp3</b>, ট্রান্সক্রিপ্টের জন্য <b>.json</b>।</>,
            <>সর্বোচ্চ ফাইলের আকার: প্রতিটি ফাইল <b>১০ এমবি</b>।</>,
            <>প্লেব্যাকের সময় সঠিক শব্দ হাইলাইটিংয়ের জন্য ট্রান্সক্রিপ্টগুলি সময়-সিঙ্ক করা হয়েছে কিনা তা নিশ্চিত করুন।</>,
            <>আপনি সমস্ত ফাইল একসাথে আপলোড করতে পারেন।</>
        ]
    };

    const currentInstructions = instructions[language] || instructions.en;

    const ALLOWED_TYPES = ["audio/mpeg", "application/json"];
    const ALLOWED_EXTS = [".mp3", ".json"];

    // Fetch uploaded files on component mount and language change
    const fetchUploadedFiles = async () => {
        const currentTitle = getArticleTitleEn();
        if (!currentTitle) {
            setFileList([]);
            setUploadedFiles([]);
            return;
        };

        const articleSlug = slugify(currentTitle);

        try {
            const { data, error } = await supabase.storage
                .from("article-audio")
                .list(language, {
                    search: articleSlug
                });

            if (error) {
                console.error("Error fetching files:", error);
                return;
            }

            if (data) {
                setUploadedFiles(data);
            }
        } catch (err) {
            console.error("Error:", err);
        }
    };

    // Fetch files when component mounts, language changes, edit mode changes, or editArticleTitleEn changes
    useEffect(() => {
        fetchUploadedFiles();
    }, [language, isEditMode, editArticleTitleEn]);

    const handleDeleteFile = async (fileName) => {
        setDeletingFile(fileName); // Set the file being deleted

        try {
            const filePath = `${language}/${fileName}`;
            // console.log('fssilepath: ', filePath);

            const { error } = await supabase.storage
                .from("article-audio")
                .remove([filePath]);

            if (error) {
                console.error("Delete error:", error);
                showToast(`Failed to delete: ${fileName}`, "error");
            } else {
                showToast(
                    language === 'bn'
                        ? `"${fileName}" সফলভাবে মুছে ফেলা হয়েছে`
                        : `"${fileName}" deleted successfully`,
                    "success"
                );
                // Refresh the list
                fetchUploadedFiles();
            }
        } catch (err) {
            console.error("Delete error:", err);
            showToast(`Failed to delete: ${fileName}`, "error");
        } finally {
            setDeletingFile(null); // Clear the deleting state
        }
    };

    const handleUploadClick = async () => {
        if (fileList.length === 0) {
            showToast(language === 'bn' ? 'আপলোড করার জন্য ফাইল নির্বাচন করুন' : 'Please select files to upload', "warning");
            return;
        }

        const currentTitle = getArticleTitleEn();
        if (!currentTitle) {
            showToast(language === 'bn' ? 'প্রথমে একটি শিরোনাম সেট করুন' : 'Please set a title first !', "error");
            setFileList([]);
            return;
        }

        const articleSlug = slugify(currentTitle);
        setIsUploading(true);

        for (const file of fileList) {
            const fileSizeMB = file.size / (1024 * 1024);
            if (fileSizeMB > 10) {
                showToast(`${file.name} ${language === 'bn' ? 'ফাইলের আকার ১০ এমবির বেশি হতে পারে না।' : 'file size exceeds 10MB.'}`, "error");
                setProgress((prev) => ({ ...prev, [file.name]: { percent: 0, status: 'exception' } }));
                continue;
            }

            const fileExt = file.name.split('.').pop().toLowerCase();
            const newFileName = `${articleSlug}_${language}.${fileExt}`;
            const filePath = `${language}/${newFileName}`;

            // Check format
            if (!["mp3", "json"].includes(fileExt)) {
                showToast(`Invalid file format: ${fileExt}. Only .mp3 or .json allowed.`, "error");
                setProgress((prev) => ({ ...prev, [file.name]: { percent: 0, status: 'exception' } }));
                continue;
            }

            // Initialize progress
            setProgress((prev) => ({ ...prev, [file.name]: { percent: 0, status: 'active' } }));

            try {
                // Check if file already exists in storage
                const { data: existingFiles, error: listError } = await supabase.storage
                    .from("article-audio")
                    .list(language, {
                        search: newFileName
                    });

                if (listError) {
                    console.error("Error checking existing files:", listError);
                }

                // If file exists, show specific error
                if (existingFiles && existingFiles.length > 0) {
                    const fileExists = existingFiles.some(f => f.name === newFileName);
                    if (fileExists) {
                        setProgress((prev) => ({
                            ...prev,
                            [file.name]: { percent: 0, status: 'exception' }
                        }));
                        const duplicateMsg = language === 'bn'
                            ? `ফাইল "${newFileName}" ইতিমধ্যে আপলোড করা হয়েছে। প্রথমে পুরোনো ফাইলটি মুছুন।`
                            : `File "${newFileName}" already exists in storage. Please delete the old file first.`;
                        showToast(duplicateMsg, "error");
                        continue;
                    }
                }

                const fileToUpload = file.originFileObj || file;

                const { data, error } = await supabase.storage
                    .from("article-audio")
                    .upload(filePath, fileToUpload, {
                        upsert: false, // Changed to false to prevent overwriting
                        onUploadProgress: (e) => {
                            const percent = Math.round((e.loaded / e.total) * 100);
                            setProgress((prev) => ({
                                ...prev,
                                [file.name]: { percent, status: 'active' }
                            }));
                        },
                    });

                if (error) {
                    console.error("Upload error:", error);
                    setProgress((prev) => ({
                        ...prev,
                        [file.name]: { percent: 0, status: 'exception' }
                    }));
                    showToast(`Failed: ${newFileName} — ${error.message}`, "error");
                } else {
                    setProgress((prev) => ({
                        ...prev,
                        [file.name]: { percent: 100, status: 'success' }
                    }));
                    showToast(`Uploaded: ${newFileName}`, "success");
                    // Refresh uploaded files list
                    fetchUploadedFiles();
                }
            } catch (err) {
                console.error(err);
                setProgress((prev) => ({
                    ...prev,
                    [file.name]: { percent: 0, status: 'exception' }
                }));
                showToast(`Upload failed for ${file.name}`, "error");
            }
        }

        setIsUploading(false);

        // Clear file list and progress after a short delay to show final state
        setTimeout(() => {
            setFileList([]);
            setProgress({});
        }, 4000);
    };

    const draggerProps = {
        name: 'file',
        multiple: true,
        fileList: fileList,
        beforeUpload(file) {
            const isAllowed = ALLOWED_TYPES.includes(file.type) || ALLOWED_EXTS.some(ext => file.name.endsWith(ext));
            if (!isAllowed) {
                showToast(`Only .mp3 and .json files are allowed`, "error");
                return Upload.LIST_IGNORE; // Prevent upload
            }
            setFileList((prev) => [...prev, file]);
            return false; // Prevent automatic upload
        },
        onRemove(file) {
            setFileList((prev) => prev.filter((f) => f.uid !== file.uid));
        },
        onChange(info) {
            setFileList(info.fileList);
        },
        onDrop(e) {
            console.log('Dropped files', e.dataTransfer.files);
        },
    };


    return (
        <div>
            <div className={styles.sectionHeader}>
                {language === 'bn' ? 'Audio & Transcript Upload (বাংলা)' : 'Audio & Transcript Upload (English)'}
            </div>
            <div>
                <Collapse
                    collapsible="header"
                    defaultActiveKey={['1']}
                    style={{ marginBottom: '20px' }}
                    size="large"
                    items={[
                        {
                            key: '1',
                            label: <div className={styles.collapseHeader}>Instructions for Uploading <br className={styles.mobileBreak} /> Audio and Transcript Files</div>,
                            children:
                                <ListGroup className={styles.instructionList}>
                                    {currentInstructions.map((instruction, index) => (
                                        <ListGroup.Item key={index}>{instruction}</ListGroup.Item>
                                    ))}
                                </ListGroup>
                        },
                    ]}
                />
            </div>
            {/* <Dragger {...props}> */}
            <Dragger {...draggerProps}>
                <p className="ant-upload-drag-icon">
                    <InboxOutlined />
                </p>
                <p className="ant-upload-text">
                    {language === 'bn' ? 'এখানে ফাইল ক্লিক করুন বা টেনে আনুন' : 'Click or drag file to this area to upload'}</p>
                <p className="ant-upload-hint">
                    {language === 'bn' ? 'এক বা একাধিক ফাইল আপলোড করুন।' : 'Supports single or bulk upload.'}
                </p>
            </Dragger>

            {/* Progress bars */}
            {Object.keys(progress).length > 0 && (
                <div style={{ marginTop: 20 }}>
                    {fileList.map((file) => {
                        const fileProgress = progress[file.name] || { percent: 0, status: 'active' };
                        return (
                            <div key={file.uid} style={{ marginBottom: 10 }}>
                                <div style={{ fontSize: 14, marginBottom: 4 }}>
                                    {file.name} — {fileProgress.percent}%
                                </div>
                                <Progress
                                    percent={fileProgress.percent}
                                    status={fileProgress.status}
                                />
                            </div>
                        );
                    })}
                </div>
            )}

            <div className={styles.uploadBtnContainer}>
                <Button
                    variant="success"
                    className={styles.uploadBtn}
                    onClick={handleUploadClick}
                    disabled={isUploading || fileList.length === 0}
                >
                    <i className={`fi fi-rr-folder-upload ${styles.uploadIcon}`}></i>
                    {isUploading
                        ? (language === 'bn' ? 'আপলোড হচ্ছে...' : 'Uploading...')
                        : (language === 'bn' ? 'ফাইল আপলোড করুন' : 'Upload Files')
                    }
                </Button>
            </div>

            {/* Uploaded Files List */}
            {uploadedFiles.length > 0 && (
                <div style={{ marginTop: 30 }}>
                    <h5 style={{ marginBottom: 15, fontWeight: 600 }}>
                        {language === 'bn' ? 'আপলোড করা ফাইলসমূহ' : 'Uploaded Files'}
                    </h5>
                    <ListGroup>
                        {uploadedFiles.map((file) => {
                            const isDeleting = deletingFile === file.name;
                            return (
                                <div>
                                    <ListGroup.Item
                                        key={file.name}
                                        className="d-flex justify-content-between align-items-center"
                                    >
                                        <div>
                                            <i className={`fi ${file.name.endsWith('.mp3') ? 'fi-rr-music-file' : 'fi-rr-document'}`} style={{ marginRight: 10 }}></i>
                                            <span>{file.name}</span>
                                            <span style={{ marginLeft: 10, color: '#666', fontSize: 12 }}>
                                                ({(file.metadata?.size / 1024).toFixed(2)} KB)
                                            </span>
                                        </div>
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            onClick={() => {
                                                setFileToDelete(file);
                                                setShowDeleteModal(true);
                                            }}
                                            disabled={isDeleting}
                                            style={{ padding: '4px 12px' }}
                                        >
                                            <i className={isDeleting ? "fi fi-bs-menu-dots" : "fi fi-rr-trash"} style={{ fontSize: 14 }}></i>
                                        </Button>
                                    </ListGroup.Item>
                                </div>


                            );


                        })}
                    </ListGroup>
                </div>
            )}

            {/* Centralized Delete Confirmation Modal */}
            <Modal
                title={language === 'bn' ? 'ফাইল মুছুন নিশ্চিত করুন' : 'Confirm File Delete'}
                centered
                open={showDeleteModal}
                onOk={async () => {
                    if (fileToDelete) {
                        await handleDeleteFile(fileToDelete.name);
                    }
                    setShowDeleteModal(false);
                    setFileToDelete(null);
                }}
                onCancel={() => {
                    setShowDeleteModal(false);
                    setFileToDelete(null);
                }}
                okText={
                    deletingFile && fileToDelete && deletingFile === fileToDelete.name
                        ? (language === 'bn' ? 'মুছে যাচ্ছে...' : 'Deleting...')
                        : (language === 'bn' ? 'ফাইল মুছুন' : 'Delete File')
                }
                okButtonProps={{ danger: true }}
                cancelText={language === 'bn' ? 'বাতিল' : 'Cancel'}
            >
                {language === 'en' ? (
                    <>
                        Are you sure you want to delete this file?
                        This action cannot be undone.
                    </>
                ) : (
                    <>
                        আপনি কি নিশ্চিত যে আপনি এই ফাইলটি মুছে ফেলতে চান?
                        এটি আর ফেরত পাওয়া যাবে না।
                    </>
                )}
            </Modal>

        </div>
    );
}

export default ArticleAudioTranscript;