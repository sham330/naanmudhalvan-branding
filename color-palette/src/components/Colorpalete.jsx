import { useState, useRef, useEffect } from 'react';
import { 
  Upload, 
  X,
  Heart,
  Target,
  BookOpen,
  Mic, 
  Pipette, 
  Palette, 
  Download, 
  Check, 
  Copy, 
  ArrowRight, 
  Brush, 
  Image as ImageIcon,
  Sparkles,
  Loader,
  Link as LinkIcon,
  Share2,
  Type,
  Layout,
  Grid,
  FileText,
  MessageSquare
} from 'lucide-react';
import BrandingGuidelines from './BrandingGuidelines';

export default function Colorpalete() {
  // State for image handling
  const [uploadedImage, setUploadedImage] = useState('');
  const [processingState, setProcessingState] = useState('idle'); // 'idle', 'processing', 'complete'
  const [dragOver, setDragOver] = useState(false);
  
  // State for color extraction
  const [extractedColors, setExtractedColors] = useState([]);
  const [selectedColor, setSelectedColor] = useState(null);
  const [clickPosition, setClickPosition] = useState(null);
  const [copiedColor, setCopiedColor] = useState(null);
  
  // State for company branding options
  const [step, setStep] = useState(1);
  const [companyName, setCompanyName] = useState('');
  const [companyType, setCompanyType] = useState('');
  const [brandVibe, setBrandVibe] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  // State for branding guide
  const [pdfUrl, setPdfUrl] = useState('');
  const [pdfLinkCopied, setPdfLinkCopied] = useState(false);
  const [brandingData, setBrandingData] = useState(null);
  
  // Refs
  const fileInputRef = useRef(null);
  const imgRef = useRef(null);
  const canvasRef = useRef(null);
  
  // Common industry types
  const industryTypes = [
    'Technology', 'Healthcare', 'Finance', 'Education', 
    'Food & Beverage', 'Fashion', 'Retail', 'Entertainment',
    'Manufacturing', 'Real Estate', 'Travel', 'Fitness'
  ];
  
  // Vibe options
  const vibeOptions = [
    'Premium & Luxurious', 'Calm & Minimal', 'Bold & Energetic',
    'Trustworthy & Professional', 'Creative & Artistic', 'Eco-friendly & Natural',
    'Modern & Innovative', 'Traditional & Classic'
  ];

  const formatRgb = (rgb) => {
    if (typeof rgb === 'string') return rgb;
    if (rgb && typeof rgb === 'object' && 'r' in rgb && 'g' in rgb && 'b' in rgb) {
      return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
    }
    return '';
  };

  // Effect to reset copy button
  useEffect(() => {
    if (copiedColor) {
      const timer = setTimeout(() => {
        setCopiedColor(null);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [copiedColor]);

  // Effect to reset PDF link copy button
  useEffect(() => {
    if (pdfLinkCopied) {
      const timer = setTimeout(() => {
        setPdfLinkCopied(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [pdfLinkCopied]);

  // When an image is selected
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.match('image.*')) {
      processImageFile(file);
    }
  };

  // For drag and drop functionality
  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.match('image.*')) {
        processImageFile(file);
      }
    }
  };

  // Process the uploaded image file
  const processImageFile = (file) => {
    setProcessingState('processing');
    const reader = new FileReader();
    
    reader.onload = (event) => {
      setUploadedImage(event.target.result);
      
      // Simulate processing delay for better UX
      setTimeout(() => {
        extractDominantColors(event.target.result);
        setProcessingState('complete');
      }, 1200);
    };
    
    reader.readAsDataURL(file);
  };

  // Extract dominant colors using k-means clustering
  const extractDominantColors = (imageSrc) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      
      // Get image data
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = [];
      
      // Sample pixels (for performance)
      const sampleRate = Math.max(1, Math.floor((img.width * img.height) / 10000));
      
      for (let i = 0; i < imageData.data.length; i += 4 * sampleRate) {
        const r = imageData.data[i];
        const g = imageData.data[i + 1];
        const b = imageData.data[i + 2];
        const a = imageData.data[i + 3];
        
        // Skip transparent pixels
        if (a < 128) continue;
        
        pixels.push([r, g, b]);
      }
      
      // Simplified color extraction - just take the most frequent colors
      const colorCount = 8;
      const colorMap = new Map();
      
      pixels.forEach(pixel => {
        const [r, g, b] = pixel;
        const key = `${Math.round(r/10)*10},${Math.round(g/10)*10},${Math.round(b/10)*10}`;
        
        if (colorMap.has(key)) {
          colorMap.set(key, {
            count: colorMap.get(key).count + 1,
            rgb: [r, g, b]
          });
        } else {
          colorMap.set(key, {
            count: 1,
            rgb: [r, g, b]
          });
        }
      });
      
      // Sort by count and take top colors
      const sortedColors = Array.from(colorMap.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, colorCount);
      
      // Format the results
      const colors = sortedColors.map(item => {
        const [r, g, b] = item.rgb;
        const hex = rgbToHex(r, g, b);
        return {
          rgb: `rgb(${r}, ${g}, ${b})`,
          hex: hex,
          count: item.count
        };
      });
      
      setExtractedColors(colors);
      setupColorPickingCanvas();
    };
    
    img.src = imageSrc;
  };

  // Convert RGB to HEX
  const rgbToHex = (r, g, b) => {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  };

  // Set up canvas for color picking
  const setupColorPickingCanvas = () => {
    if (!imgRef.current || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    
    canvas.width = imgRef.current.width;
    canvas.height = imgRef.current.height;
    ctx.drawImage(imgRef.current, 0, 0, canvas.width, canvas.height);
  };

  // Handle click on image to pick color
  const handleImageClick = (e) => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const pixelData = ctx.getImageData(x, y, 1, 1).data;
    const r = pixelData[0];
    const g = pixelData[1];
    const b = pixelData[2];
    
    const hex = rgbToHex(r, g, b);
    
    setSelectedColor({
      rgb: `rgb(${r}, ${g}, ${b})`,
      hex: hex
    });
    
    setClickPosition({ x, y });
  };

  // Get contrast color for text
  const getContrastColor = (hex) => {
    // Convert hex to RGB
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    
    // Calculate luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    // Return white for dark colors, black for light colors
    return luminance > 0.5 ? 'text-black' : 'text-white';
  };

  // Copy color to clipboard
  const copyColorToClipboard = (hex) => {
    navigator.clipboard.writeText(hex);
    setCopiedColor(hex);
  };

  // Copy PDF link to clipboard
  const copyPdfLink = () => {
    navigator.clipboard.writeText(pdfUrl);
    setPdfLinkCopied(true);
  };

  // Reset the app
  const handleRemove = () => {
    setUploadedImage('');
    setExtractedColors([]);
    setSelectedColor(null);
    setClickPosition(null);
    setPdfUrl('');
    setBrandingData(null);
    setStep(1);
    setCompanyName('');
    setCompanyType('');
    setBrandVibe('');
    setAdditionalNotes('');
  };

  // Handle next step
  const handleNextStep = () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    } else if (step === 3) {
      generateBrandingPDF();
    }
  };

  // Create a new branding project after viewing PDF
  const startNewProject = () => {
    handleRemove();
  };

  // Generate PDF and get URL
  const generateBrandingPDF = async () => {
    setIsGenerating(true);
    
    try {
      // Create payload with all necessary data
      const payload = {
        companyName,
        colors: extractedColors.map(c => ({
          hex: c.hex,
          rgb: {
            r: parseInt(c.rgb.split('(')[1].split(',')[0].trim()),
            g: parseInt(c.rgb.split(',')[1].trim()),
            b: parseInt(c.rgb.split(',')[2].split(')')[0].trim())
          }
        })),
        companyType,
        brandVibe,
        additionalNotes
      };
      
      // API call to backend to generate PDF
      const response = await fetch('http://localhost:3001/api/generate-branding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to generate PDF: ${errorText}`);
      }
      
      // Get the PDF URL and branding data from the response
      const data = await response.json();
      setPdfUrl(data.pdfUrl);
      setBrandingData(data.brandingData);
      
      // Move to success step (4)
      setStep(4);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Render color swatch with name and values
  const renderColorSwatch = (color, name = null) => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100">
      <div 
        className="h-16 w-full flex items-center justify-center relative"
        style={{ backgroundColor: color.hex }}
      >
        <button
          onClick={() => copyColorToClipboard(color.hex)}
          className={`opacity-0 hover:opacity-100 focus:opacity-100 absolute inset-0 flex items-center justify-center ${getContrastColor(color.hex)}`}
        >
          {copiedColor === color.hex ? (
            <Check size={20} />
          ) : (
            <Copy size={20} />
          )}
        </button>
      </div>
      <div className="p-2 text-center">
        {name && <div className="text-xs font-medium mb-1">{name}</div>}
        <div className="text-xs font-mono">{color.hex}</div>
        <div className="text-xs text-gray-500 mt-1">
          {formatRgb(color.rgb)}
        </div>
      </div>
    </div>
  );


  // Generate a sample UI component with the brand colors
  const renderSampleUI = (colors) => {
    const primary = colors.primary;
    const secondary = colors.secondary || colors.accent;
    const neutral = colors.neutral || colors.background;
    
    return (
      <div className="border rounded-lg overflow-hidden">
        {/* Header */}
        <div style={{ backgroundColor: primary.hex }} className="p-4">
          <div className={`text-lg font-bold ${getContrastColor(primary.hex)}`}>
            {companyName} Sample Header
          </div>
        </div>
        
        {/* Content */}
        <div style={{ backgroundColor: neutral.hex }} className="p-4">
          <div className="mb-3">
            <button 
              style={{ backgroundColor: secondary.hex }} 
              className={`px-3 py-1 rounded-md ${getContrastColor(secondary.hex)}`}
            >
              Sample Button
            </button>
          </div>
          
          <div style={{ color: primary.hex }} className="font-medium mb-1">
            Sample Heading
          </div>
          
          <div className="text-sm" style={{ color: colors.text ? colors.text.hex : '#333333' }}>
            Sample text content for {companyName} branding demonstration.
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Color Palette Branding Tool
          </h1>
          <p className="text-gray-600 mt-2">
            Upload an image or logo to extract colors and get a PDF branding guide
          </p>
        </header>
        
        <div className="bg-white rounded-xl shadow-lg p-4">
          {/* Step indicator */}
          {uploadedImage && step < 4 && (
            <div className="mb-6">
              <div className="flex items-center justify-between">
                {[1, 2, 3].map((stepNum) => (
                  <div 
                    key={stepNum} 
                    className="flex flex-col items-center flex-1"
                  >
                    <div 
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-medium ${
                        stepNum < step ? 'bg-green-500 text-white' :
                        stepNum === step ? 'bg-blue-600 text-white' :
                        'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {stepNum < step ? <Check size={16} /> : stepNum}
                    </div>
                    <span className="text-xs mt-1 text-center hidden md:block">
                      {stepNum === 1 && 'Extract Colors'}
                      {stepNum === 2 && 'Company Info'}
                      {stepNum === 3 && 'Brand Vibe'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {isGenerating ? (
            <div className="py-16 text-center">
              <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin mx-auto mb-6"></div>
              <h3 className="text-xl font-medium text-gray-800 mb-2">Creating your brand guide</h3>
              <p className="text-gray-500">We're generating a custom PDF for your brand. This may take a moment...</p>
            </div>
          ) : (
            <>
              {/* Step 1: Upload image and extract colors */}
              {step === 1 && (
                <div className="space-y-6">
                  {/* Image upload area */}
                  {!uploadedImage ? (
                    <div 
                      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer ${
                        dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                      }`}
                      onClick={() => fileInputRef.current.click()}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setDragOver(true);
                      }}
                      onDragLeave={(e) => {
                        e.preventDefault();
                        setDragOver(false);
                      }}
                      onDrop={handleDrop}
                    >
                      <input 
                        type="file" 
                        ref={fileInputRef}
                        className="hidden" 
                        accept="image/*"
                        onChange={handleImageUpload}
                      />
                      
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <div className="p-3 bg-blue-50 rounded-full text-blue-500">
                          <Upload size={24} />
                        </div>
                        <h3 className="text-lg font-medium">Upload an image</h3>
                        <p className="text-sm text-gray-500">
                          Drag and drop an image or click to browse
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Image Preview Section */}
                      <div className="flex flex-col md:flex-row gap-6">
                        <div className="w-full md:w-1/2 rounded-lg overflow-hidden relative">
                          {/* Actual image display */}
                          <img 
                            ref={imgRef}
                            src={uploadedImage} 
                            alt="Uploaded preview" 
                            className="w-full h-64 object-cover"
                          />
                          
                          {/* Overlay canvas for color picking */}
                          <canvas
                            ref={canvasRef}
                            onClick={handleImageClick}
                            className="absolute top-0 left-0 w-full h-full cursor-crosshair"
                            style={{ opacity: 0 }} // Invisible canvas for color picking
                          />
                          
                          {/* Visual indicator for clicked position */}
                          {clickPosition && (
                            <div className="absolute pointer-events-none" style={{ 
                              left: clickPosition.x, 
                              top: clickPosition.y,
                            }}>
                              <div className="absolute w-8 h-8 border-2 border-white rounded-full -ml-4 -mt-4" style={{ 
                                backgroundColor: selectedColor?.hex || 'transparent',
                                opacity: 0.8
                              }} />
                            </div>
                          )}
                          
                          <button 
                            onClick={handleRemove}
                            className="absolute top-2 right-2 bg-black/40 text-white rounded-full p-1.5"
                          >
                            <X size={16} />
                          </button>
                          
                          {processingState === 'complete' && (
                            <div className="absolute bottom-2 left-2 bg-black/40 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                              <Pipette size={12} />
                              Click to pick a color
                            </div>
                          )}
                        </div>

                        {/* Extracted Colors Section */}
                        <div className="w-full md:w-1/2">
                          <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                              <Palette size={18} className="text-blue-500" />
                              Extracted Colors
                            </h3>
                            
                            {processingState === 'processing' && (
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                Processing...
                              </div>
                            )}
                          </div>
                          
                          {processingState === 'processing' ? (
                            <div className="h-64 flex items-center justify-center">
                              <div className="text-center">
                                <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
                                <p className="text-gray-500">Extracting colors from your image...</p>
                              </div>
                            </div>
                          ) : (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                              {extractedColors.map((color, index) => (
                                <div 
                                  key={index}
                                  className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100"
                                >
                                  <div 
                                    className="h-16 w-full flex items-center justify-center relative"
                                    style={{ backgroundColor: color.hex }}
                                  >
                                    <button
                                      onClick={() => copyColorToClipboard(color.hex)}
                                      className={`opacity-0 hover:opacity-100 focus:opacity-100 absolute inset-0 flex items-center justify-center ${getContrastColor(color.hex)}`}
                                    >
                                      {copiedColor === color.hex ? (
                                        <Check size={20} />
                                      ) : (
                                        <Copy size={20} />
                                      )}
                                    </button>
                                  </div>
                                  <div className="p-2 text-center">
                                    <div className="text-xs font-mono">{color.hex}</div>
                                    <div className="text-xs text-gray-500 mt-1">
                                      {color.rgb}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Next button */}
                  {uploadedImage && processingState === 'complete' && (
                    <div className="flex justify-end mt-6">
                      <button
                        onClick={handleNextStep}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2"
                      >
                        Continue
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  )}
                </div>
              )}
              
              {/* Step 2: Company Information */}
              {step === 2 && (
                <div className="space-y-6">
                  <div className="max-w-2xl mx-auto">
                    <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                      <Brush size={20} className="text-blue-500" />
                      Tell us about your company
                    </h2>
                    
                    <div className="space-y-6">
                      {/* Company Name Field - NEW */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Company Name
                        </label>
                        <input
                          type="text"
                          placeholder="Enter your company name"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          What type of company or industry?
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {industryTypes.map((industry) => (
                            <button
                              key={industry}
                              onClick={() => setCompanyType(industry)}
                              className={`px-4 py-2 rounded-lg border text-sm ${
                                companyType === industry 
                                  ? 'border-blue-500 bg-blue-50 text-blue-700' 
                                  : 'border-gray-200 text-gray-700'
                              }`}
                            >
                              {industry}
                            </button>
                          ))}
                        </div>
                        <div className="mt-2">
                          <input
                            type="text"
                            placeholder="Or specify other industry..."
                            value={companyType.startsWith('Custom:') ? companyType.substring(7) : ''}
                            onChange={(e) => setCompanyType(e.target.value ? `Custom: ${e.target.value}` : '')}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between mt-6">
                      <button
                        onClick={() => setStep(1)}
                        className="px-6 py-2 text-gray-600 bg-gray-100 rounded-lg flex items-center gap-2"
                      >
                        Back
                      </button>
                      <button
                        onClick={handleNextStep}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2"
                        disabled={!companyName || !companyType}
                      >
                        Continue
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Step 3: Brand Vibe */}
              {step === 3 && (
                <div className="space-y-6">
                  <div className="max-w-2xl mx-auto">
                    <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                      <Palette size={20} className="text-blue-500" />
                      Choose your brand vibe
                    </h2>
                    
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          What feeling do you want your brand to convey?
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {vibeOptions.map((vibe) => (
                            <button
                              key={vibe}
                              onClick={() => setBrandVibe(vibe)}
                              className={`px-4 py-2 rounded-lg border text-sm ${
                                brandVibe === vibe 
                                  ? 'border-blue-500 bg-blue-50 text-blue-700' 
                                  : 'border-gray-200 text-gray-700'
                              }`}
                            >
                              {vibe}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Additional notes or requirements (optional)
                        </label>
                        <textarea
                          value={additionalNotes}
                          onChange={(e) => setAdditionalNotes(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          rows={4}
                          placeholder="E.g., target audience, specific elements to incorporate, colors to avoid, etc."
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-between mt-6">
                      <button
                        onClick={() => setStep(2)}
                        className="px-6 py-2 text-gray-600 bg-gray-100 rounded-lg flex items-center gap-2"
                      >
                        Back
                      </button>
                      <button
                        onClick={handleNextStep}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2"
                        disabled={!brandVibe}
                      >
                        Generate Branding
                        <Download size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Step 4: Success - Branding Guide */}
              {step === 4 && brandingData && (
        <div className="py-6">
        <h2 className="text-2xl font-semibold mb-6 text-center">
          {companyName} Branding Guide
        </h2>
        
        {/* Creative branding layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
          {/* Left column */}
          <div className="lg:col-span-8">
            {/* Brand Story */}
            {brandingData.brandStory && (
              <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                  <BookOpen size={18} />
                  Brand Story
                </h3>
                <p className="text-gray-700">{brandingData.brandStory}</p>
              </div>
            )}
      
            {/* Color schemes section */}
            {brandingData.colorPsychology && (
              <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                  <Palette size={18} />
                  Brand Color Palette
                </h3>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {brandingData.colorPsychology.primary && 
                    renderColorSwatch(brandingData.colorPsychology.primary, "Primary")}
                  {brandingData.colorPsychology.secondary && 
                    renderColorSwatch(brandingData.colorPsychology.secondary, "Secondary")}
                  {brandingData.colorPsychology.accent && 
                    renderColorSwatch(brandingData.colorPsychology.accent, "Accent")}
                  {brandingData.colorPsychology.neutral && 
                    renderColorSwatch(brandingData.colorPsychology.neutral, "Neutral")}
                </div>
                
                {brandingData.colorPsychology.primary?.psychology && (
                  <div className="mt-4 p-3 bg-gray-50 rounded">
                    <h4 className="text-sm font-medium mb-1">Color Psychology</h4>
                    <p className="text-xs text-gray-600">
                      {brandingData.colorPsychology.primary.psychology}
                    </p>
                  </div>
                )}
              </div>
            )}
            
            {/* Typography section */}
            {brandingData.typography && (
              <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                  <Type size={18} />
                  Typography
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm text-gray-500 mb-1">Primary Font</h4>
                    <p className="text-2xl" style={{ fontFamily: brandingData.typography.primaryFont || 'sans-serif' }}>
                      {brandingData.typography.primaryFont || 'Sans Serif'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Used for headings and important text
                    </p>
                  </div>
                  
                  {brandingData.typography.secondaryFont && (
                    <div>
                      <h4 className="text-sm text-gray-500 mb-1">Secondary Font</h4>
                      <p className="text-lg" style={{ fontFamily: brandingData.typography.secondaryFont }}>
                        {brandingData.typography.secondaryFont}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Used for body text and supporting content
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Brand voice */}
            {brandingData.brandVoice && (
              <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                  <Mic size={18} />
                  Brand Voice
                </h3>
                
                <div className="space-y-4">
                  {brandingData.brandVoice.tone && (
                    <div>
                      <h4 className="text-sm text-gray-500 mb-1">Overall Tone</h4>
                      <p>{brandingData.brandVoice.tone}</p>
                    </div>
                  )}
                  
                  {brandingData.brandVoice.traits && (
                    <div>
                      <h4 className="text-sm text-gray-500 mb-2">Key Traits</h4>
                      <ul className="grid grid-cols-2 gap-2">
                        {brandingData.brandVoice.traits.map((trait, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: brandingData.colorPsychology?.primary?.hex || '#000' }}></div>
                            <span>{trait}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {brandingData.brandVoice.examples && (
                    <div>
                      <h4 className="text-sm text-gray-500 mb-1">Example Phrases</h4>
                      <ul className="space-y-2">
                        {brandingData.brandVoice.examples.map((example, index) => (
                          <li key={index} className="text-sm italic pl-2 border-l-2" style={{ borderColor: brandingData.colorPsychology?.primary?.hex || '#000' }}>
                            "{example}"
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Core Values */}
            {brandingData.coreValues && (
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                  <Heart size={18} />
                  Core Values
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {brandingData.coreValues.map((value, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded flex items-start gap-2">
                      <div 
                        className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs"
                        style={{ backgroundColor: brandingData.colorPsychology?.primary?.hex || '#000' }}
                      >
                        {index + 1}
                      </div>
                      <span>{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
      
          {/* Right column */}
          <div className="lg:col-span-4 space-y-6">
            {/* Brand info */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                <FileText size={18} />
                Brand Information
              </h3>
              
              <div className="space-y-3">
                <div>
                  <h4 className="text-xs text-gray-500">Company Name</h4>
                  <p className="font-medium">{companyName}</p>
                </div>
                
                <div>
                  <h4 className="text-xs text-gray-500">Industry</h4>
                  <p>{companyType.startsWith('Custom:') ? companyType.substring(7) : companyType}</p>
                </div>
                
                <div>
                  <h4 className="text-xs text-gray-500">Brand Vibe</h4>
                  <p>{brandVibe}</p>
                </div>
                
                {brandingData.tagline && (
                  <div>
                    <h4 className="text-xs text-gray-500">Tagline</h4>
                    <p className="font-medium italic">"{brandingData.tagline}"</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Mission & Vision */}
            {brandingData.missionStatement && (
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                  <Target size={18} />
                  Mission & Vision
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm text-gray-500 mb-1">Mission Statement</h4>
                    <p>{brandingData.missionStatement}</p>
                  </div>
                  
                  {brandingData.visionStatement && (
                    <div>
                      <h4 className="text-sm text-gray-500 mb-1">Vision Statement</h4>
                      <p>{brandingData.visionStatement}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Visual Elements */}
            {brandingData.visualElements && (
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                  <ImageIcon size={18} />
                  Visual Elements
                </h3>
                
                <div className="space-y-3">
                  {brandingData.visualElements.motifs && (
                    <div>
                      <h4 className="text-sm text-gray-500 mb-1">Motifs</h4>
                      <ul className="list-disc pl-5">
                        {brandingData.visualElements.motifs.map((motif, index) => (
                          <li key={index}>{motif}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {brandingData.visualElements.patterns && (
                    <div>
                      <h4 className="text-sm text-gray-500 mb-1">Patterns</h4>
                      <ul className="list-disc pl-5">
                        {brandingData.visualElements.patterns.map((pattern, index) => (
                          <li key={index}>{pattern}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {brandingData.visualElements.iconographyStyle && (
                    <div>
                      <h4 className="text-sm text-gray-500 mb-1">Iconography Style</h4>
                      <p>{brandingData.visualElements.iconographyStyle}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Sample UI */}
            {brandingData.colorPsychology && (
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                  <Grid size={18} />
                  Sample UI Component
                </h3>
                
                {renderSampleUI(brandingData.colorPsychology)}
              </div>
            )}
            
            {/* Download / Share */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                <Download size={18} />
                Export Options
              </h3>
              
              <div className="space-y-3">
                <a 
                  href={pdfUrl}
                  download={`${companyName.replace(/\s+/g, '-')}-branding-guide.pdf`}
                  className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-blue-600 text-white rounded-lg"
                >
                  <Download size={16} />
                  Download PDF
                </a>
                
                <button
                  onClick={copyPdfLink}
                  className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg"
                >
                  {pdfLinkCopied ? (
                    <>
                      <Check size={16} />
                      Link Copied!
                    </>
                  ) : (
                    <>
                      <LinkIcon size={16} />
                      Copy Link
                    </>
                  )}
                </button>
                
                <button
                  onClick={startNewProject}
                  className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg"
                >
                  <ImageIcon size={16} />
                  Start New Project
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Additional sections */}
        {brandingData.messagingFramework && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
              <MessageSquare size={18} />
              Messaging Framework
            </h3>
            
            <div className="space-y-4">
              {brandingData.messagingFramework.keyMessages && (
                <div>
                  <h4 className="text-sm text-gray-500 mb-2">Key Messages</h4>
                  <ul className="space-y-2">
                    {brandingData.messagingFramework.keyMessages.map((message, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div 
                          className="w-2 h-2 rounded-full mt-1.5"
                          style={{ backgroundColor: brandingData.colorPsychology?.primary?.hex || '#000' }}
                        ></div>
                        <span>{message}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {brandingData.messagingFramework.elevatorPitch && (
                <div>
                  <h4 className="text-sm text-gray-500 mb-1">Elevator Pitch</h4>
                  <p className="italic">"{brandingData.messagingFramework.elevatorPitch}"</p>
                </div>
              )}
            </div>
          </div>
        )}
        
       

<BrandingGuidelines brandingData={brandingData} />

{/* Share buttons at bottom */}
<div className="flex justify-center mt-8 gap-3">
  <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg">
    <Share2 size={16} />
    Share on Twitter
  </button>
  <button className="flex items-center gap-2 px-4 py-2 bg-blue-800 text-white rounded-lg">
    <Share2 size={16} />
    Share on LinkedIn
  </button>
</div>
</div>
)}
</>
)}
</div>
</div>
</div>
);
}
                      