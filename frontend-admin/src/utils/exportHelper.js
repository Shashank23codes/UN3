/* Standard CSV Export Helper */
export const exportToCSV = (data, headers, filename) => {
    // BOM for Excel UTF-8 compatibility
    const BOM = '\uFEFF';
    const csvContent = [
        headers.join(','),
        ...data.map(row => row.map(cell => {
            if (cell === null || cell === undefined) return '""';
            const stringCell = String(cell);
            return `"${stringCell.replace(/"/g, '""')}"`;
        }).join(','))
    ].join('\n');

    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    // Append to body to make it work in Firefox
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
};
