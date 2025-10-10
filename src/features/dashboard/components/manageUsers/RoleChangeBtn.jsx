import styles from '../../styles/ActionsBtn.module.css';
import { Popover } from 'antd';

const RoleChangeBtn = () => {
    const content = (
        <div>
            Change Role
        </div>
    );
    return (
        <div>
            <Popover content={content} >
                <i className={`${styles.actionIcon} fi fi-sr-career-growth`}></i>
            </Popover>
        </div>
    );
}

export default RoleChangeBtn;