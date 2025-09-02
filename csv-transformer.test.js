class CSVTransformer {
    transformCSVToJSON(csvContent) {
        const lines = csvContent.trim().split('\n');
        
        if (lines.length < 2) {
            throw new Error('CSV must have at least a header row and one data row');
        }

        // Parse header
        const headers = this.parseCSVLine(lines[0]);
        
        // Validate headers
        const requiredHeaders = ['sku', 'skuToReplace', 'retainSku'];
        const missingHeaders = requiredHeaders.filter(header => !headers.includes(header));
        
        if (missingHeaders.length > 0) {
            throw new Error(`Missing required headers: ${missingHeaders.join(', ')}`);
        }

        // Get column indices
        const skuIndex = headers.indexOf('sku');
        const skuToReplaceIndex = headers.indexOf('skuToReplace');
        const retainSkuIndex = headers.indexOf('retainSku');

        // Parse data rows
        const moves = [];
        for (let i = 1; i < lines.length; i++) {
            const values = this.parseCSVLine(lines[i]);
            
            if (values.length !== headers.length) {
                throw new Error(`Row ${i + 1} has ${values.length} columns but expected ${headers.length}`);
            }

            const sku = values[skuIndex]?.trim();
            const skuToReplace = values[skuToReplaceIndex]?.trim();
            const retainSku = values[retainSkuIndex]?.trim();

            if (!sku || !skuToReplace || !retainSku) {
                throw new Error(`Row ${i + 1} has empty values in required columns`);
            }

            const retainSkuValue = (retainSku === sku) ? "sku" : retainSku;

            moves.push({
                sku: sku,
                skuToReplace: skuToReplace,
                retainSku: retainSkuValue
            });
        }

        return {
            force: false,
            moves: moves
        };
    }

    parseCSVLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        
        result.push(current.trim());
        return result;
    }
}

describe('CSV Transformer', () => {
    let transformer;

    beforeEach(() => {
        transformer = new CSVTransformer();
    });

    describe('transformCSVToJSON', () => {
        test('should transform CSV with retainSku matching sku to "sku"', () => {
            const csvContent = `sku,skuToReplace,retainSku
197801171173,197801171173-DUPLICATE-1,197801171173
197801171180,197801171180-DUPLICATE-1,197801171180`;

            const result = transformer.transformCSVToJSON(csvContent);

            expect(result).toEqual({
                force: false,
                moves: [
                    {
                        sku: "197801171173",
                        skuToReplace: "197801171173-DUPLICATE-1",
                        retainSku: "sku"
                    },
                    {
                        sku: "197801171180",
                        skuToReplace: "197801171180-DUPLICATE-1",
                        retainSku: "sku"
                    }
                ]
            });
        });

        test('should transform CSV with retainSku different from sku', () => {
            const csvContent = `sku,skuToReplace,retainSku
FL-PE-BASE-105,FL-PE-BASE-105-DUPLICATE-1,FL-PE-BASE-75
FL-PE-COLM-105,FL-PE-COLM-105-DUPLICATE-1,FL-PE-COLM-75`;

            const result = transformer.transformCSVToJSON(csvContent);

            expect(result).toEqual({
                force: false,
                moves: [
                    {
                        sku: "FL-PE-BASE-105",
                        skuToReplace: "FL-PE-BASE-105-DUPLICATE-1",
                        retainSku: "FL-PE-BASE-75"
                    },
                    {
                        sku: "FL-PE-COLM-105",
                        skuToReplace: "FL-PE-COLM-105-DUPLICATE-1",
                        retainSku: "FL-PE-COLM-75"
                    }
                ]
            });
        });

        test('should handle mixed retainSku values', () => {
            const csvContent = `sku,skuToReplace,retainSku
197801171173,197801171173-DUPLICATE-1,197801171173
FL-PE-BASE-105,FL-PE-BASE-105-DUPLICATE-1,FL-PE-BASE-75`;

            const result = transformer.transformCSVToJSON(csvContent);

            expect(result).toEqual({
                force: false,
                moves: [
                    {
                        sku: "197801171173",
                        skuToReplace: "197801171173-DUPLICATE-1",
                        retainSku: "sku"
                    },
                    {
                        sku: "FL-PE-BASE-105",
                        skuToReplace: "FL-PE-BASE-105-DUPLICATE-1",
                        retainSku: "FL-PE-BASE-75"
                    }
                ]
            });
        });

        test('should throw error for missing headers', () => {
            const csvContent = `sku,skuToReplace
197801171173,197801171173-DUPLICATE-1`;

            expect(() => {
                transformer.transformCSVToJSON(csvContent);
            }).toThrow('Missing required headers: retainSku');
        });

        test('should throw error for empty CSV', () => {
            const csvContent = '';

            expect(() => {
                transformer.transformCSVToJSON(csvContent);
            }).toThrow('CSV must have at least a header row and one data row');
        });

        test('should throw error for CSV with only header', () => {
            const csvContent = 'sku,skuToReplace,retainSku';

            expect(() => {
                transformer.transformCSVToJSON(csvContent);
            }).toThrow('CSV must have at least a header row and one data row');
        });

        test('should throw error for empty values in required columns', () => {
            const csvContent = `sku,skuToReplace,retainSku
197801171173,,197801171173`;

            expect(() => {
                transformer.transformCSVToJSON(csvContent);
            }).toThrow('Row 2 has empty values in required columns');
        });

        test('should throw error for mismatched column count', () => {
            const csvContent = `sku,skuToReplace,retainSku
197801171173,197801171173-DUPLICATE-1`;

            expect(() => {
                transformer.transformCSVToJSON(csvContent);
            }).toThrow('Row 2 has 2 columns but expected 3');
        });
    });

    describe('parseCSVLine', () => {
        test('should parse simple CSV line', () => {
            const result = transformer.parseCSVLine('a,b,c');
            expect(result).toEqual(['a', 'b', 'c']);
        });

        test('should handle quoted values', () => {
            const result = transformer.parseCSVLine('"a,b",c,"d,e"');
            expect(result).toEqual(['a,b', 'c', 'd,e']);
        });

        test('should handle empty values', () => {
            const result = transformer.parseCSVLine('a,,c');
            expect(result).toEqual(['a', '', 'c']);
        });

        test('should trim whitespace', () => {
            const result = transformer.parseCSVLine(' a , b , c ');
            expect(result).toEqual(['a', 'b', 'c']);
        });
    });
});
