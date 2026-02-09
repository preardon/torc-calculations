import formulaService from './formulaService';

describe('FormulaService', () => {
    const mockItem = {
        id: "123",
        name: "Test Item",
        column_values: [
            { id: "numbers", text: "10", value: "10", type: "numeric" },
            { id: "numbers_1", text: "5", value: "5", type: "numeric" },
            { id: "text", text: "Hello", value: "\"Hello\"", type: "text" },
            { id: "empty_col", text: "", value: null, type: "text" }
        ]
    };

    test('evaluates simple math', () => {
        const result = formulaService.evaluate("1 + 2", mockItem);
        expect(result).toBe(3);
    });

    test('substitutes column values by ID', () => {
        // {numbers} is 10, {numbers_1} is 5
        const result = formulaService.evaluate("{numbers} + {numbers_1}", mockItem);
        expect(result).toBe(15);
    });

    test('handles complex math expressions', () => {
        const result = formulaService.evaluate("({numbers} * 2) + {numbers_1}", mockItem);
        expect(result).toBe(25); // (10 * 2) + 5 = 25
    });

    test('substitutes empty columns as 0 for math', () => {
        const result = formulaService.evaluate("{numbers} + {empty_col}", mockItem);
        expect(result).toBe(10); // 10 + 0
    });

    test('handles division', () => {
        const result = formulaService.evaluate("{numbers} / {numbers_1}", mockItem);
        expect(result).toBe(2);
    });

    test('throws error for invalid formula', () => {
        expect(() => {
            formulaService.evaluate("1 +", mockItem);
        }).toThrow();
    });

    test('returns null for empty formula', () => {
        expect(formulaService.evaluate("", mockItem)).toBeNull();
    });
});
