/**
 * validation.js - Client-side validation
 */

const Validation = {
    validateNumber(value) {
        return !isNaN(parseFloat(value)) && isFinite(value);
    },

    validateRequired(value) {
        return value !== null && value !== undefined && value !== '';
    },

    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
};
