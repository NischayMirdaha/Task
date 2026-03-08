/**
 * malpotParser.js
 * Parses OCR text from Nepalese Malpot (Land Revenue / Lalpurja) documents.
 *
 * Handles:
 *  - Mixed Nepali (Devanagari) + English text
 *  - Common OCR errors in Nepali script
 *  - Both hill (Ropani system) and terai (Bigha system) area units
 *  - Low-quality fax/scanner output with broken spacing
 */

// ─────────────────────────────────────────────────────────────────────────────
// NEPALI ↔ ENGLISH DIGIT MAPPING
// ─────────────────────────────────────────────────────────────────────────────

const NEPALI_DIGITS = { "०": "0", "१": "1", "२": "2", "३": "3", "४": "4", "५": "5", "६": "6", "७": "7", "८": "8", "९": "9" };

const toEnglishDigits = (str) =>
  str ? str.replace(/[०-९]/g, (d) => NEPALI_DIGITS[d] || d) : str;

// ─────────────────────────────────────────────────────────────────────────────
// NEPALI FIELD LABELS (Devanagari versions of field names on Malpot docs)
// ─────────────────────────────────────────────────────────────────────────────

const NEPALI_LABELS = {
  kitta:        /(?:कित्ता\s*(?:नं|नम्बर|नo)?|Kitta\s*No\.?)\s*[:\-]?\s*([\d०-९]+)/i,
  district:     /(?:जिल्ला|District)\s*[:\-]?\s*([^\n:]+)/i,
  vdc:          /(?:गा\.वि\.स\.|नगरपालिका|VDC|Municipality|Nagarpalika)\s*[:\-]?\s*([^\n:]+)/i,
  ward:         /(?:वडा\s*(?:नं)?|Ward\s*(?:No\.?)?)\s*[:\-]?\s*([\d०-९]+)/i,
  province:     /(?:प्रदेश|Province)\s*(?:नं|No\.?)?\s*[:\-]?\s*([\d०-९]+|[A-Za-z\s]+)/i,
  sheet:        /(?:शिट|Sheet|Seet)\s*(?:नं|No\.?)?\s*[:\-]?\s*([\w\d]+)/i,
  ownerName:    /(?:जग्गाधनी\s*(?:को\s*)?नाम|Owner\s*(?:Name)?)\s*[:\-]?\s*([^\n:]+)/i,
  fatherName:   /(?:बाबुको\s*नाम|Father(?:'s)?\s*Name)\s*[:\-]?\s*([^\n:]+)/i,
  grandFather:  /(?:बाजेको\s*नाम|Grand\s*Father(?:'s)?\s*Name)\s*[:\-]?\s*([^\n:]+)/i,
  citizenship:  /(?:नागरिकता\s*(?:नं)?|Citizenship\s*(?:No\.?)?)\s*[:\-]?\s*([\d०-९\-\/]+)/i,
  address:      /(?:ठेगाना|Address)\s*[:\-]?\s*([^\n:]+)/i,
  landType:     /(?:जग्गाको\s*किसिम|Land\s*(?:Type|Class|Use))\s*[:\-]?\s*([^\n:]+)/i,
  regDate:      /(?:दर्ता\s*मिति|Registration\s*Date)\s*[:\-]?\s*([\d०-९\/\-\.]+)/i,
  docNumber:    /(?:लालपुर्जा|Lalpurja|Document|Deed)\s*(?:नं|No\.?)?\s*[:\-]?\s*([\w\d\/\-]+)/i,
  taxAmount:    /(?:मालपोत|Malpot|Tax|Revenue)\s*(?:रकम|Amount)?\s*[:\-]?\s*([\d०-९,\.]+)/i,

  // Area — hill units (Ropani system)
  ropani:  /(?:रोपनी|Ropani)\s*[:\-]?\s*([\d०-९]+)/i,
  aana:    /(?:आना|Aana)\s*[:\-]?\s*([\d०-९]+)/i,
  paisa:   /(?:पैसा|Paisa)\s*[:\-]?\s*([\d०-९]+)/i,
  dam:     /(?:दाम|Dam)\s*[:\-]?\s*([\d०-९]+)/i,

  // Area — terai units (Bigha system)
  bigha:   /(?:बिघा|Bigha)\s*[:\-]?\s*([\d०-९]+)/i,
  kattha:  /(?:कठ्ठा|Kattha)\s*[:\-]?\s*([\d०-९]+)/i,
  dhur:    /(?:धुर|Dhur)\s*[:\-]?\s*([\d०-९]+)/i,

  // Sq meters (sometimes listed)
  sqm:     /Area\s*[:\-]?\s*([\d.]+)\s*(?:sq\.?\s*m|sqm|वर्ग\s*मिटर)/i,
};

// ─────────────────────────────────────────────────────────────────────────────
// TEXT NORMALIZATION
// ─────────────────────────────────────────────────────────────────────────────

const normalizeText = (text) =>
  text
    .replace(/\r\n/g, "\n")
    .replace(/[|l](?=[\d०-९])/g, "1")    // OCR: '|' or 'l' before digits
    .replace(/O(?=[\d०-९])/g, "0")        // OCR: 'O' before digits
    .replace(/\u200B|\u00A0/g, " ")       // zero-width + non-breaking spaces
    .replace(/\s{2,}/g, " ")
    .trim();

const extract = (text, pattern) => {
  const m = text.match(pattern);
  if (!m) return null;
  return toEnglishDigits(m[1].trim());
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PARSER
// ─────────────────────────────────────────────────────────────────────────────

export const parseMalpotData = (rawText) => {
  const text = normalizeText(rawText);

  const kittaNumber     = extract(text, NEPALI_LABELS.kitta);
  const district        = extract(text, NEPALI_LABELS.district);
  const vdc             = extract(text, NEPALI_LABELS.vdc);
  const wardNumber      = extract(text, NEPALI_LABELS.ward);
  const province        = extract(text, NEPALI_LABELS.province);
  const sheet           = extract(text, NEPALI_LABELS.sheet);
  const documentNumber  = extract(text, NEPALI_LABELS.docNumber);
  const landType        = extract(text, NEPALI_LABELS.landType);
  const registrationDate= extract(text, NEPALI_LABELS.regDate);
  const taxAmount       = extract(text, NEPALI_LABELS.taxAmount);

  const ownerName       = extract(text, NEPALI_LABELS.ownerName);
  const fatherName      = extract(text, NEPALI_LABELS.fatherName);
  const grandFatherName = extract(text, NEPALI_LABELS.grandFather);
  const citizenshipNo   = extract(text, NEPALI_LABELS.citizenship);
  const address         = extract(text, NEPALI_LABELS.address);

  const area = {
    sqm:    extract(text, NEPALI_LABELS.sqm),
    ropani: extract(text, NEPALI_LABELS.ropani),
    aana:   extract(text, NEPALI_LABELS.aana),
    paisa:  extract(text, NEPALI_LABELS.paisa),
    dam:    extract(text, NEPALI_LABELS.dam),
    bigha:  extract(text, NEPALI_LABELS.bigha),
    kattha: extract(text, NEPALI_LABELS.kattha),
    dhur:   extract(text, NEPALI_LABELS.dhur),
  };

  // Determine land area system used
  const areaSystem = area.ropani ? "ropani" : area.bigha ? "bigha" : null;

  // Confidence: count how many core fields were found
  const coreFields = [kittaNumber, district, ownerName, wardNumber];
  const parseConfidence = Math.round((coreFields.filter(Boolean).length / coreFields.length) * 100);

  return {
    kittaNumber,
    district,
    vdc,
    wardNumber,
    province,
    sheet,
    documentNumber,
    landType,
    registrationDate,
    taxAmount,
    areaSystem,
    area,
    owner: { name: ownerName, fatherName, grandFatherName, citizenshipNo, address },
    _meta: {
      parseConfidence,
      rawTextLength: text.length,
      parsedAt: new Date().toISOString(),
    },
  };
};

export const validateMalpotData = (parsed) => {
  const errors = [];
  if (!parsed.kittaNumber)   errors.push("Missing: Kitta Number (कित्ता नं)");
  if (!parsed.district)      errors.push("Missing: District (जिल्ला)");
  if (!parsed.owner?.name)   errors.push("Missing: Owner Name (जग्गाधनीको नाम)");
  return { isValid: errors.length === 0, errors };
};