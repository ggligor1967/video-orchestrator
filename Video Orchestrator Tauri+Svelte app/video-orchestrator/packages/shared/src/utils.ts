// Utility functions that can be shared across different applications

export function formatDate(date: Date, format: string): string {
    const options: Intl.DateTimeFormatOptions = {};
    if (format.includes('year')) options.year = 'numeric';
    if (format.includes('month')) options.month = 'long';
    if (format.includes('day')) options.day = 'numeric';
    return new Intl.DateTimeFormat('en-US', options).format(date);
}

export function generateUniqueId(prefix: string = ''): string {
    return `${prefix}${Math.random().toString(36).substr(2, 9)}`;
}

export function deepClone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
}