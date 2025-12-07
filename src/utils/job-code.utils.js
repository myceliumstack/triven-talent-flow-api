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

/**
 * Generate a human-readable posting ID
 * Format: 7-digit sequential number starting with 1 (e.g., 1000001, 1000002, 1000003)
 * @param {Object} prisma - Prisma client instance
 * @returns {Promise<string>} Unique posting ID
 */
async function generatePostingId(prisma) {
  // Find the highest existing posting ID (numeric only)
  const existingPostings = await prisma.jobPosting.findMany({
    where: {
      postingId: {
        not: null
      }
    },
    select: {
      postingId: true
    },
    orderBy: {
      postingId: 'desc'
    },
    take: 1
  });
  
  // Start from 1000001 (7 digits starting with 1)
  let sequenceNumber = 1000001;
  
  if (existingPostings.length > 0 && existingPostings[0].postingId) {
    // Extract numeric value from the last posting ID
    const lastPostingId = existingPostings[0].postingId;
    // Remove any non-numeric characters and parse
    const numericValue = parseInt(lastPostingId.replace(/\D/g, ''));
    
    if (!isNaN(numericValue) && numericValue >= 1000001) {
      sequenceNumber = numericValue + 1;
    }
  }
  
  // Check if we exceed 7 digits starting with 1 (1999999)
  if (sequenceNumber > 1999999) {
    throw new Error('Maximum posting ID limit reached (1999999)');
  }
  
  // Return as string (7 digits starting with 1)
  const postingId = sequenceNumber.toString();
  
  return postingId;
}

module.exports = {
  generateJobCode,
  generatePostingId
};
