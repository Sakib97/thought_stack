import { toast } from "react-hot-toast";
import styles from "../styles/CustomToast.module.css"; // create simple styling if needed
const getIcon = (type) => {
    switch (type) {
        case "success":
            return "fa-solid fa-circle-check";
        case "error":
            return "fa-solid fa-circle-xmark";
        case "info":
            return "fa-solid fa-circle-info";
        case "warning":
            return "fa-solid fa-triangle-exclamation";
        case "save":
            return "fa-solid fa-floppy-disk";
        case "delete":
            return "fi fi-rr-trash";
        case "exclamation":
            return "fi fi-br-exclamation";
        default:
            return "fa-solid fa-circle-info";
    }
};

const getBorderColor = (type) => {
    switch (type) {
        case "success":
            return 'green';
        case "error":
            return 'red';
        case "info":
            return 'blue';
        case "warning":
            return 'orange';
        case "save":
            return 'green';
        case "delete":
            return 'red';
        case "exclamation":
            return 'red';
        default:
            return 'white';
    }
};

export const showToast = (message, type = "info", id = null) => {
    // dismiss existing toast with same ID before showing new one
    if (id) toast.dismiss(id);

    toast((t) => (
        <div className={styles.customToastContainer}>
            <i className={`${getIcon(type)}`} style={{ fontSize: '20px', color: getBorderColor(type) }}></i>
            &nbsp;
            {message}
            <div className={styles.crossBtn} onClick={() => toast.dismiss(t.id)}>
                <i className="fa-solid fa-xmark"></i>
            </div>
        </div>
    ),
        {
            id,
            style: {
                borderRadius: '10px',
                background: '#fff',
                color: 'black',
                border: `2px solid ${getBorderColor(type)}`,
                fontSize: '18px',
            },
            duration: type === 'error' ? 4000 : 3000,
        }
    );
}