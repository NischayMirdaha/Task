const NEPALI_DIGITS = {
  "०": "0",
  "१": "1",
  "२": "2",
  "३": "3",
  "४": "4",
  "५": "5",
  "६": "6",
  "७": "7",
  "८": "8",
  "९": "9",
};

export const convertNepaliDigitsToEnglish = (value = "") =>
  value.replace(/[०-९]/g, (digit) => NEPALI_DIGITS[digit] || digit);

const cleanValue = (value = "") =>
  convertNepaliDigitsToEnglish(value)
    .replace(/\s+/g, " ")
    .replace(/[|]/g, "1")
    .trim();

export const detectLanguage = (text = "") => {
  const hasNepali = /[\u0900-\u097F]/.test(text);
  const hasEnglish = /[A-Za-z]/.test(text);

  if (hasNepali && hasEnglish) {
    return "mixed";
  }

  if (hasNepali) {
    return "nepali";
  }

  if (hasEnglish) {
    return "english";
  }

  return "unknown";
};

const extractLabeledValue = (text, patterns) => {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) {
      return cleanValue(match[1]);
    }
  }

  return "";
};

export const parseMalpotData = (rawText = "") => {
  const text = cleanValue(rawText);

  const ownerName = extractLabeledValue(text, [
    /(?:Owner\s*Name|Name|नाम)\s*[:\-]?\s*([^\n]+)/i,
    /(?:जग्गाधनीको\s*नाम)\s*[:\-]?\s*([^\n]+)/i,
  ]);

  const citizenshipNumber = extractLabeledValue(text, [
    /(?:Citizenship\s*(?:No|Number)?|नागरिकता\s*नं?)\s*[:\-]?\s*([A-Za-z0-9\-\/]+)/i,
  ]);

  const kittaNumber = extractLabeledValue(text, [
    /(?:Kitta\s*(?:No|Number)?|कित्ता\s*नं?)\s*[:\-]?\s*([A-Za-z0-9\-\/]+)/i,
  ]);

  const location = extractLabeledValue(text, [
    /(?:Address|Location|ठेगाना)\s*[:\-]?\s*([^\n]+)/i,
  ]);

  const area = extractLabeledValue(text, [
    /(?:Area|क्षेत्रफल)\s*[:\-]?\s*([A-Za-z0-9.\-\/\s]+)/i,
  ]);

  return {
    ownerName,
    citizenshipNumber,
    kittaNumber,
    location,
    area,
    languageDetected: detectLanguage(text),
  };
};

export const validateMalpotData = (parsedData = {}) => {
  const errors = [];
  
  if (!parsedData.kittaNumber) {
    errors.push("Missing Kitta Number");
  }
  if (!parsedData.ownerName) {
    errors.push("Missing Owner Name");
  }
  
  const isValid = errors.length === 0;
  return { isValid, errors };
};
