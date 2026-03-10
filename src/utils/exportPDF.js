const withPdfExtension = (fileName) => {
  const baseName = String(fileName || 'export').trim() || 'export';
  return baseName.toLowerCase().endsWith('.pdf') ? baseName : `${baseName}.pdf`;
};

const normalizeColumns = (columns) => {
  if (!Array.isArray(columns)) {
    return [];
  }

  return columns
    .map((column) => {
      if (typeof column === 'string') {
        return { header: column, key: column };
      }

      return {
        header: column?.header || column?.label || column?.key,
        key: column?.key || column?.accessor || column?.header,
      };
    })
    .filter((column) => column.header && column.key);
};

const toCellValue = (value) => {
  if (value === null || value === undefined) {
    return '';
  }

  if (typeof value === 'number') {
    return value;
  }

  return String(value);
};

export const exportToPDF = async (columns, data, fileName = 'export') => {
  try {
    const [{ jsPDF }, autoTableModule] = await Promise.all([import('jspdf'), import('jspdf-autotable')]);
    const autoTable = autoTableModule.default;
    const normalizedColumns = normalizeColumns(columns);

    if (!normalizedColumns.length) {
      throw new Error('No columns available for PDF export.');
    }

    const safeRows = Array.isArray(data) ? data : [];
    const tableHeaders = normalizedColumns.map((column) => column.header);
    const tableBody = safeRows.map((row) =>
      normalizedColumns.map((column) => toCellValue(row?.[column.key])),
    );

    const doc = new jsPDF({
      orientation: tableHeaders.length > 6 ? 'landscape' : 'portrait',
      unit: 'pt',
      format: 'a4',
    });

    autoTable(doc, {
      head: [tableHeaders],
      body: tableBody,
      margin: { top: 32, right: 24, bottom: 24, left: 24 },
      styles: {
        fontSize: 9,
        cellPadding: 6,
      },
      headStyles: {
        fillColor: [15, 118, 110],
      },
    });

    doc.save(withPdfExtension(fileName));
  } catch {
    throw new Error('Unable to export PDF file.');
  }
};
