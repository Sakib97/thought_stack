import { Popover } from 'antd';
import styles from '../styles/ActionsBtn.module.css';
import { showToast } from '../../../components/layout/CustomToast';
import { createBurstRateLimitedAction } from '../../../utils/rateLimit';


const RefreshBtn = ({ refreshTrigger, setRefreshTrigger }) => {
    // console.log(refreshTrigger);

    const content = (
        <div style={{ fontWeight: '700' }}>
            Refresh
        </div>
    );
    const handleRefresh = () => {
        setRefreshTrigger(prev => prev + 1); // trigger re-fetch safely
    };

    const toggleRefreshThrottled = createBurstRateLimitedAction("refresh", 10000, 2, handleRefresh);

    return (
        <div>
            <Popover content={content} >

                <i style={{ fontSize: '22px', color: '#994a06' }}
                    // onClick={handleRefresh}
                    onClick={toggleRefreshThrottled}
                    className={`${styles.refreshBtn} fi fi-br-refresh
                `}></i>
            </Popover>
        </div>
    );
}

export default RefreshBtn;