import { Skeleton, List } from "antd";
import { PAGE_SIZE } from "../../config/appConfig";

const ArticleListSkeleton = () => {
  return (
    <List
      itemLayout="vertical"
      size="large"
      dataSource={Array.from({ length: PAGE_SIZE }, (_, i) => i)}
      style={{ width: '100vw', padding: "0 20px" }}
      renderItem={() => (
        <List.Item
          extra={
            <Skeleton.Node
              active
              style={{ width: 250, height: 180, borderRadius: 4 }}
            />
          }
        >
          <List.Item.Meta
            avatar={<Skeleton.Avatar active size={40} />}
            title={<Skeleton.Input active style={{ width: 200, height: 22 }} />}
            description={
              <Skeleton.Input
                active
                style={{ width: 160, height: 16, marginTop: 4 }}
              />
            }
          />
          <div style={{ marginTop: 12 }}>
            <Skeleton
              active
              title={false}
              paragraph={{ rows: 2, width: ["90%", "60%"] }}
            />
          </div>
        </List.Item>
      )}
    />
  );
};

export default ArticleListSkeleton;
