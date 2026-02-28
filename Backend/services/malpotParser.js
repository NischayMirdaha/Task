export const parseMalpotData = (text) => {
  const kittaMatch = text.match(/Kitta\s*No\.?\s*:\s*(\d+)/i);
  const districtMatch = text.match(/District\s*:\s*(.*)/i);
  const areaMatch = text.match(/Area\s*:\s*([\d.]+)/i);
  const ownerMatch = text.match(/Owner\s*Name\s*:\s*(.*)/i);

  return {
    kittaNumber: kittaMatch ? kittaMatch[1] : null,
    district: districtMatch ? districtMatch[1].trim() : null,
    area: areaMatch ? areaMatch[1] : null,
    ownerName: ownerMatch ? ownerMatch[1].trim() : null
  };
};