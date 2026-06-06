import { Skeleton } from "antd";

const ArticleDetailsSkeleton = () => {
  // is Mobile viewport
  const isMobile = window.innerWidth <= 768;

  return (
    <div
      style={{
        backgroundColor: "rgb(232, 223, 213)",
        paddingTop: 20,
        paddingBottom: 20,
        minHeight: "100vh",
      }}
    >
      <div
        style={{
          margin: "10px 90px",
          // mirrors .articleContainer + .articleHead max-width
        }}
        className="article-skeleton-container"
      >
        <style>{`
                    @media (max-width: 768px) {
                        .article-skeleton-container {
                            margin: 10px !important;
                        }
                    }
                `}</style>

        <div 
        style={{ 
            maxWidth: 1100, 
            margin: "0 auto" 
            }}>
          {/* PDF button placeholder */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginBottom: 10,
            }}
          >
            <Skeleton.Button
              active
              style={{ width: 140, height: 36, borderRadius: 4 }}
            />
          </div>

          {/* Event title */}
          <Skeleton.Input
            active
            style={{
              width: "30%",
              height: 16,
              marginBottom: 12,
              display: "block",
            }}
          />
          <br />

          {/* Article title */}
          <Skeleton.Input
            active
            style={{
              width:  isMobile ? "80vw" : "55vw",
              height: 26,
              marginBottom: 14,
              display: "block",
            }}
          />

          {/* Subtitle */}
          <Skeleton
            active
            title={false}
            paragraph={{ rows: 2, width: ["90%", "70%"] }}
            style={{ marginBottom: 14 }}
          />

          <div style={{ display: "flex", justifyContent: "center" }}>
            <Skeleton.Node
              active
              style={{
                width:  isMobile ? "80vw" : "55vw",
                height: "clamp(180px, 40vw, 450px)",
                borderRadius: 4,
                display: "block",
                // marginLeft: isMobile ? "0px" : "80px",
                // marginRight: "auto",
              }}
            />
          </div>
          {/* Cover image */}

          {/* Image caption */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: 8,
              marginBottom: 16,
            }}
          >
            <Skeleton.Input active style={{ width: "40%", height: 14 }} />
          </div>

          {/* Author row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginTop: 10,
              marginBottom: 20,
            }}
          >
            <Skeleton.Avatar active size={50} />
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <Skeleton.Input active style={{ width: 160, height: 18 }} />
              <Skeleton.Input active style={{ width: 100, height: 13 }} />
            </div>
          </div>

          <hr />

          {/* Audio player placeholder */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              margin: "16px 0 20px",
            }}
          >
            <Skeleton.Input
              active
              style={{
                width: "min(100%, 800px)",
                height: 40,
                borderRadius: 20,
              }}
            />
          </div>

          {/* Article body paragraphs */}
          <div style={{ maxWidth: 800, margin: "0 auto" }}>
            <Skeleton
              active
              title={false}
              paragraph={{
                rows: 5,
                width: ["100%", "100%", "100%", "100%", "80%"],
              }}
            />
            <br />
            <Skeleton
              active
              title={false}
              paragraph={{
                rows: 5,
                width: ["100%", "100%", "100%", "100%", "65%"],
              }}
            />
            <br />
            <Skeleton
              active
              title={false}
              paragraph={{ rows: 4, width: ["100%", "100%", "100%", "55%"] }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleDetailsSkeleton;
