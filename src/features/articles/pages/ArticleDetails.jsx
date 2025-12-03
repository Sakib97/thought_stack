import styles from "../styles/ArticleDetails.module.css";
import { decodeId } from "../../../utils/hashUtil";
import { useParams } from "react-router-dom";
import { supabase } from "../../../config/supabaseClient";
import { useLanguage } from "../../../context/LanguageProvider";
import { getFormattedTime } from "../../../utils/dateUtil";
import { useState, useEffect, useRef } from "react";
import ArticleReactions from "../components/ArticleReactions";
import { useAuth } from "../../../context/AuthProvider";
import ArticleComment from "../components/ArticleComment";
import Spinner from 'react-bootstrap/Spinner';
import { useQuery } from "@tanstack/react-query";
import { PDFDownloadLink } from "@react-pdf/renderer";
import ArticlePDF from "../components/ArticlePDF";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import html2pdf from "html2pdf.js";
import { showToast } from "../../../components/layout/CustomToast";

const ArticleDetails = () => {
    const { user, userMeta } = useAuth();
    const { articleID, articleTitleSlug } = useParams();
    const articleId = decodeId(articleID);

    const audioRef = useRef(null);
    const articleRef = useRef(null);
    const currentWordIndexRef = useRef(-1);
    const currentHighlightedElementRef = useRef(null);

    const [transcript, setTranscript] = useState(null);
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
    const [isPdfButtonHovered, setIsPdfButtonHovered] = useState(false);

    const { language } = useLanguage();

    const [fontFamily, setFontFamily] = useState("Roboto Serif");
    useEffect(() => {
        if (language === "en") setFontFamily("Roboto Serif");
        if (language === "bn") setFontFamily('"Noto Serif Bengali", serif');
    }, [language]);

    // Scroll to top when article changes
    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }, [articleId]);

    // Fetch article using useQuery
    const {
        data: article,
        isLoading: loading,
        error: fetchError
    } = useQuery({
        queryKey: ['article', articleId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("articles_secure")
                .select(
                    "title_en,\
                    title_bn,\
                    subtitle_en,\
                    subtitle_bn,\
                    content_en,\
                    content_bn,\
                    created_at,\
                    cover_img_link,\
                    cover_img_cap_en,\
                    cover_img_cap_bn,\
                    author_name,\
                    author_img_link,\
                    publish_author_email,\
                    author_email, \
                    article_slug , \
                    event_title_en, \
                    event_title_bn \
                    "
                )
                .eq("id", articleId)
                .single();

            if (error) throw error;
            return data;
        },
        staleTime: 20 * 60 * 1000, // 20 minutes
        cacheTime: 30 * 60 * 1000, // 30 minutes
        enabled: !!articleId, // Only run query if articleId exists
    });

    // Check if audio file exists in Supabase Storage
    const { data: audioExists } = useQuery({
        queryKey: ["article-audio-exists", article?.article_slug, language],
        enabled: !!article?.article_slug && !!language,
        queryFn: async () => {
            const folder = language === "bn" ? "bn" : "en";
            const filename = `${article.article_slug}_${language}.mp3`;
            const { data, error } = await supabase
                .storage
                .from("article-audio")
                .list(folder, { search: filename, limit: 1 });

            if (error) throw error;
            return Array.isArray(data) && data.some(f => f.name === filename);
        },
        staleTime: 20 * 60 * 1000, // 20 minutes
    });

    // Fetch audio URL from Supabase Storage based on language and slug
    const {
        data: audioUrl,
        isLoading: audioLoading,
        error: audioError,
    } = useQuery({
        queryKey: ["article-audio", article?.article_slug, language],
        enabled: !!article?.article_slug && !!language,
        queryFn: async () => {
            // Files are stored in bucket 'article-audio' under /en and /bn
            const folder = language === "bn" ? "bn" : "en";
            const filename = `${article.article_slug}_${language}.mp3`;
            const path = `${folder}/${filename}`;

            // If bucket is public, getPublicUrl is enough (no network request)
            const { data } = supabase.storage
                .from("article-audio")
                .getPublicUrl(path);

            return data.publicUrl;
        },
        staleTime: 10 * 60 * 1000, // 10 minutes
    });

    // Fetch the transcript from Supabase Storage
    // const { data: transcript } = useQuery({
    const { data: transcriptData } = useQuery({
        queryKey: ["article-transcript", article?.article_slug, language],
        enabled: !!article?.article_slug && !!language,
        queryFn: async () => {
            const folder = language === "bn" ? "bn" : "en";
            const filename = `${article.article_slug}_${language}.json`;
            const path = `${folder}/${filename}`;

            const { data, error } = await supabase.storage
                .from("article-audio")
                .download(path);

            if (error) {
                if (error.status === 404) {
                    return null; // Transcript does not exist
                }
                throw error;
            }

            const text = await data.text();
            return JSON.parse(text); // { words: [ {word,start,end}, ... ] }
        },
        staleTime: 60 * 60 * 1000, // 1 hour - cache longer since transcripts rarely change
        cacheTime: 24 * 60 * 60 * 1000, // 24 hours - keep in cache even when unmounted
        retry: false, // Don't retry if transcript doesn't exist (404)
        refetchOnWindowFocus: false, // Don't refetch when window regains focus
        refetchOnReconnect: false, // Don't refetch when network reconnects
    });

    useEffect(() => {
        setTranscript(transcriptData);
    }, [transcriptData]);

    // wrap words in DOM after HTML renders
    function wrapWords(rootElement) {
        if (!rootElement) return;

        let index = 0;

        const walk = (node) => {
            if (node.nodeType === Node.TEXT_NODE) {
                const parts = node.textContent.split(/(\s+)/);

                if (parts.length > 1) {
                    const frag = document.createDocumentFragment();

                    parts.forEach((part) => {
                        if (part.trim().length === 0) {
                            frag.appendChild(document.createTextNode(part));
                        } else {
                            const span = document.createElement("span");
                            span.textContent = part;
                            span.dataset.wordIndex = index++;
                            frag.appendChild(span);
                        }
                    });

                    node.replaceWith(frag);
                }
            } else {
                Array.from(node.childNodes).forEach(walk);
            }
        };

        walk(rootElement);
    }

    useEffect(() => {
        if (!transcript) return;
        if (!articleRef.current) return;
        if (!article) return;

        // Clear previous spans (important when navigating)
        articleRef.current.innerHTML =
            language === "en" ? article.content_en : article.content_bn;

        wrapWords(articleRef.current);

        // Reset highlight tracking
        currentWordIndexRef.current = -1;
        currentHighlightedElementRef.current = null;
    }, [transcript, articleId, language, article]);

    // Highlight the Word During Audio Playback - Optimized version
    function highlightWord(i) {
        // Skip if already highlighting this word
        if (currentWordIndexRef.current === i) return;

        // Remove previous highlight
        if (currentHighlightedElementRef.current) {
            currentHighlightedElementRef.current.classList.remove(styles.highlightedWord);
        }

        // Add new highlight
        const el = document.querySelector(`[data-word-index="${i}"]`);
        if (el) {
            el.classList.add(styles.highlightedWord);
            el.scrollIntoView({ behavior: "smooth", block: "center" });
            currentHighlightedElementRef.current = el;
            currentWordIndexRef.current = i;
        }
    }

    // listen for audio timeupdate - Optimized with binary search
    useEffect(() => {
        const audioElement = audioRef.current;
        if (!audioElement || !transcript?.words?.length) return;

        let lastWordIndex = -1;

        const onTimeUpdate = () => {
            const t = audioElement.currentTime;

            // Binary search for better performance on large transcripts
            let left = 0;
            let right = transcript.words.length - 1;
            let foundIndex = -1;

            while (left <= right) {
                const mid = Math.floor((left + right) / 2);
                const word = transcript.words[mid];

                if (t >= word.start && t <= word.end) {
                    foundIndex = mid;
                    break;
                } else if (t < word.start) {
                    right = mid - 1;
                } else {
                    left = mid + 1;
                }
            }

            // Only update if we found a word and it's different from the last one
            if (foundIndex !== -1 && foundIndex !== lastWordIndex) {
                highlightWord(foundIndex);
                lastWordIndex = foundIndex;
            }
        };

        // Small delay to ensure audio element is ready after language toggle
        const timeoutId = setTimeout(() => {
            if (audioElement) {
                audioElement.addEventListener("timeupdate", onTimeUpdate);
            }
        }, 100);

        return () => {
            clearTimeout(timeoutId);
            if (audioElement) {
                audioElement.removeEventListener("timeupdate", onTimeUpdate);
            }
        };
    }, [transcript, audioUrl, language]); // Re-attach listener when audio changes

    // Function to generate PDF from HTML content
    const generatePDF = async () => {
        if (!article) return;

        setIsGeneratingPDF(true);

        try {
            // Create a temporary container with the article content
            const tempContainer = document.createElement('div');
            tempContainer.style.padding = '40px';
            tempContainer.style.paddingTop = '60px'; // Extra space for header
            tempContainer.style.fontFamily = fontFamily;
            tempContainer.style.lineHeight = '1.6';
            tempContainer.style.maxWidth = '800px';
            tempContainer.style.margin = '0 auto';
            tempContainer.style.position = 'relative';

            // Add title, subtitle, and content
            const titleEl = document.createElement('h1');
            titleEl.textContent = language === "en" ? article.title_en : article.title_bn;
            titleEl.style.marginBottom = '10px';
            tempContainer.appendChild(titleEl);

            const subtitleEl = document.createElement('p');
            subtitleEl.textContent = language === "en" ? article.subtitle_en : article.subtitle_bn;
            subtitleEl.style.fontSize = '16px';
            subtitleEl.style.color = '#666';
            subtitleEl.style.marginBottom = '20px';
            tempContainer.appendChild(subtitleEl);

            // // Add cover image
            // const coverImgEl = document.createElement('img');
            // coverImgEl.src = article.cover_img_link;
            // coverImgEl.style.width = '100%';
            // coverImgEl.style.height = 'auto';
            // coverImgEl.style.marginBottom = '10px';
            // coverImgEl.style.borderRadius = '4px';
            // tempContainer.appendChild(coverImgEl);

            // // Add cover image caption
            // const coverImgCaptionEl = document.createElement('p');
            // coverImgCaptionEl.textContent = language === "en" ? article.cover_img_cap_en : article.cover_img_cap_bn;
            // coverImgCaptionEl.style.fontSize = '12px';
            // coverImgCaptionEl.style.color = '#999';
            // coverImgCaptionEl.style.fontStyle = 'italic';
            // coverImgCaptionEl.style.textAlign = 'center';
            // coverImgCaptionEl.style.marginBottom = '30px';
            // tempContainer.appendChild(coverImgCaptionEl);

            const authorEl = document.createElement('p');
            authorEl.textContent = `${article.author_name} • ${getFormattedTime(article.created_at)}`;
            authorEl.style.fontSize = '14px';
            authorEl.style.color = '#999';
            authorEl.style.marginBottom = '30px';
            tempContainer.appendChild(authorEl);



            const contentEl = document.createElement('div');
            contentEl.innerHTML = language === "en" ? article.content_en : article.content_bn;
            contentEl.style.fontSize = '14px';
            contentEl.style.textAlign = 'justify';
            tempContainer.appendChild(contentEl);

            // Add disclaimer at the end
            const disclaimerEl = document.createElement('div');
            disclaimerEl.style.fontStyle = 'italic';
            disclaimerEl.style.fontSize = '12px';
            disclaimerEl.style.color = '#666';
            disclaimerEl.style.marginTop = '30px';
            disclaimerEl.style.marginBottom = '10px';
            disclaimerEl.textContent = language === "en"
                ? "* The views and opinions expressed in this article are author's own and do not necessarily reflect the publisher's point of view."
                : "* লেখকের নিজস্ব মতামত";
            tempContainer.appendChild(disclaimerEl);

            // Add author email if publish_author_email is true
            if (article.publish_author_email && article.author_email) {
                const authorEmailEl = document.createElement('div');
                authorEmailEl.style.fontSize = '12px';
                authorEmailEl.style.fontWeight = 'bold';
                authorEmailEl.style.color = '#666';
                authorEmailEl.style.marginBottom = '10px';
                authorEmailEl.textContent = `Author Email: ${article.author_email}`;
                tempContainer.appendChild(authorEmailEl);
            }

            // Temporarily add to document
            document.body.appendChild(tempContainer);

            // Configure html2pdf options with custom page handler for header, footer, and watermark
            const options = {
                margin: [25, 15, 25, 15], // top, right, bottom, left - increased for header/footer
                filename: `${article.article_slug}_${language}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: {
                    scale: 2,
                    useCORS: true,
                    logging: false
                },
                jsPDF: {
                    unit: 'mm',
                    format: 'a4',
                    orientation: 'portrait'
                },
                pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
            };

            // Generate PDF with header, footer, and watermark
            const worker = html2pdf().set(options).from(tempContainer);

            await worker.toPdf().get('pdf').then((pdf) => {
                const totalPages = pdf.internal.getNumberOfPages();
                const pageWidth = pdf.internal.pageSize.getWidth();
                const pageHeight = pdf.internal.pageSize.getHeight();

                for (let i = 1; i <= totalPages; i++) {
                    pdf.setPage(i);

                    // Add Header
                    pdf.setFontSize(10);
                    pdf.setTextColor(100, 100, 100);
                    pdf.text('The Fountainhead', pageWidth / 2, 12, { align: 'center' });

                    // Add header line
                    pdf.setDrawColor(200, 200, 200);
                    pdf.setLineWidth(0.5);
                    pdf.line(15, 16, pageWidth - 15, 16);

                    // Add Watermark (diagonal across the page)
                    pdf.setFontSize(60);
                    pdf.setTextColor(189, 189, 189); // Light gray for watermark
                    pdf.saveGraphicsState();
                    pdf.setGState(new pdf.GState({ opacity: 0.3 }));

                    // Rotate and position watermark in center
                    const watermarkText = 'The Fountainhead';
                    pdf.text(watermarkText, pageWidth / 1.5, pageHeight / 1.5, {
                        align: 'center',
                        angle: 45
                    });
                    pdf.restoreGraphicsState();

                    // Add footer line
                    pdf.setDrawColor(200, 200, 200);
                    pdf.setLineWidth(0.5);
                    pdf.line(15, pageHeight - 16, pageWidth - 15, pageHeight - 16);

                    // Add Footer with page number
                    pdf.setFontSize(10);
                    pdf.setTextColor(100, 100, 100);
                    pdf.text('The Fountainhead', 15, pageHeight - 10);
                    pdf.text(`Page ${i} of ${totalPages}`, pageWidth - 15, pageHeight - 10, { align: 'right' });
                }
            }).save();

            // Clean up
            document.body.removeChild(tempContainer);
        } catch (error) {
            console.error('Error generating PDF:', error);
            showToast('Error generating PDF. Please try again later.', 'error');
        } finally {
            setIsGeneratingPDF(false);
        }
    };

    const error = fetchError?.message;

    if (loading) {
        return (
            <div
                className={styles.article}
                style={{ textAlign: "center", padding: "2rem", height: "60vh" }}
            >
                {/* <Spin indicator={<LoadingOutlined spin />} size="large" /> */}
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
            </div>
        );
    }

    if (error || !article || article.article_slug !== articleTitleSlug) {
        return (
            <div
                className={styles.article}
                style={{
                    textAlign: "center",
                    padding: "2rem",
                    height: "100vh",
                }}
            >
                <p>Could not load article.</p>
            </div>
        );
    }

    const title = language === "en" ? article.title_en : article.title_bn;
    const description =
        language === "en"
            ? article.subtitle_en
            : article.subtitle_bn || "Read this article on Thought Stack.";
    const imageUrl = article.cover_img_link;
    const url = window.location.href;
    // console.log("url:", url);

    return (
        <>
            <div>
                <link
                    href="https://fonts.googleapis.com/css2?family=Noto+Serif+Bengali:wght@100..900&display=swap"
                    rel="stylesheet"
                />
                <div className={`${styles.article}`}>
                    <div className={`containers ${styles.articleContainer}`}>
                        <div style={{ textAlign: "right", marginBottom: "10px" }}>
                            <button
                                onClick={generatePDF}
                                disabled={isGeneratingPDF}
                                onMouseEnter={() => setIsPdfButtonHovered(true)}
                                onMouseLeave={() => setIsPdfButtonHovered(false)}
                                style={{
                                    display: "inline-block",
                                    padding: "8px 14px",
                                    background: isGeneratingPDF ? "#666" : (isPdfButtonHovered ? "#333" : "#000"),
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: "4px",
                                    textDecoration: "none",
                                    fontSize: "14px",
                                    cursor: isGeneratingPDF ? "not-allowed" : "pointer",
                                    transition: "background 0.2s ease"
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <div style={{ transform: 'translateY(2px)' }}>
                                        <i style={{ fontSize: '20px' }} className="fi fi-bs-cloud-download"></i>
                                    </div>
                                    &nbsp;&nbsp;
                                    {isGeneratingPDF ? "Generating PDF..." : "Download PDF"}
                                </div>

                            </button>
                        </div>

                        <div className={`${styles.articleHead}`}>
                            <h6 style={{ color: 'grey', fontFamily: fontFamily }}>
                                {language === "en" ? article.event_title_en
                                    : article.event_title_bn} </h6>

                            <h1 style={{ fontFamily: fontFamily }}>
                                {language === "en"
                                    ? article.title_en
                                    : article.title_bn}
                            </h1>
                            <span style={{ fontSize: '19px', fontFamily: fontFamily }}>
                                {language === "en"
                                    ? article.subtitle_en
                                    : article.subtitle_bn}
                            </span>
                            <img
                                src={article.cover_img_link}
                                alt={
                                    language === "en"
                                        ? article.title_en
                                        : article.title_bn
                                }
                                className={styles.articleImage}
                            />

                            <div
                                className={`${styles.articleImageCaption}`}
                                style={{ fontFamily: fontFamily }}
                            >
                                {language === "en"
                                    ? article.cover_img_cap_en
                                    : article.cover_img_cap_bn}
                            </div>

                            <div className={`${styles.authorAndDateOfArticle}`}>
                                <div className={`${styles.authorPicOfArticle}`}>
                                    <img
                                        src={article.author_img_link}
                                        alt={article.author_name}
                                        className={styles.authorPicOfArticle}
                                    />
                                </div>
                                <div className={`${styles.authorNameOfArticle}`}>
                                    <span
                                        style={{
                                            color: "black",
                                            fontSize: "18px",
                                            fontWeight: "bold",
                                            fontFamily: fontFamily,
                                        }}
                                    >
                                        {article.author_name}
                                    </span>

                                    <br />
                                    <div
                                        style={{ fontSize: "13px", color: "gray" }}
                                    >
                                        {getFormattedTime(article.created_at)}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <hr />

                        {/* Article Body */}
                        <div className={`${styles.articleBody}`}>
                            {/* audio transcript section */}
                            <div style={{ textAlign: 'center' }}>
                                {audioLoading && (
                                    <div style={{ padding: "0.5rem" }}>
                                        <Spinner animation="border" role="status" size="sm">
                                            <span className="visually-hidden">Loading...</span>
                                        </Spinner>
                                    </div>
                                )}
                                {!audioLoading && audioUrl && audioExists && (
                                    <audio
                                        ref={audioRef}
                                        key={`${articleId}-${language}`}
                                        src={audioUrl}
                                        controls
                                        preload="metadata"
                                        style={{ width: "100%" }}
                                    />
                                )}
                                {!audioLoading && !audioUrl && (
                                    <div style={{ fontSize: "14px", color: "gray" }}>
                                        {audioError ? "Audio unavailable" : "No audio provided for this article."}
                                    </div>
                                )}
                            </div>

                            <div
                                style={{ textAlign: "justify", fontSize: "18px" }}
                                className={`${styles.articleBodyText}`}
                            >
                                <div
                                    style={{ textAlign: "justify" }}
                                    className={styles.articleBodyText}
                                >
                                    <div
                                        ref={articleRef}
                                        style={{
                                            textAlign: "justify",
                                            fontFamily: fontFamily,
                                        }}
                                        className={styles.articleBodyText}
                                        dangerouslySetInnerHTML={{
                                            __html:
                                                language === "en"
                                                    ? article.content_en
                                                    : article.content_bn,
                                        }}
                                    />
                                </div>
                            </div>

                            <hr />
                            {/* disclaimer section*/}
                            <div>
                                <div
                                    style={{
                                        fontStyle: "italic",
                                        fontSize: "14px",
                                        color: "#666",
                                        marginBottom: "13px",
                                        fontFamily: fontFamily,
                                    }}
                                >
                                    {language === "en"
                                        ? "* The views and opinions expressed in this article are author's own and do not necessarily reflect the publisher's point of view."
                                        : "* লেখকের নিজস্ব মতামত "}
                                </div>
                                <div
                                    style={{
                                        fontSize: "14px",
                                        fontWeight: "bold",
                                        color: "#666",
                                        marginBottom: "13px",
                                    }}
                                >
                                    {article.publish_author_email && (
                                        <>Author Email: {article.author_email}</>
                                    )}
                                </div>
                            </div>
                        </div>
                        <hr />
                        <ArticleReactions
                            articleId={articleId}
                            userId={user?.id}
                            isActive={userMeta?.is_active}
                        />
                        <hr />
                        <ArticleComment articleId={articleId} userMeta={userMeta} />

                    </div>

                </div>
            </div>
        </>
    );
};

export default ArticleDetails;