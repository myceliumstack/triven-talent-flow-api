/**
 * Generate a unique job code starting with 'J' and including datetime with milliseconds
 * Format: J + YYMMDDHHMMSSS (15 characters total)
 * Example: J2412011430523 (J + 2024-12-01 14:30:52.300)
 */
function generateJobCode() {
  const now = new Date();
  
  // Get year (last 2 digits), month, day, hour, minute, second, milliseconds
  const year = now.getFullYear().toString().slice(-2);
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  const hour = now.getHours().toString().padStart(2, '0');
  const minute = now.getMinutes().toString().padStart(2, '0');
  const second = now.getSeconds().toString().padStart(2, '0');
  const milliseconds = now.getMilliseconds().toString().padStart(3, '0');
  
  // Combine: J + YYMMDDHHMMSSS
  const jobCode = `J${year}${month}${day}${hour}${minute}${second}${milliseconds}`;
  
  return jobCode;
}

module.exports = {
  generateJobCode
};
