/**
 * budget.js - Budget calculations
 */

const Budget = {
    calculateVariance(budget, actual) {
        const variance = actual - budget;
        const percent = budget !== 0 ? (variance / budget) * 100 : 0;
        
        return { variance, percent };
    }
};
