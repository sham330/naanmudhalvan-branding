import { useState, useEffect } from 'react';
import { ChevronRight, ChevronDown, Download, ExternalLink, Search, Copy, Check } from 'lucide-react';

export default function BrandingGuidelines({ brandingData = {} }) {
  const [activeSection, setActiveSection] = useState('brand-overview');
  const [expandedSections, setExpandedSections] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedColor, setCopiedColor] = useState(null);

  // Handle section toggling for mobile view
  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  // Handle search filtering
  const handleSearch = (e) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  // Scroll to section when clicking in sidebar
  const scrollToSection = (sectionId) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Copy color hex code
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedColor(text);
    setTimeout(() => setCopiedColor(null), 2000);
  };

  // Define all possible sections with their ids and titles
  const sections = [
    { id: 'brand-overview', title: 'Brand Overview' },
    { id: 'brand-story', title: 'Brand Story' },
    { id: 'mission-vision', title: 'Mission & Vision' },
    { id: 'core-values', title: 'Core Values' },
    { id: 'color-palette', title: 'Color Palette' },
    { id: 'typography', title: 'Typography' },
    { id: 'visual-elements', title: 'Visual Elements' },
    { id: 'tone-of-voice', title: 'Tone of Voice' },
    { id: 'imagery', title: 'Imagery Guidelines' },
    { id: 'target-audience', title: 'Target Audience' },
    { id: 'messaging', title: 'Messaging Framework' },
    { id: 'applications', title: 'Brand Applications' },
    { id: 'dos-donts', title: "Do's & Don'ts" }
  ];

  // Filter sections that have data
  const filteredSections = sections.filter(section => {
    if (searchTerm) {
      return section.title.toLowerCase().includes(searchTerm);
    }
    return true;
  });

  return (
    <div className="mt-8 font-sans">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Brand Identity Guidelines
        </h2>
        <div className="flex gap-3">
          <button className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm font-medium text-gray-700 transition">
            <Download size={16} className="mr-2" />
            Export PDF
          </button>
        </div>
      </div>
      
      {/* Search bar - visible on all screen sizes */}
      <div className="mb-6 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={18} className="text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search brand guidelines..."
          className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          value={searchTerm}
          onChange={handleSearch}
        />
      </div>
      
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {/* Mobile Navigation Accordion */}
        <div className="block lg:hidden border-b">
          <button
            onClick={() => toggleSection('navigation')}
            className="flex justify-between items-center w-full px-6 py-4 text-left font-medium text-gray-800"
          >
            <span>Jump to Section</span>
            {expandedSections['navigation'] ? (
              <ChevronDown size={18} className="text-gray-500" />
            ) : (
              <ChevronRight size={18} className="text-gray-500" />
            )}
          </button>
          
          {expandedSections['navigation'] && (
            <div className="bg-gray-50 px-6 py-3 border-t">
              <nav className="space-y-2">
                {filteredSections.map(section => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className={`block py-2 px-3 rounded text-sm ${
                      activeSection === section.id
                        ? 'bg-blue-100 text-blue-700 font-medium'
                        : 'text-gray-700 hover:bg-blue-50'
                    }`}
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToSection(section.id);
                      toggleSection('navigation');
                    }}
                  >
                    {section.title}
                  </a>
                ))}
              </nav>
            </div>
          )}
        </div>

        <div className="flex flex-col lg:flex-row">
          {/* Left sidebar for navigation - desktop only */}
          <div className="hidden lg:block lg:w-1/4 xl:w-1/5 bg-gray-50 border-r">
            <div className="h-full p-6">
              <h4 className="font-medium text-gray-400 uppercase text-xs tracking-wider mb-4">Contents</h4>
              <nav className="space-y-1">
                {filteredSections.map(section => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className={`flex items-center px-3 py-2 rounded-md text-sm ${
                      activeSection === section.id
                        ? 'bg-blue-100 text-blue-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToSection(section.id);
                    }}
                  >
                    {activeSection === section.id && (
                      <div className="w-1 h-5 bg-blue-600 rounded-full mr-2"></div>
                    )}
                    {section.title}
                  </a>
                ))}
              </nav>
            </div>
          </div>
          
          {/* Main content area */}
          <div className="lg:w-3/4 xl:w-4/5 p-6 md:p-8">
            <div className="prose max-w-none">
              {/* Brand Overview */}
              <section id="brand-overview" className="mb-12">
                <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
                  Brand Overview
                  <div className="ml-2 h-1 w-8 bg-blue-600 rounded"></div>
                </h3>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <p className="text-gray-700 leading-relaxed">
                    This comprehensive brand identity guide establishes the foundation for consistent brand representation across all touchpoints. 
                    The following guidelines outline our visual identity, voice, and positioning to create a cohesive and recognizable brand experience.
                  </p>
                </div>
              </section>
              
              {/* Brand Story */}
              <section id="brand-story" className="mb-12">
                <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
                  Brand Story
                  <div className="ml-2 h-1 w-8 bg-blue-600 rounded"></div>
                </h3>
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
                  <p className="text-gray-700 leading-relaxed">
                    {brandingData.brandStory || "Our brand story connects emotionally with our customers and communicates our purpose."}
                  </p>
                </div>

                {brandingData.brandNames && brandingData.brandNames.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-medium mb-3">Brand Name Options</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {brandingData.brandNames.map((name, index) => (
                        <div key={index} className="bg-white p-5 rounded-lg border shadow-sm">
                          <h5 className="font-medium text-lg mb-2">{name.name}</h5>
                          <p className="text-sm text-gray-600">{name.explanation}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {brandingData.tagline && (
                  <div className="mt-6">
                    <h4 className="font-medium mb-3">Tagline</h4>
                    <div className="bg-blue-50 p-5 rounded-lg border border-blue-100">
                      <p className="text-lg font-medium text-center italic">
                        "{brandingData.tagline}"
                      </p>
                    </div>
                  </div>
                )}
              </section>
              
              {/* Mission & Vision */}
              <section id="mission-vision" className="mb-12">
                <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
                  Mission & Vision
                  <div className="ml-2 h-1 w-8 bg-blue-600 rounded"></div>
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-5 rounded-lg border shadow-sm">
                    <h4 className="font-medium mb-2 text-lg">Mission Statement</h4>
                    <p>{brandingData.missionStatement || "Our mission defines our purpose and guides our actions."}</p>
                  </div>
                  
                  <div className="bg-white p-5 rounded-lg border shadow-sm">
                    <h4 className="font-medium mb-2 text-lg">Vision Statement</h4>
                    <p>{brandingData.visionStatement || "Our vision portrays what we aspire to become and achieve long-term."}</p>
                  </div>
                </div>
              </section>
              
              {/* Core Values */}
              <section id="core-values" className="mb-12">
                <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
                  Core Values
                  <div className="ml-2 h-1 w-8 bg-blue-600 rounded"></div>
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {(brandingData.coreValues || ['Integrity', 'Innovation', 'Excellence']).map((value, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-100 flex items-center justify-center">
                      <h4 className="font-medium text-center">{value}</h4>
                    </div>
                  ))}
                </div>
              </section>
              
              {/* Color Palette */}
              <section id="color-palette" className="mb-12">
                <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
                  Color Palette
                  <div className="ml-2 h-1 w-8 bg-blue-600 rounded"></div>
                </h3>
                <p className="mb-6">Our brand colors evoke specific emotions and associations that align with our identity.</p>
                
                {/* Primary Color */}
                {brandingData.colorPsychology?.primary && (
                  <div className="mb-6">
                    <h4 className="font-medium mb-3">Primary Color</h4>
                    <div className="bg-white p-6 rounded-lg border shadow-sm">
                      <div className="flex flex-col md:flex-row md:items-center gap-6">
                        <div 
                          className="h-24 w-24 rounded-md shadow-sm cursor-pointer relative group flex-shrink-0"
                          style={{ backgroundColor: brandingData.colorPsychology.primary.hex || 'white' }}
                          onClick={() => copyToClipboard(brandingData.colorPsychology.primary.hex)}
                        >
                          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity rounded-md">
                            {copiedColor === brandingData.colorPsychology.primary.hex ? (
                              <Check size={20} className="text-white" />
                            ) : (
                              <Copy size={20} className="text-white opacity-0 group-hover:opacity-100" />
                            )}
                          </div>
                        </div>
                        <div>
                          <div className="flex flex-wrap gap-2 items-center mb-2">
                            <span className="font-medium text-lg">Primary Color</span>
                            <span className="text-sm py-1 px-2 bg-gray-100 rounded-md">{brandingData.colorPsychology.primary.hex}</span>
                          </div>
                          <p className="text-gray-700">{brandingData.colorPsychology.primary.psychology}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Secondary Color */}
                {brandingData.colorPsychology?.secondary && (
                  <div className="mb-6">
                    <h4 className="font-medium mb-3">Secondary Color</h4>
                    <div className="bg-white p-6 rounded-lg border shadow-sm">
                      <div className="flex flex-col md:flex-row md:items-center gap-6">
                        <div 
                          className="h-24 w-24 rounded-md shadow-sm cursor-pointer relative group flex-shrink-0"
                          style={{ backgroundColor: brandingData.colorPsychology.secondary.hex || '#cccccc' }}
                          onClick={() => copyToClipboard(brandingData.colorPsychology.secondary.hex)}
                        >
                          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity rounded-md">
                            {copiedColor === brandingData.colorPsychology.secondary.hex ? (
                              <Check size={20} className="text-white" />
                            ) : (
                              <Copy size={20} className="text-white opacity-0 group-hover:opacity-100" />
                            )}
                          </div>
                        </div>
                        <div>
                          <div className="flex flex-wrap gap-2 items-center mb-2">
                            <span className="font-medium text-lg">Secondary Color</span>
                            <span className="text-sm py-1 px-2 bg-gray-100 rounded-md">{brandingData.colorPsychology.secondary.hex}</span>
                          </div>
                          <p className="text-gray-700">{brandingData.colorPsychology.secondary.psychology}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Accent & Neutral Colors */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Accent Color */}
                  {brandingData.colorPsychology?.accent && (
                    <div className="bg-white p-6 rounded-lg border shadow-sm">
                      <div className="flex items-start gap-4">
                        <div 
                          className="h-16 w-16 rounded-md shadow-sm cursor-pointer relative group flex-shrink-0"
                          style={{ backgroundColor: brandingData.colorPsychology.accent.hex || '#cccccc' }}
                          onClick={() => copyToClipboard(brandingData.colorPsychology.accent.hex)}
                        >
                          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity rounded-md">
                            {copiedColor === brandingData.colorPsychology.accent.hex ? (
                              <Check size={16} className="text-white" />
                            ) : (
                              <Copy size={16} className="text-white opacity-0 group-hover:opacity-100" />
                            )}
                          </div>
                        </div>
                        <div>
                          <div className="flex flex-wrap gap-2 items-center mb-2">
                            <span className="font-medium">Accent Color</span>
                            <span className="text-xs py-1 px-2 bg-gray-100 rounded-md">{brandingData.colorPsychology.accent.hex}</span>
                          </div>
                          <p className="text-sm text-gray-700">{brandingData.colorPsychology.accent.psychology}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Neutral Color */}
                  {brandingData.colorPsychology?.neutral && (
                    <div className="bg-white p-6 rounded-lg border shadow-sm">
                      <div className="flex items-start gap-4">
                        <div 
                          className="h-16 w-16 rounded-md shadow-sm cursor-pointer relative group flex-shrink-0"
                          style={{ backgroundColor: brandingData.colorPsychology.neutral.hex || '#cccccc' }}
                          onClick={() => copyToClipboard(brandingData.colorPsychology.neutral.hex)}
                        >
                          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity rounded-md">
                            {copiedColor === brandingData.colorPsychology.neutral.hex ? (
                              <Check size={16} className="text-white" />
                            ) : (
                              <Copy size={16} className="text-white opacity-0 group-hover:opacity-100" />
                            )}
                          </div>
                        </div>
                        <div>
                          <div className="flex flex-wrap gap-2 items-center mb-2">
                            <span className="font-medium">Neutral Color</span>
                            <span className="text-xs py-1 px-2 bg-gray-100 rounded-md">{brandingData.colorPsychology.neutral.hex}</span>
                          </div>
                          <p className="text-sm text-gray-700">{brandingData.colorPsychology.neutral.psychology}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {copiedColor && (
                  <div className="fixed bottom-4 right-4 bg-black text-white px-4 py-2 rounded-md shadow-lg text-sm z-50 flex items-center">
                    <Check size={16} className="mr-2" />
                    Color {copiedColor} copied to clipboard!
                  </div>
                )}
              </section>
              
              {/* Typography */}
              <section id="typography" className="mb-12">
                <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
                  Typography
                  <div className="ml-2 h-1 w-8 bg-blue-600 rounded"></div>
                </h3>
                <p className="mb-6">Our brand typography creates a consistent visual identity across all communications.</p>
                
                <div className="space-y-8">
                  {/* Primary Font */}
                  {brandingData.typography?.primaryFont && (
                    <div className="bg-white p-6 rounded-lg border shadow-sm">
                      <h4 className="font-medium mb-3">Primary Font</h4>
                      <p className="text-4xl mt-2" style={{ fontFamily: "'Inter', sans-serif" }}>
                        {brandingData.typography.primaryFont}
                      </p>
                      <p className="text-3xl mt-3" style={{ fontFamily: "'Inter', sans-serif" }}>
                        Aa Bb Cc Dd Ee Ff Gg Hh Ii Jj
                      </p>
                      <p className="text-2xl mt-1" style={{ fontFamily: "'Inter', sans-serif" }}>
                        The quick brown fox jumps over the lazy dog.
                      </p>
                      <p className="text-sm text-gray-500 mt-3">
                        Used for: Headings, titles, and primary messaging
                      </p>
                    </div>
                  )}
                  
                  {/* Secondary Font */}
                  {brandingData.typography?.secondaryFont && (
                    <div className="bg-white p-6 rounded-lg border shadow-sm">
                      <h4 className="font-medium mb-3">Secondary Font</h4>
                      <p className="text-3xl mt-2" style={{ fontFamily: "'Georgia', serif" }}>
                        {brandingData.typography.secondaryFont}
                      </p>
                      <p className="text-2xl mt-3" style={{ fontFamily: "'Georgia', serif" }}>
                        Aa Bb Cc Dd Ee Ff Gg Hh Ii Jj
                      </p>
                      <p className="text-xl mt-1" style={{ fontFamily: "'Georgia', serif" }}>
                        The quick brown fox jumps over the lazy dog.
                      </p>
                      <p className="text-sm text-gray-500 mt-3">
                        Used for: Subheadings and secondary content
                      </p>
                    </div>
                  )}
                  
                  {/* Body Font */}
                  {brandingData.typography?.bodyFont && (
                    <div className="bg-white p-6 rounded-lg border shadow-sm">
                      <h4 className="font-medium mb-3">Body Font</h4>
                      <p className="text-2xl mt-2">
                        {brandingData.typography.bodyFont}
                      </p>
                      <p className="text-base mt-3">
                        Aa Bb Cc Dd Ee Ff Gg Hh Ii Jj
                      </p>
                      <p className="text-base mt-1">
                        The quick brown fox jumps over the lazy dog. This text demonstrates the appearance of the body font in standard paragraphs.
                      </p>
                      <p className="text-sm text-gray-500 mt-3">
                        Used for: Body text, paragraphs, and general content
                      </p>
                    </div>
                  )}
                  
                  {/* Accent Font */}
                  {brandingData.typography?.accentFont && (
                    <div className="bg-white p-6 rounded-lg border shadow-sm">
                      <h4 className="font-medium mb-3">Accent Font</h4>
                      <p className="text-2xl mt-2" style={{ fontFamily: "'Courier New', monospace" }}>
                        {brandingData.typography.accentFont}
                      </p>
                      <p className="text-base mt-3" style={{ fontFamily: "'Courier New', monospace" }}>
                        Aa Bb Cc Dd Ee Ff Gg Hh Ii Jj
                      </p>
                      <p className="text-sm text-gray-500 mt-3">
                        Used for: Special elements, callouts, and decorative text
                      </p>
                    </div>
                  )}
                </div>
              </section>
              
              {/* Visual Elements */}
              <section id="visual-elements" className="mb-12">
                <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
                  Visual Elements
                  <div className="ml-2 h-1 w-8 bg-blue-600 rounded"></div>
                </h3>
                <p className="mb-6">Visual motifs, patterns and iconography that strengthen our brand identity.</p>
                
                {brandingData.visualElements && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Motifs */}
                    <div className="bg-white p-5 rounded-lg border shadow-sm">
                      <h4 className="font-medium mb-3">Brand Motifs</h4>
                      <ul className="list-disc pl-5 space-y-2">
                        {(brandingData.visualElements.motifs || ['No motifs defined']).map((motif, index) => (
                          <li key={index}>{motif}</li>
                        ))}
                      </ul>
                    </div>
                    
                    {/* Patterns */}
                    <div className="bg-white p-5 rounded-lg border shadow-sm">
                      <h4 className="font-medium mb-3">Pattern Style</h4>
                      <ul className="list-disc pl-5 space-y-2">
                        {(brandingData.visualElements.patterns || ['No patterns defined']).map((pattern, index) => (
                          <li key={index}>{pattern}</li>
                        ))}
                      </ul>
                    </div>
                    
                    {/* Iconography */}
                    <div className="bg-white p-5 rounded-lg border shadow-sm">
                      <h4 className="font-medium mb-3">Iconography Style</h4>
                      <p>{brandingData.visualElements.iconographyStyle || "No iconography style defined"}</p>
                    </div>
                  </div>
                )}
              </section>
              
              {/* Tone of Voice */}
              <section id="tone-of-voice" className="mb-12">
                <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
                  Tone of Voice
                  <div className="ml-2 h-1 w-8 bg-blue-600 rounded"></div>
                </h3>
                <p className="mb-6">Our brand voice defines how we communicate across all channels.</p>
                
                {brandingData.brandVoice && (
                  <>
                    <div className="bg-white p-6 rounded-lg border shadow-sm mb-6">
                      <h4 className="font-medium mb-3">Overall Tone</h4>
                      <p className="text-gray-700">{brandingData.brandVoice.tone}</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div className="bg-white p-5 rounded-lg border shadow-sm">
                        <h4 className="font-medium mb-3">Voice Traits</h4>
                        <div className="flex flex-wrap gap-2">
                          {(brandingData.brandVoice.traits || ['Professional', 'Approachable']).map((trait, index) => (
                            <span key={index} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                              {trait}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div className="bg-white p-5 rounded-lg border shadow-sm">
                        <h4 className="font-medium mb-3">Voice Examples</h4>
                        <ul className="space-y-2">
                          {(brandingData.brandVoice.examples || [
                            "Example phrase 1", 
                            "Example phrase 2"
                          ]).map((example, index) => (
                            <li key={index} className="italic">"{example}"</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </>
                )}
              </section>
              
              {/* Imagery Guidelines */}
              <section id="imagery" className="mb-12">
                <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
                  Imagery Guidelines
                  <div className="ml-2 h-1 w-8 bg-blue-600 rounded"></div>
                </h3>
                <div className="bg-white p-6 rounded-lg border shadow-sm">
                  <p className="text-gray-700">{brandingData.imageryGuidelines || "Our imagery should be consistent with our brand personality, using a cohesive style that resonates with our target audience."}</p>
                </div>
              </section>
              
              {/* Target Audience */}
              <section id="target-audience" className="mb-12">
                <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
                  Target Audience
                  <div className="ml-2 h-1 w-8 bg-blue-600 rounded"></div>
                </h3>
                
                {brandingData.targetAudience && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-5 rounded-lg border shadow-sm">
                      <h4 className="font-medium mb-3">Primary Audience</h4>
                      <p>{brandingData.targetAudience.primary}</p>
                    </div>
                    <div className="bg-white p-5 rounded-lg border shadow-sm">
                      <h4 className="font-medium mb-3">Secondary Audience</h4>
                      <p>{brandingData.targetAudience.secondary}</p>
                    </div>
                    
                    <div className="bg-white p-5 rounded-lg border shadow-sm">
                      <h4 className="font-medium mb-3">Psychographic Profile</h4>
                      <p>{brandingData.targetAudience.psychographic}</p>
                    </div>
                  </div>
                )}
              </section>
              
              {/* Messaging Framework */}
              <section id="messaging" className="mb-12">
                <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
                  Messaging Framework
                  <div className="ml-2 h-1 w-8 bg-blue-600 rounded"></div>
                </h3>
                
                {brandingData.positioningStatement && (
                  <div className="bg-white p-6 rounded-lg border shadow-sm mb-6">
                    <h4 className="font-medium mb-3">Positioning Statement</h4>
                    <p className="text-gray-700">{brandingData.positioningStatement}</p>
                  </div>
                )}
                
                {brandingData.messagingFramework && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-5 rounded-lg border shadow-sm">
                      <h4 className="font-medium mb-3">Key Messages</h4>
                      <ul className="list-disc pl-5 space-y-2">
                        {(brandingData.messagingFramework.keyMessages || []).map((message, index) => (
                          <li key={index}>{message}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="bg-white p-5 rounded-lg border shadow-sm">
                      <h4 className="font-medium mb-3">Elevator Pitch</h4>
                      <p className="italic">"{brandingData.messagingFramework.elevatorPitch}"</p>
                    </div>
                  </div>
                )}
              </section>
              
              {/* Brand Applications */}
              <section id="applications" className="mb-12">
                <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
                  Brand Applications
                  <div className="ml-2 h-1 w-8 bg-blue-600 rounded"></div>
                </h3>
                <p className="mb-6">Guidelines for applying our brand across different channels and touchpoints.</p>
                
                {brandingData.brandApplications && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-5 rounded-lg border shadow-sm">
                      <h4 className="font-medium mb-3">Stationery</h4>
                      <p>{brandingData.brandApplications.stationery}</p>
                    </div>
                    
                    <div className="bg-white p-5 rounded-lg border shadow-sm">
                      <h4 className="font-medium mb-3">Website</h4>
                      <p>{brandingData.brandApplications.website}</p>
                    </div>
                    
                    <div className="bg-white p-5 rounded-lg border shadow-sm">
                      <h4 className="font-medium mb-3">Social Media</h4>
                      <p>{brandingData.brandApplications.socialMedia}</p>
                    </div>
                    
                    <div className="bg-white p-5 rounded-lg border shadow-sm">
                      <h4 className="font-medium mb-3">Marketing Materials</h4>
                      <p>{brandingData.brandApplications.marketing}</p>
                    </div>
                    
                    <div className="bg-white p-5 rounded-lg border shadow-sm">
                      <h4 className="font-medium mb-3">Packaging</h4>
                      <p>{brandingData.brandApplications.packaging}</p>
                    </div>
                    
                    <div className="bg-white p-5 rounded-lg border shadow-sm">
                      <h4 className="font-medium mb-3">Signage</h4>
                      <p>{brandingData.brandApplications.signage}</p>
                    </div>
                  </div>
                )}
              </section>
              
              {/* Do's & Don'ts */}
              <section id="dos-donts" className="mb-6">
                <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
                  Do's & Don'ts
                  <div className="ml-2 h-1 w-8 bg-blue-600 rounded"></div>
                </h3>
                <p className="mb-6">Guidelines for proper and improper brand usage.</p>
                
                {brandingData.brandGuidelines && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-green-50 p-5 rounded-lg border border-green-100">
                      <h4 className="font-medium mb-3 text-green-700">Do's</h4>
                      <ul className="list-disc pl-5 space-y-2 text-green-800">
                        {(brandingData.brandGuidelines.dos || []).map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="bg-red-50 p-5 rounded-lg border border-red-100">
                      <h4 className="font-medium mb-3 text-red-700">Don'ts</h4>
                      <ul className="list-disc pl-5 space-y-2 text-red-800">
                        {(brandingData.brandGuidelines.donts || []).map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}