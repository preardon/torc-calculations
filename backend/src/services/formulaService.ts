import { evaluate } from 'mathjs';

interface MondayItem {
    column_values: {
        id: string;
        text: string | null;
        value: string | null;
    }[];
}

class FormulaService {
    /**
     * Parses the formula, replaces column placeholders with values, and evaluates properties.
     * @param {string} formula - The formula string e.g. "{Column A} + {Column B}"
     * @param {MondayItem} item - The Monday item object with column_values
     */
    evaluate(formula: string, item: MondayItem): any {
        if (!formula) return null;

        let parsedFormula = formula;
        const columns = item.column_values;

        const columnMap: { [key: string]: number | string } = {};

        columns.forEach(col => {
            let val: string | number = col.text || '';

            // Basic number check
            const isNumber = !isNaN(parseFloat(val)) && isFinite(Number(val));

            if (isNumber) {
                val = parseFloat(val);
            } else if (val === '') {
                val = 0;
            } else {
                val = `"${val}"`;
            }

            columnMap[col.id] = val;
        });

        // Replace {Column ID} with value
        parsedFormula = parsedFormula.replace(/\{([^}]+)\}/g, (match, colId) => {
            const id = colId.trim();
            if (Object.prototype.hasOwnProperty.call(columnMap, id)) {
                return String(columnMap[id]);
            }
            return '0';
        });

        try {
            const result = evaluate(parsedFormula);
            return result;
        } catch (error: any) {
            console.error(`Error evaluating formula "${parsedFormula}":`, error);
            throw new Error('Formula evaluation failed: ' + error.message);
        }
    }
}

export default new FormulaService();
