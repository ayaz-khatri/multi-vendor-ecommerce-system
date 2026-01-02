export const timeAgo = (value) => {
    if (!value) return "";
    const date = new Date(value);
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

    const intervals = [
        { label: "year", seconds: 31536000 },
        { label: "month", seconds: 2592000 },
        { label: "day", seconds: 86400 },
        { label: "hour", seconds: 3600 },
        { label: "minute", seconds: 60 },
        { label: "second", seconds: 1 },
    ];

    const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

    for (const interval of intervals) {
        const count = Math.floor(seconds / interval.seconds);
        if (count >= 1) return rtf.format(-count, interval.label);
    }

    return "just now";
}

export const generateOrderNumber = () => {
    const random = Math.floor(1000 + Math.random() * 9000); // 4 digit random number
    const timestamp = Date.now().toString().slice(-6); // last 6 digits of timestamp
    return `ORD-${timestamp}${random}`;
};