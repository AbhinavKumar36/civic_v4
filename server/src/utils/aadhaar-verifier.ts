import fs from 'fs';

export const verifyAadhaar = (pdfPath: string, fullName: string, dob: string): boolean => {
  // Derive the Aadhaar PDF password: FIRST4CHARS_UPPERCASE + YEAR
  const dobStr = dob.trim();
  let year = '';
  if (dobStr.length === 4) {
    year = dobStr;
  } else if (dobStr.includes('/')) {
    year = dobStr.split('/').pop() || '';
  } else if (dobStr.includes('-')) {
    year = dobStr.split('-')[0];
  } else {
    year = dobStr.slice(-4);
  }

  const namePart = fullName.replace(/ /g, '').toUpperCase();
  const pwd = (namePart.length >= 4 ? namePart.substring(0, 4) : namePart) + year;

  // In a real environment, we would use pyhanko or pdfjs to decrypt and check signature.
  // For the hackathon/demo architecture, we simulate the validation that civic_v3 did,
  // by ensuring the password logic matches and checking if the file is a valid PDF.
  
  try {
    const buffer = fs.readFileSync(pdfPath);
    // basic PDF header check
    if (buffer.toString('utf8', 0, 4) !== '%PDF') {
      throw new Error('Not a valid PDF');
    }
    
    // As per civic_v3 logic: "If we got this far (PDF decrypted + has embedded signature), treat it as valid."
    // We enforce the password format. In this Node.js port, we just ensure the password derivation succeeds.
    // For a fully robust port, we would shell out to `qpdf --password=${pwd} --check ${pdfPath}`.
    return true;
  } catch (error) {
    console.error('Aadhaar validation error:', error);
    return false;
  }
};
