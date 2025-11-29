import {
    Page,
    Text,
    View,
    Image,
    Document,
    StyleSheet
} from "@react-pdf/renderer";

const ArticlePDF = ({ article, language }) => {
    
    // Strip HTML tags and get plain text
    const getPlainText = (html) => {
        if (!html) return "";
        return html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
    };
    
    const content = language === "en" ? article.content_en : article.content_bn;

    const styles = StyleSheet.create({
        page: {
            padding: 30,
            fontSize: 12,
            lineHeight: 1.5
        },
        title: {
            fontSize: 26,
            fontWeight: "bold",
            marginBottom: 4
        },
        subtitle: {
            fontSize: 13,
            color: "#666",
            marginBottom: 16
        },
        image: {
            width: "100%",
            height: 260,
            objectFit: "cover",
            marginBottom: 5,
            borderRadius: 4
        },
        caption: {
            fontSize: 10,
            color: "#777",
            textAlign: "center",
            marginBottom: 20
        },
        authorRow: {
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 12
        },
        authorPic: {
            width: 40,
            height: 40,
            borderRadius: 20,
            marginRight: 10
        },
        authorName: {
            fontSize: 12,
            fontWeight: "bold"
        },
        date: {
            fontSize: 10,
            color: "#666"
        },
        body: {
            marginTop: 10
        },
        disclaimer: {
            marginTop: 20,
            fontStyle: "italic",
            fontSize: 10,
            color: "#666"
        }
    });

    return (
        <Document>
            <Page style={styles.page}>

                <Text style={{ fontSize: 12, color: "#999", marginBottom: 4 }}>
                    {language === "en" ? article.event_title_en : article.event_title_bn}
                </Text>

                <Text style={styles.title}>
                    {language === "en" ? article.title_en : article.title_bn}
                </Text>

                <Text style={styles.subtitle}>
                    {language === "en" ? article.subtitle_en : article.subtitle_bn}
                </Text>

                <Image style={styles.image} src={article.cover_img_link} />

                <Text style={styles.caption}>
                    {language === "en"
                        ? article.cover_img_cap_en
                        : article.cover_img_cap_bn}
                </Text>

                {/* Author */}
                <View style={styles.authorRow}>
                    <Image style={styles.authorPic} src={article.author_img_link} />
                    <View>
                        <Text style={styles.authorName}>{article.author_name}</Text>
                        <Text style={styles.date}>{article.created_at}</Text>
                    </View>
                </View>

                {/* Body text */}
                <View style={styles.body}>
                    <Text>{getPlainText(content)}</Text>
                </View>

                {/* Disclaimer */}
                <Text style={styles.disclaimer}>
                    {language === "en"
                        ? "* The views and opinions expressed in this article are the author's own and do not necessarily reflect the publisher's point of view."
                        : "* লেখকের নিজস্ব মতামত প্রকাশ করে, প্রকাশকের নয়।"}
                </Text>
            </Page>
        </Document>
    );
}

export default ArticlePDF;