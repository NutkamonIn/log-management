import Papa from 'papaparse';
// Re-export the existing json download logic
export const downloadAsJson = (data: any, filename: string) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

export const exportToCsv = (data: any[], filename: string) => {
    if (!data || data.length === 0) return;
    
    // Extract all unique headers across all rows to prevent missing columns
    let columns: string[] | undefined = undefined;
    if (data.length > 0 && typeof data[0] === 'object' && !Array.isArray(data[0])) {
        const keySet = new Set<string>();
        data.forEach(item => {
            if (item) {
                Object.keys(item).forEach(key => keySet.add(key));
            }
        });
        columns = Array.from(keySet);
    }
    
    const csv = Papa.unparse(data, { columns });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};
