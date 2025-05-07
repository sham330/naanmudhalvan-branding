// utils/PdfGenerator.js
const PDFDocument = require('pdfkit');
const fs = require('fs');

/**
 * Generates a professional branding PDF document
 * @param {Object} options - Options for PDF generation
 * @param {string} options.title - Title of the branding document
 * @param {string} options.content - Generated branding content from AI
 * @param {Array} options.colors - Color palette with hex and rgb values
 * @param {string} options.companyType - Type of company
 * @param {string} options.brandVibe - Brand vibe description
 * @param {string} options.filePath - Output path for the PDF
 * @param {string} [options.additionalNotes] - Any additional notes provided
 */
async function generateBrandingPdf(options) {
  const { title, content, colors, companyType, brandVibe, filePath, additionalNotes } = options;
  
  // Create a new PDF document
  const doc = new PDFDocument({
    size: 'A4',
    margins: { top: 50, bottom: 50, left: 60, right: 60 },
    info: {
      Title: title,
      Author: 'AI Branding Generator',
      Subject: `Brand Identity for ${companyType}`,
      Keywords: 'branding, identity, design',
      CreationDate: new Date()
    }
  });
  
  // Pipe the PDF to the file
  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);
  
  // Define fonts
  const fonts = {
    heading: 'Helvetica-Bold',
    subheading: 'Helvetica-Bold',
    body: 'Helvetica',
    italic: 'Helvetica-Oblique'
  };
  
  // Define colors for document styling
  const docColors = {
    primary: '#333333',
    secondary: '#666666',
    accent: colors[0]?.hex || '#0077cc',
    light: '#f5f5f5',
    white: '#ffffff'
  };
  
  // Create a header function
  const addHeader = (text, size = 18, color = docColors.primary, font = fonts.heading) => {
    doc.font(font)
       .fontSize(size)
       .fillColor(color)
       .text(text, { align: 'left' })
       .moveDown(0.5);
  };
  
  // Create a subheader function
  const addSubheader = (text, size = 14, color = docColors.secondary) => {
    doc.font(fonts.subheading)
       .fontSize(size)
       .fillColor(color)
       .text(text, { align: 'left' })
       .moveDown(0.3);
  };
  
  // Function to add body text
  const addBody = (text, size = 11, color = docColors.primary) => {
    doc.font(fonts.body)
       .fontSize(size)
       .fillColor(color)
       .text(text, { align: 'left' })
       .moveDown(0.6);
  };
  
  // Function to draw a color swatch
  const drawColorSwatch = (x, y, width, height, color) => {
    // Draw color rectangle
    doc.rect(x, y, width, height)
       .fill(color);
       
    // Add a subtle border
    doc.rect(x, y, width, height)
       .lineWidth(0.5)
       .stroke('#dddddd');
  };
  
  // Function to add a section divider
  const addDivider = () => {
    doc.moveTo(60, doc.y)
       .lineTo(doc.page.width - 60, doc.y)
       .stroke(docColors.secondary)
       .moveDown(1);
  };
  
  // Start building the PDF
  
  // Cover page
  doc.rect(0, 0, doc.page.width, doc.page.height)
     .fill('#f9f9f9');
  
  // Draw color strip at top
  let stripHeight = 40;
  let startY = 50;
  colors.forEach((color, index) => {
    const stripWidth = doc.page.width / colors.length;
    drawColorSwatch(index * stripWidth, startY, stripWidth, stripHeight, color.hex);
  });
  
  // Add title
  doc.fontSize(28)
     .font(fonts.heading)
     .fillColor(docColors.primary)
     .text(title, { align: 'center' })
     .moveDown(0.5);
  
  // Add subtitle
  doc.fontSize(16)
     .font(fonts.italic)
     .fillColor(docColors.secondary)
     .text(`Brand Vibe: ${brandVibe}`, { align: 'center' })
     .moveDown(3);
  
  // Add color palette visualization
  doc.fontSize(14)
     .font(fonts.subheading)
     .fillColor(docColors.primary)
     .text('Brand Color Palette', { align: 'center' })
     .moveDown(1);
  
  // Draw color swatches in a row
  const swatchSize = 60;
  const swatchGap = 15;
  const startX = (doc.page.width - ((swatchSize * colors.length) + (swatchGap * (colors.length - 1)))) / 2;
  
  colors.forEach((color, index) => {
    const x = startX + (index * (swatchSize + swatchGap));
    const y = doc.y;
    
    // Draw the swatch
    drawColorSwatch(x, y, swatchSize, swatchSize, color.hex);
    
    // Add color codes below swatch
    doc.fontSize(8)
       .font(fonts.body)
       .fillColor(docColors.secondary)
       .text(color.hex, x, y + swatchSize + 5, { width: swatchSize, align: 'center' })
       .moveDown(0.2)
       .text(`RGB: ${color.rgb.r},${color.rgb.g},${color.rgb.b}`, { width: swatchSize, align: 'center' });
  });
  
  // Move down after swatches
  doc.moveDown(4);
  
  // Add date
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  doc.fontSize(10)
     .font(fonts.italic)
     .fillColor(docColors.secondary)
     .text(`Generated on ${currentDate}`, { align: 'center' })
     .moveDown(4);
  
  // Add footer
  doc.fontSize(9)
     .font(fonts.body)
     .fillColor(docColors.secondary)
     .text('AI-Generated Brand Identity Document', { align: 'center' });
  
  // Add new page for content
  doc.addPage();
  
  // Add table of contents
  addHeader('Table of Contents');
  addDivider();
  
  // Parse content sections from AI response
  const contentLines = content.split('\n');
  const sections = [];
  let currentSection = null;
  
  // Extract section titles
  for (const line of contentLines) {
    const trimmedLine = line.trim();
    
    // Skip empty lines
    if (!trimmedLine) continue;
    
    // Check if it's a numbered heading (like "1. Brand Story:")
    const headingMatch = trimmedLine.match(/^\d+\.\s+(.*?):\s*$/);
    if (headingMatch) {
      if (currentSection) {
        sections.push(currentSection);
      }
      currentSection = {
        title: headingMatch[1],
        content: []
      };
    } else if (currentSection) {
      currentSection.content.push(trimmedLine);
    }
  }
  
  // Add the last section if exists
  if (currentSection && currentSection.content.length > 0) {
    sections.push(currentSection);
  }
  
  // Generate table of contents
  sections.forEach((section, index) => {
    doc.font(fonts.body)
       .fontSize(11)
       .fillColor(docColors.primary)
       .text(`${index + 1}. ${section.title}`, { link: `section_${index + 1}` })
       .moveDown(0.5);
  });
  
  // Add content pages
  sections.forEach((section, index) => {
    // Add a new page for each major section
    doc.addPage();
    
    // Add destination for internal link
    doc.addNamedDestination(`section_${index + 1}`);
    
    // Add section header
    addHeader(`${index + 1}. ${section.title}`);
    addDivider();
    
    // Format and add section content
    const formattedContent = section.content.join('\n');
    
    // Look for subsections (e.g., bullet points)
    const paragraphs = formattedContent.split('\n\n');
    
    paragraphs.forEach(paragraph => {
      const lines = paragraph.split('\n');
      
      // Check if paragraph starts with a bullet or dash
      if (paragraph.trim().match(/^[•\-\*]/)) {
        // This is a list
        lines.forEach(line => {
          const bulletMatch = line.match(/^([•\-\*])\s+(.*)/);
          if (bulletMatch) {
            // Add bullet point with proper indentation
            doc.font(fonts.body)
               .fontSize(11)
               .fillColor(docColors.primary)
               .text(`•  ${bulletMatch[2]}`, 75, doc.y)
               .moveDown(0.3);
          } else {
            // Regular text line
            addBody(line);
          }
        });
      } else if (lines.length === 1 && !lines[0].includes(':') && lines[0].length < 50) {
        // This might be a subheading
        addSubheader(lines[0]);
      } else {
        // Regular paragraph text
        addBody(paragraph);
      }
    });
  });
  
  // Add a final page for additional information
  doc.addPage();
  addHeader('Additional Information');
  addDivider();
  
  addSubheader('Brand Request Details');
  addBody(`Company Type: ${companyType}`);
  addBody(`Brand Vibe: ${brandVibe}`);
  
  if (additionalNotes) {
    addBody(`Additional Notes: ${additionalNotes}`);
  }
  
  addSubheader('About This Document');
  addBody(`This brand identity guide was generated using AI technology based on your brand specifications. The content, color psychology, and recommendations are designed to help establish a cohesive and professional brand identity.

This document serves as a starting point for your branding journey. You may want to work with professional designers to further refine and develop these concepts into tangible brand assets.`);
  
  // Add color palette reference
  addSubheader('Color Palette Reference');
  
  // Draw detailed color swatches with full information
  let currentY = doc.y + 10;
  colors.forEach((color, index) => {
    const x = 60;
    const y = currentY;
    const swatchHeight = 40;
    const swatchWidth = 60;
    
    // Draw color swatch
    drawColorSwatch(x, y, swatchWidth, swatchHeight, color.hex);
    
    // Add color information next to swatch
    doc.font(fonts.body)
       .fontSize(11)
       .fillColor(docColors.primary)
       .text(`Color ${index + 1}`, x + swatchWidth + 15, y)
       .moveDown(0.2)
       .font(fonts.body)
       .fontSize(10)
       .text(`HEX: ${color.hex}`)
       .moveDown(0.2)
       .text(`RGB: ${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b}`);
    
    currentY += swatchHeight + 20;
  });
  
  // Finalize the PDF
  doc.end();
  
  // Return a promise that resolves when the PDF is written
  return new Promise((resolve, reject) => {
    stream.on('finish', resolve);
    stream.on('error', reject);
  });
}

module.exports = {
  generateBrandingPdf
};