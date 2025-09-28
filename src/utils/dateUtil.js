import { formatDistanceToNow, parseISO, differenceInYears, differenceInMonths, differenceInWeeks, differenceInDays, differenceInHours, differenceInMinutes } from 'date-fns';

export const getFormattedTime = (dateStr) => {
    const date = new Date(dateStr);
    const formattedDate = date.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
    const formattedTime = date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
    });
    const finalFormattedString = `${formattedDate}, ${formattedTime}`;
    return finalFormattedString;
};

export const getOnlyYear = (dateStr) => {
    const date = new Date(dateStr);
    const formattedDate = date.toLocaleDateString('en-GB', {
        year: 'numeric'
    });
    const finalFormattedString = `${formattedDate}`;
    return finalFormattedString;
};

export const timeAgo = (isoStr) => {
    // const date = parseISO(isoStr);
    // return formatDistanceToNow(date, { addSuffix: true }); // e.g., "6 days ago"

    const date = parseISO(isoStr);
    const now = new Date();

    const years = differenceInYears(now, date);
    if (years >= 1) return `${years} year${years > 1 ? 's' : ''} ago`;

    const months = differenceInMonths(now, date);
    if (months >= 1) return `${months} month${months > 1 ? 's' : ''} ago`;

    const weeks = differenceInWeeks(now, date);
    if (weeks >= 1) return `${weeks} week${weeks > 1 ? 's' : ''} ago`;

    const days = differenceInDays(now, date);
    if (days >= 1) return `${days} day${days > 1 ? 's' : ''} ago`;

    const hours = differenceInHours(now, date);
    if (hours >= 1) return `${hours} hour${hours > 1 ? 's' : ''} ago`;

    const minutes = differenceInMinutes(now, date);
    if (minutes >= 1) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;

    return 'just now';
};