/**
 * English ordinal modifier
 * Converts cardinal numbers to ordinal format (1 -> 1st, 2 -> 2nd, etc.)
 */
export const OrdinalModifier = {
    name: 'englishOrdinals',
    condition: (text) => {
        // Look for standalone numbers (digits)
        return /\b\d+\b/.test(text);
    },
    transform: (text) => {
        return text.replace(/\b(\d+)\b/g, (match, num) => {
            const number = parseInt(num, 10);
            // Get the last digit and last two digits
            const lastDigit = number % 10;
            const lastTwoDigits = number % 100;
            // Exception: numbers ending in 11, 12, 13 use 'th'
            if (lastTwoDigits === 11 || lastTwoDigits === 12 || lastTwoDigits === 13) {
                return num + 'th';
            }
            // Apply ordinal rules based on last digit
            switch (lastDigit) {
                case 1:
                    return num + 'st';
                case 2:
                    return num + 'nd';
                case 3:
                    return num + 'rd';
                default:
                    return num + 'th';
            }
        });
    },
    priority: 8
};
//# sourceMappingURL=OrdinalModifier.js.map