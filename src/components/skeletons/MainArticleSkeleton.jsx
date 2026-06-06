import { Skeleton } from "antd";

const MainArticleSkeleton = () => {
  return (
    <div
      style={{
        position: "relative",
        width: "100vw",
        marginLeft: "-5vw",
        height: "67vh",
        borderRadius: "6px",
        overflow: "hidden",
        // background: "#e8e8e8",
        background: "#f5f1f1",
      }}
    >
      {/* Image placeholder */}
      <Skeleton.Node
        active
        style={{ width: "100vw", height: "100vh", borderRadius: 0 }}
      />
      {/* Text overlay placeholder at the bottom */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "67vh",
          display: "flex",
          alignItems: "flex-end",
          padding: "5vh 7vw 2vh 5vw",
        //   background:
        //     "linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.45) 45%, rgba(0,0,0,0) 100%)",
        }}
      >
        <Skeleton
          active
          title={{
            width: "60%",
            style: {
              height: 32,
            //   background: "rgba(255,255,255,0.25)",
              background: "rgba(27, 26, 26, 0.19)",
              borderRadius: 4,
            },
          }}
          paragraph={{
            rows: 2,
            style: { marginTop: 12 },
            width: ["80%", "40%"],
          }}
          style={{
            "--ant-skeleton-color": "rgba(27, 26, 26, 0.19)",
            "--ant-skeleton-to-color": "rgba(27, 26, 26, 0.35)",
          }}
        />
      </div>
    </div>
  );
};

export default MainArticleSkeleton;
