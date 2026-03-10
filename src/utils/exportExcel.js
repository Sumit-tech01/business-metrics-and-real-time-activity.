const EXCEL_MIME_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';

const withExcelExtension = (fileName) => {
  const baseName = String(fileName || 'export').trim() || 'export';
  return baseName.toLowerCase().endsWith('.xlsx') ? baseName : `${baseName}.xlsx`;
};

export const exportToExcel = async (data, fileName = 'export') => {
  try {
    const [XLSX, { saveAs }] = await Promise.all([import('xlsx'), import('file-saver')]);
    const safeData = Array.isArray(data) ? data : [];
    const worksheet = XLSX.utils.json_to_sheet(safeData);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');

    const workbookBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });

    const blob = new Blob([workbookBuffer], { type: EXCEL_MIME_TYPE });
    saveAs(blob, withExcelExtension(fileName));
  } catch {
    throw new Error('Unable to export Excel file.');
  }
};
