export const deSlugify = (str) => {
  return str
    .split('-') // Split into words by hyphen
    .map(word =>
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ) // Capitalize first letter of each word
    .join(' '); // Join with spaces
}

export const slugify = (str) => {
  // Convert the entire string to lowercase first
  let cleanedString = str?.toLowerCase();

  // Replace all non-alphanumeric characters (except spaces) with a hyphen
  cleanedString = cleanedString?.replace(/[^\w\s]/g, '-');

  // Replace any remaining spaces with hyphens
  cleanedString = cleanedString?.replace(/\s+/g, '-');

  // Remove consecutive hyphens and trim leading/trailing hyphens
  cleanedString = cleanedString?.replace(/-+/g, '-').replace(/^-|-$/g, '');

  return cleanedString;
}

export const humanizeString = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

