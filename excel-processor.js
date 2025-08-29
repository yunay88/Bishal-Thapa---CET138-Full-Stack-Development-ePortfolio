// Ensure SheetJS library is included
// <script src="https://cdn.sheetjs.com/xlsx-latest/package/dist/xlsx.full.min.js"></script>

let gk_isXlsx = false; // Flag for XLSX file handling
let gk_xlsxFileLookup = {}; // Lookup table for XLSX files
let gk_fileData = {}; // Storage for file data

// Utility function to check if a cell is filled
function isFilledCell(cell) {
  return cell !== '' && cell !== null && cell !== undefined;
}

// Function to load and process file data
function loadFileData(filename) {
  // Input validation
  if (!filename || typeof filename !== 'string') {
    console.error('Invalid filename provided:', filename);
    return '';
  }

  // Check if the file is an XLSX and exists in lookup
  if (gk_isXlsx && gk_xlsxFileLookup[filename]) {
    const fileData = gk_fileData[filename];
    if (!fileData) {
      console.error(`No data found for filename: ${filename}`);
      return '';
    }

    try {
      // Read the workbook from base64 data
      const workbook = XLSX.read(fileData, { type: 'base64' });
      if (!workbook || !workbook.SheetNames || workbook.SheetNames.length === 0) {
        throw new Error('Invalid workbook structure');
      }

      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];

      if (!worksheet) {
        throw new Error('No valid worksheet found');
      }

      // Convert sheet to JSON array of arrays, excluding blank rows
      let jsonData = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        blankrows: false,
        defval: ''
      });

      // Filter out rows where all cells are empty
      const filteredData = jsonData.filter(row => row.some(isFilledCell));

      if (filteredData.length === 0) {
        console.warn('No data rows found after filtering');
        return '';
      }

      // Improved header detection: Look for the first row with maximum filled cells
      let headerRowIndex = 0;
      let maxFilledCells = filteredData[0].filter(isFilledCell).length;
      for (let i = 1; i < Math.min(filteredData.length, 25) && i < filteredData.length - 1; i++) {
        const filledCount = filteredData[i].filter(isFilledCell).length;
        if (filledCount > maxFilledCells) {
          maxFilledCells = filledCount;
          headerRowIndex = i;
        }
      }

      // Ensure header row is within reasonable bounds
      if (headerRowIndex > 25) {
        console.warn('Header row index exceeds limit, reverting to first row');
        headerRowIndex = 0;
      }

      // Convert filtered data (starting after header) to CSV
      const dataForCsv = filteredData.slice(headerRowIndex + 1); // Exclude header row from data
      const csvSheet = XLSX.utils.aoa_to_sheet([filteredData[headerRowIndex], ...dataForCsv]);
      const csvContent = XLSX.utils.sheet_to_csv(csvSheet, { header: 1 });

      return csvContent;
    } catch (error) {
      console.error(`Error processing XLSX file ${filename}:`, error.message);
      return '';
    }
  }

  // Return raw data for non-XLSX files
  return gk_fileData[filename] || '';
}

// Optional: Example function to load file data
function loadSampleFile(base64Data, isXlsx, filename) {
  gk_isXlsx = isXlsx;
  gk_fileData[filename] = base64Data;
  if (isXlsx) gk_xlsxFileLookup[filename] = true;
  console.log(`Loaded file: ${filename}, CSV:`, loadFileData(filename));
}