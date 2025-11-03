// src/services/resume.service.js
const prisma = require('../config/database');
const fs = require('fs').promises;
const path = require('path');

// Polyfill browser APIs for Node.js (required by pdfjs-dist) - Must be before any pdfjs imports
if (typeof globalThis.DOMMatrix === 'undefined') {
  // Simple DOMMatrix polyfill
  class DOMMatrixPolyfill {
    constructor(init) {
      if (typeof init === 'string') {
        const values = init.replace(/matrix\(|\)/g, '').split(',').map(parseFloat);
        this.a = values[0] || 1;
        this.b = values[1] || 0;
        this.c = values[2] || 0;
        this.d = values[3] || 1;
        this.e = values[4] || 0;
        this.f = values[5] || 0;
      } else {
        this.a = init?.a ?? 1;
        this.b = init?.b ?? 0;
        this.c = init?.c ?? 0;
        this.d = init?.d ?? 1;
        this.e = init?.e ?? 0;
        this.f = init?.f ?? 0;
      }
    }
    
    multiply(other) {
      return new DOMMatrixPolyfill({
        a: this.a * other.a + this.c * other.b,
        b: this.b * other.a + this.d * other.b,
        c: this.a * other.c + this.c * other.d,
        d: this.b * other.c + this.d * other.d,
        e: this.a * other.e + this.c * other.f + this.e,
        f: this.b * other.e + this.d * other.f + this.f
      });
    }
    
    invertSelf() {
      const det = this.a * this.d - this.b * this.c;
      if (det === 0) return this;
      const a = this.d / det;
      const b = -this.b / det;
      const c = -this.c / det;
      const d = this.a / det;
      const e = (this.c * this.f - this.d * this.e) / det;
      const f = (this.b * this.e - this.a * this.f) / det;
      this.a = a;
      this.b = b;
      this.c = c;
      this.d = d;
      this.e = e;
      this.f = f;
      return this;
    }
    
    getTransform() {
      return {
        a: this.a,
        b: this.b,
        c: this.c,
        d: this.d,
        e: this.e,
        f: this.f
      };
    }
  }
  globalThis.DOMMatrix = DOMMatrixPolyfill;
  globalThis.DOMMatrixReadOnly = DOMMatrixPolyfill;
}

// Polyfill ImageData if needed
if (typeof globalThis.ImageData === 'undefined') {
  globalThis.ImageData = class ImageDataPolyfill {
    constructor(data, width, height) {
      this.data = data;
      this.width = width;
      this.height = height;
    }
  };
}

/**
 * Convert PDF buffer to Markdown
 * @param {Buffer} pdfBuffer - PDF file buffer
 * @returns {Promise<string>} Markdown content
 */
const convertPdfToMarkdown = async (pdfBuffer) => {
  try {
    // Validate buffer
    if (!pdfBuffer || !Buffer.isBuffer(pdfBuffer)) {
      throw new Error('Invalid PDF buffer provided');
    }

    console.log('Converting PDF buffer to markdown, buffer size:', pdfBuffer.length);
    
    // Convert Buffer to Uint8Array (required by pdfjs-dist)
    const uint8Array = new Uint8Array(pdfBuffer);
    
    // Import pdfjs-dist dynamically (it's an ES module)
    const pdfjsModule = await import('pdfjs-dist/legacy/build/pdf.mjs');
    // pdfjs-dist exports a default object, access getDocument from it
    const pdfjsLib = pdfjsModule.default || pdfjsModule;
    
    // Parse PDF using pdfjs-dist
    const loadingTask = pdfjsLib.getDocument({
      data: uint8Array,
      useSystemFonts: true
    });
    
    const pdf = await loadingTask.promise;
    const numPages = pdf.numPages;
    
    let markdown = '';
    
    // Extract text from each page
    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      // Combine text items from the page
      let pageText = '';
      let lastY = null;
      
      textContent.items.forEach((item) => {
        // Add spacing based on y-position to preserve structure
        if (lastY !== null && Math.abs(item.transform[5] - lastY) > 5) {
          pageText += '\n';
        }
        pageText += item.str + ' ';
        lastY = item.transform[5];
      });
      
      markdown += pageText + '\n\n';
    }
    
    // Clean up markdown
    // Convert multiple newlines to markdown paragraph breaks
    markdown = markdown.replace(/\n{3,}/g, '\n\n').trim();
    
    // Try to detect headers (lines that are all caps or have certain patterns)
    const lines = markdown.split('\n');
    const formattedLines = lines.map((line, index) => {
      const trimmed = line.trim();
      // If line is short and looks like a header (all caps or has no lowercase)
      if (trimmed.length > 0 && trimmed.length < 80 && 
          (trimmed === trimmed.toUpperCase() || !/[a-z]/.test(trimmed))) {
        // Check if next line is empty or different - likely a header
        const nextLine = lines[index + 1]?.trim();
        if (!nextLine || nextLine.length === 0 || nextLine.length < trimmed.length * 2) {
          return `## ${trimmed}`;
        }
      }
      return line;
    });
    
    markdown = formattedLines.join('\n');
    
    if (!markdown || markdown.trim().length === 0) {
      throw new Error('PDF conversion returned empty result - PDF might be image-based or corrupted');
    }
    
    console.log('PDF converted successfully, markdown length:', markdown.length);
    return markdown;
  } catch (error) {
    console.error('Error in convertPdfToMarkdown:', error);
    throw new Error(`Failed to convert PDF to Markdown: ${error.message}`);
  }
};

/**
 * Upload resume for a candidate
 * @param {string} candidateId - Candidate ID
 * @param {Buffer} pdfBuffer - PDF file buffer
 * @param {string} originalFileName - Original file name
 * @param {string} modifiedById - User ID who uploaded the resume
 * @returns {Promise<Object>} Updated candidate with resume
 */
const uploadResume = async (candidateId, pdfBuffer, originalFileName, modifiedById) => {
  try {
    console.log('Starting resume upload for candidate:', candidateId);
    
    // Verify candidate exists
    const candidate = await prisma.candidate.findUnique({
      where: { id: candidateId },
      select: { id: true, firstName: true, lastName: true }
    });

    if (!candidate) {
      console.error('Candidate not found:', candidateId);
      throw new Error('Candidate not found');
    }

    console.log('Candidate found, converting PDF to markdown...');
    // Convert PDF to markdown
    const markdown = await convertPdfToMarkdown(pdfBuffer);
    console.log('PDF converted, markdown length:', markdown?.length || 0);

    console.log('Updating candidate with resume data...');
    // Update candidate with resume markdown and resume URL
    const updatedCandidate = await prisma.candidate.update({
      where: { id: candidateId },
      data: {
        resume: markdown,
        resumeUrl: originalFileName, // Store original filename
        modifiedById
      },
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        modifiedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    console.log('Resume upload completed successfully');
    return updatedCandidate;
  } catch (error) {
    console.error('Error in uploadResume service:', {
      message: error.message,
      stack: error.stack,
      candidateId
    });
    if (error.message === 'Candidate not found') {
      throw error;
    }
    throw new Error(`Failed to upload resume: ${error.message}`);
  }
};

/**
 * Get resume for a candidate
 * @param {string} candidateId - Candidate ID
 * @returns {Promise<Object>} Candidate resume data
 */
const getResume = async (candidateId) => {
  try {
    const candidate = await prisma.candidate.findUnique({
      where: { id: candidateId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        resume: true,
        resumeUrl: true,
        updatedAt: true,
        modifiedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    if (!candidate) {
      throw new Error('Candidate not found');
    }

    if (!candidate.resume) {
      throw new Error('Resume not found for this candidate');
    }

    return candidate;
  } catch (error) {
    if (error.message === 'Candidate not found' || error.message.includes('Resume not found')) {
      throw error;
    }
    throw new Error(`Failed to fetch resume: ${error.message}`);
  }
};

/**
 * Delete resume for a candidate
 * @param {string} candidateId - Candidate ID
 * @param {string} modifiedById - User ID who deleted the resume
 * @returns {Promise<Object>} Updated candidate
 */
const deleteResume = async (candidateId, modifiedById) => {
  try {
    const candidate = await prisma.candidate.findUnique({
      where: { id: candidateId },
      select: { id: true }
    });

    if (!candidate) {
      throw new Error('Candidate not found');
    }

    const updatedCandidate = await prisma.candidate.update({
      where: { id: candidateId },
      data: {
        resume: null,
        resumeUrl: null,
        modifiedById
      },
      include: {
        modifiedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    return updatedCandidate;
  } catch (error) {
    if (error.message === 'Candidate not found') {
      throw error;
    }
    throw new Error(`Failed to delete resume: ${error.message}`);
  }
};

/**
 * Check if candidate has a resume
 * @param {string} candidateId - Candidate ID
 * @returns {Promise<boolean>} True if resume exists
 */
const hasResume = async (candidateId) => {
  try {
    const candidate = await prisma.candidate.findUnique({
      where: { id: candidateId },
      select: {
        id: true,
        resume: true
      }
    });

    if (!candidate) {
      throw new Error('Candidate not found');
    }

    return !!candidate.resume;
  } catch (error) {
    if (error.message === 'Candidate not found') {
      throw error;
    }
    throw new Error(`Failed to check resume: ${error.message}`);
  }
};

module.exports = {
  uploadResume,
  getResume,
  deleteResume,
  hasResume,
  convertPdfToMarkdown
};

