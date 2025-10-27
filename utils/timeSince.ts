// Created by Bishesh

/** 
 * Returns a human-readable string like "3 days ago" or "Just now"
 */
export const timeSince = (dateString: string): string => {
    const date = new Date(dateString);
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

    if (isNaN(seconds)) return "Invalid date";

    if (seconds < 5) return "Just now";

    const intervals: [number, string][] = [
        [31536000, "year"],
        [2592000, "month"],
        [86400, "day"],
        [3600, "hour"],
        [60, "minute"]
    ];

    for (const [interval, label] of intervals) {
        const count = Math.floor(seconds / interval);
        if (count >= 1) {
            return `${count} ${label}${count > 1 ? "s" : ""} ago`;
        }
    }

    return `${Math.floor(seconds)} seconds ago`;
};

/**
 * Returns a formatted string like "Joined April 2024"
 */
export const formatJoinDate = (dateString?: string): string => {
    if (!dateString) return "Joined recently";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Joined recently";
    return `Joined ${date.toLocaleString("default", { month: "long", year: "numeric" })}`;
};
