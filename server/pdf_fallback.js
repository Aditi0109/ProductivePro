const fs = require('fs');

// Simple PDF text extraction fallback for when Python is not available
function extractTextFromPDF(pdfPath) {
  try {
    const buffer = fs.readFileSync(pdfPath);
    const pdfText = buffer.toString('binary');
    
    // Extract text between stream and endstream markers
    const textMatches = pdfText.match(/stream\s*\n?(.*?)\s*\nendstream/gs);
    let extractedText = '';
    
    if (textMatches) {
      textMatches.forEach(match => {
        // Remove stream markers and clean up
        let text = match.replace(/^stream\s*\n?/, '').replace(/\s*\nendstream$/, '');
        
        // Simple text extraction patterns for common PDF encodings
        text = text.replace(/BT\s*\/F\d+\s+\d+\s+Tf\s+[\d\s\.]+Td\s*\((.*?)\)\s*Tj\s*ET/g, '$1 ');
        text = text.replace(/\((.*?)\)\s*Tj/g, '$1 ');
        text = text.replace(/\[(.*?)\]\s*TJ/g, '$1 ');
        
        extractedText += text + ' ';
      });
    }
    
    // If no text found with stream method, try simple text extraction
    if (!extractedText.trim()) {
      // Look for text in parentheses (common PDF text encoding)
      const simpleTextMatches = pdfText.match(/\(([^)]+)\)/g);
      if (simpleTextMatches) {
        extractedText = simpleTextMatches.map(match => match.slice(1, -1)).join(' ');
      }
    }
    
    // Clean up extracted text
    extractedText = extractedText
      .replace(/\s+/g, ' ')
      .replace(/[^\x20-\x7E]/g, ' ')
      .trim();
    
    return {
      success: true,
      text_content: extractedText || 'No readable text found in PDF'
    };
    
  } catch (error) {
    return {
      success: false,
      error: `Failed to extract text from PDF: ${error.message}`
    };
  }
}

module.exports = { extractTextFromPDF };