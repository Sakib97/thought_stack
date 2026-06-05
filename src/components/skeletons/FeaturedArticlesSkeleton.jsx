import { Skeleton } from "antd";

const CARD_COUNT = 4;

const FeaturedArticlesSkeleton = () => {
  return (
    <div
      style={{
        padding: "20px 20px",
        backgroundColor: "#f8f9fa",
        borderRadius: "20px",
        margin: "40px auto",
      }}
    >
      {/* Section title placeholder */}
      <div style={{ marginBottom: 40 }}>
        <Skeleton.Input
          active
          style={{ width: 220, height: 32, marginBottom: 12 }}
        />
        <div
          style={{
            width: 60,
            height: 4,
            backgroundColor: "#d9d9d9",
            borderRadius: 2,
            marginTop: 8,
          }}
        />
      </div>

      {/* Horizontal scrollable row of card skeletons */}
      <div style={{ display: "flex", gap: 24, overflowX: "hidden" }}>
        {Array.from({ length: CARD_COUNT }).map((_, i) => (
          <div
            key={i}
            style={{
              minWidth: 350,
              maxWidth: 350,
              flexShrink: 0,
              background: "white",
              borderRadius: 12,
              overflow: "hidden",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            }}
          >
            {/* Cover image */}
            <Skeleton.Node
              active
              style={{
                width: 350,
                height: 200,
                borderRadius: 0,
                display: "block",
              }}
            />
            {/* Card text */}
            <div style={{ padding: "16px" }}>
              <Skeleton
                active
                title={{ width: "85%", style: { height: 22 } }}
                paragraph={{ rows: 3, width: ["100%", "90%", "50%"] }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeaturedArticlesSkeleton;
