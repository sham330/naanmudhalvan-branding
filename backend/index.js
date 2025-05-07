require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// Main endpoint for generating branding
app.post('/api/generate-branding', async (req, res) => {
  try {
    const { colors, companyType, brandVibe, additionalNotes, companyName } = req.body;
    
    // Validate required fields
    if (!colors || !Array.isArray(colors) || colors.length === 0 || !companyType || !brandVibe) {
      return res.status(400).json({ 
        error: 'Missing required parameters',
        details: 'Make sure to provide colors array, companyType, and brandVibe'
      });
    }
    
    // Check if colors have the right format
    for (const color of colors) {
      if (!color.hex || !color.rgb || typeof color.rgb !== 'object') {
        return res.status(400).json({ 
          error: 'Invalid color format',
          details: 'Each color must have hex and rgb properties'
        });
      }
    }
    
    // Format color information for the prompt
    const colorInfo = colors.map((color, index) => 
      `Color ${index + 1}: HEX: ${color.hex}, RGB: ${color.rgb.r},${color.rgb.g},${color.rgb.b}`
    ).join('\n');
    
    // Construct the enhanced prompt for Gemini with JSON response format
    const prompt = `
    I need to create a comprehensive professional brand identity guide for a ${companyType} company${companyName ? ` called "${companyName}"` : ''}.
    
    The brand should embody the following vibe: ${brandVibe}
    
    The brand's color palette includes:
    ${colorInfo}
    
    Additional context: ${additionalNotes || 'None provided'}
    
    Based on the colors provided, please designate the most appropriate colors for these roles:
    - Primary color (main brand color)
    - Secondary color (complementary to primary)
    - Accent color (for highlighting and calls-to-action)
    - Neutral color (for backgrounds and text)
    
    Please provide your response in JSON format with the following structure:
    
    {
      "brandStory": "A compelling origin story or brand narrative",
      "brandNames": [
        {"name": "Suggested Name 1", "explanation": "Brief explanation"},
        {"name": "Suggested Name 2", "explanation": "Brief explanation"},
        {"name": "Suggested Name 3", "explanation": "Brief explanation"}
      ],
      "tagline": "A memorable tagline",
      "missionStatement": "Clear statement of purpose and goals",
      "visionStatement": "What the brand aspires to become",
      "coreValues": ["Value 1", "Value 2", "Value 3", "Value 4", "Value 5"],
      "brandVoice": {
        "tone": "Overall tone description",
        "traits": ["Trait 1", "Trait 2", "Trait 3", "Trait 4"],
        "examples": ["Example phrase 1", "Example phrase 2", "Example phrase 3"]
      },
      "colorPsychology": {
        "primary": {"hex": "#hexcode", "role": "Primary", "psychology": "Emotion and associations"},
        "secondary": {"hex": "#hexcode", "role": "Secondary", "psychology": "Emotion and associations"},
        "accent": {"hex": "#hexcode", "role": "Accent", "psychology": "Emotion and associations"},
        "neutral": {"hex": "#hexcode", "role": "Neutral", "psychology": "Emotion and associations"}
      },
      "typography": {
        "primaryFont": "Font name with weights",
        "secondaryFont": "Font name",
        "bodyFont": "Font name",
        "accentFont": "Font name"
      },
      "visualElements": {
        "motifs": ["Motif 1", "Motif 2"],
        "patterns": ["Pattern description"],
        "iconographyStyle": "Description of icon style"
      },
      "imageryGuidelines": "Description of photography style and visual language",
      "targetAudience": {
        "primary": "Demographic details",
        "secondary": "Characteristics",
        "psychographic": "Profile description"
      },
      "positioningStatement": "Statement of unique value proposition",
      "messagingFramework": {
        "keyMessages": ["Message 1", "Message 2", "Message 3"],
        "elevatorPitch": "30-second pitch"
      },
      "brandApplications": {
        "stationery": "Recommendations",
        "website": "Design principles",
        "socialMedia": "Presence guidelines",
        "marketing": "Material guidelines",
        "packaging": "If applicable",
        "signage": "Environmental applications"
      },
      "brandGuidelines": {
        "dos": ["Do 1", "Do 2", "Do 3"],
        "donts": ["Don't 1", "Don't 2", "Don't 3"]
      }
    }
    
    Ensure that your response follows this exact JSON structure so it can be directly used by the frontend application. Make appropriate color assignments based on color theory and the brand vibe.
    `;
    
    console.log('Sending request to Gemini with the following data:');
    console.log('Company Type:', companyType);
    console.log('Brand Vibe:', brandVibe);
    console.log('Colors:', colors.length, 'colors provided');
    
    // Call Gemini API
    const result = await model.generateContent(prompt);
    let response = result.response.text(); // Change 'const' to 'let'
    
    try {
      // Parse the JSON response from Gemini
      response = response.replace(/```json/g, '').replace(/```/g, '').trim();

      const brandingData = JSON.parse(response);
      
      // Return success with JSON data
      res.json({
        success: true,
        message: 'Branding package generated successfully',
        brandingData: brandingData
      });
      
    } catch (jsonError) {
      console.error('Error parsing JSON from Gemini:', jsonError);
      // If JSON parsing failed, return the raw text
      res.status(500).json({ 
        error: 'Failed to parse JSON response', 
        details: jsonError.message,
        rawResponse: response
      });
    }
    
  } catch (error) {
    console.error('Error generating branding:', error);
    res.status(500).json({ 
      error: 'Failed to generate branding package', 
      details: error.message 
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});