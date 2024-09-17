/**
 * Converts a string from camelCase, kebab-case, snake_case, PascalCase, or URL to capitalized words.
 * @param {String} inputString - The string to convert.
 * @returns {String} - A string of capitalized words separated by spaces.
 * @example
 * capitalizeWords('camelCase'); // Output: Camel Case
 * capitalizeWords('PascalCase'); // Output: Pascal Case
 * capitalizeWords('snake_case'); // Output: Snake Case
 * capitalizeWords('kebab-case'); // Output: Kebab Case
 * capitalizeWords('https://example.com/api/users'); // Output: Https Example Com Api Users
 * //
 */

function capitalizeWords(inputString: string): string {
  // Convert to words
  const words = inputString
    .replace(/([a-z])([A-Z])/g, "$1 $2") // Convert camelCase to camel Case
    .replace(/_/g, " ") // Replace underscores in snake_case with spaces
    .replace(/-/g, " ") // Replace hyphens in kebab-case with spaces
    .replace(/\//g, " ") // Replace forward slashes in URLs with spaces
    .split(" ");
  // Capitalize each word
  const capitalized = words.map((word) => {
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  });
  // Join the words with spaces
  const result = capitalized.join(" ");

  return result;
}

export default capitalizeWords;
