import { useState, useRef, useEffect } from 'react';
import { 
  Upload, 
  X, 
  Pipette, 
  Palette, 
  Download, 
  Check, 
  Copy, 
  ArrowRight, 
  Brush, 
  Image as ImageIcon,
  Sparkles
} from 'lucide-react';

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
  const [companyType, setCompanyType] = useState('');
  const [brandVibe, setBrandVibe] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [brandingResult, setBrandingResult] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  
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

  // Effect to reset copy button
  useEffect(() => {
    if (copiedColor) {
      const timer = setTimeout(() => {
        setCopiedColor(null);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [copiedColor]);

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

  // Reset the app
  const handleRemove = () => {
    setUploadedImage('');
    setExtractedColors([]);
    setSelectedColor(null);
    setClickPosition(null);
    setStep(1);
    setCompanyType('');
    setBrandVibe('');
    setAdditionalNotes('');
    setBrandingResult(null);
    setPdfUrl(null);
  };

  // Handle next step
  const handleNextStep = () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    } else if (step === 3) {
      generateBrandingRecommendations();
    }
  };

  // Generate branding recommendations from backend
  // Generate branding recommendations from backend
const generateBrandingRecommendations = async () => {
    setIsGenerating(true);
    setStep(4);
    
    try {
      // Create payload with properly formatted data
      const payload = {
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
      
      // API call to backend
      const response = await fetch('http://localhost:3001/api/generate-branding/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate branding recommendations');
      }
      
      const data = await response.json();
      setBrandingResult(data);
    } catch (error) {
      console.error('Error generating branding recommendations:', error);
      alert('Failed to generate recommendations. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate and download PDF
  const generatePDF = async () => {
    setIsPdfGenerating(true);
    
    try {
      // Create payload with all necessary data
      const payload = {
        brandingResult,
        extractedColors: extractedColors.map(c => ({ 
          hex: c.hex, 
          rgb: c.rgb 
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
        throw new Error('Failed to generate PDF');
      }
      
      // Get PDF as blob
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `${companyType.replace('Custom: ', '')}-branding-guide.pdf`;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsPdfGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Color Palette Branding Tool
          </h1>
          <p className="text-gray-600 mt-2">
            Upload an image or logo to extract colors and get branding recommendations
          </p>
        </header>
        
        <div className="bg-white rounded-xl shadow-lg p-4">
          {/* Step indicator */}
          {uploadedImage && (
            <div className="mb-6">
              <div className="flex items-center justify-between">
                {[1, 2, 3, 4].map((stepNum) => (
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
                      {stepNum === 4 && 'Results'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
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
                        value={companyType.startsWith('Custom:') ? companyType.substring(7) : companyType}
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
                    disabled={!companyType}
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
                    Generate Recommendations
                    <Sparkles size={16} />
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Step 4: Results */}
          {step === 4 && (
            <div className="space-y-6">
              {isGenerating ? (
                <div className="py-12 text-center">
                  <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin mx-auto mb-6"></div>
                  <h3 className="text-xl font-medium text-gray-800 mb-2">Analyzing your brand colors</h3>
                  <p className="text-gray-500">Our AI is creating tailored recommendations for your brand</p>
                </div>
              ) : brandingResult ? (
                <div>
                  <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 mb-6">
                    <h2 className="text-xl font-bold text-blue-800 mb-2">
                      Branding Recommendations for {brandingResult.companyType}
                    </h2>
                    <p className="text-blue-600">
                      Based on your {brandingResult.brandVibe} style preference
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Color Analysis */}
                    <div>
                      <h3 className="text-lg font-semibold border-b pb-2 mb-4">Color Analysis</h3>
                      
                      <div className="space-y-4">
                        {/* Primary Color */}
                        <div className="bg-white rounded-lg border border-gray-100 overflow-hidden">
                          <div className="flex items-center">
                            <div 
                              className="w-16 h-16 flex-shrink-0" 
                              style={{ backgroundColor: brandingResult.colorUsageRecommendations.primaryColor.color }}
                            ></div>
                            <div className="p-3">
                              <div className="flex justify-between">
                                <p className="font-medium text-sm">Primary Color</p>
                                <button
                                  onClick={() => copyColorToClipboard(brandingResult.colorUsageRecommendations.primaryColor.color)}
                                  className="text-gray-500"
                                >
                                  {copiedColor === brandingResult.colorUsageRecommendations.primaryColor.color ? (
                                    <Check size={16} />
                                  ) : (
                                    <Copy size={16} />
                                  )}
                                </button>
                              </div>
                              <p className="text-xs font-mono text-gray-500">
                                {brandingResult.colorUsageRecommendations.primaryColor.color}
                              </p>
                              <p className="text-xs text-gray-600 mt-1">
                                {brandingResult.colorUsageRecommendations.primaryColor.usage}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        {/* Secondary Color */}
                        <div className="bg-white rounded-lg border border-gray-100 overflow-hidden">
                          <div className="flex items-center">
                            <div 
                              className="w-16 h-16 flex-shrink-0" 
                              style={{ backgroundColor: brandingResult.colorUsageRecommendations.secondaryColor.color }}
                            ></div>
                            <div className="p-3">
                              <div className="flex justify-between">
                                <p className="font-medium text-sm">Secondary Color</p>
                                <button
                                  onClick={() => copyColorToClipboard(brandingResult.colorUsageRecommendations.secondaryColor.color)}
                                  className="text-gray-500" 
                                >
                                  {copiedColor === brandingResult.colorUsageRecommendations.secondaryColor.color ? (
                                    <Check size={16} />
                                  ) : (
                                    <Copy size={16} />
                                  )}
                                </button>
                              </div>
                              <p className="text-xs text-gray-600 mt-1">
                                {brandingResult.colorUsageRecommendations.secondaryColor.usage}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        {/* Accent Color */}
                        <div className="bg-white rounded-lg border border-gray-100 overflow-hidden">
                          <div className="flex items-center">
                            <div 
                              className="w-16 h-16 flex-shrink-0" 
                              style={{ backgroundColor: brandingResult.colorUsageRecommendations.accentColor.color }}
                            ></div>
                            <div className="p-3">
                              <div className="flex justify-between">
                                <p className="font-medium text-sm">Accent Color</p>
                                <button
                                  onClick={() => copyColorToClipboard(brandingResult.colorUsageRecommendations.accentColor.color)}
                                  className="text-gray-500"
                                >
                                  {copiedColor === brandingResult.colorUsageRecommendations.accentColor.color ? (
                                    <Check size={16} />
                                  ) : (
                                    <Copy size={16} />
                                  )}
                                </button>
                              </div>
                              <p className="text-xs font-mono text-gray-500">
                                {brandingResult.colorUsageRecommendations.accentColor.color}
                              </p>
                              <p className="text-xs text-gray-600 mt-1">
                                {brandingResult.colorUsageRecommendations.accentColor.usage}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        {/* Neutral Color */}
                        <div className="bg-white rounded-lg border border-gray-100 overflow-hidden">
                          <div className="flex items-center">
                            <div 
                              className="w-16 h-16 flex-shrink-0" 
                              style={{ backgroundColor: brandingResult.colorUsageRecommendations.neutralColor.color }}
                            ></div>
                            <div className="p-3">
                              <div className="flex justify-between">
                                <p className="font-medium text-sm">Neutral Color</p>
                                <button
                                  onClick={() => copyColorToClipboard(brandingResult.colorUsageRecommendations.neutralColor.color)}
                                  className="text-gray-500"
                                >
                                  {copiedColor === brandingResult.colorUsageRecommendations.neutralColor.color ? (
                                    <Check size={16} />
                                  ) : (
                                    <Copy size={16} />
                                  )}
                                </button>
                              </div>
                              <p className="text-xs font-mono text-gray-500">
                                {brandingResult.colorUsageRecommendations.neutralColor.color}
                              </p>
                              <p className="text-xs text-gray-600 mt-1">
                                {brandingResult.colorUsageRecommendations.neutralColor.usage}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Brand Recommendations */}
                    <div>
                      <h3 className="text-lg font-semibold border-b pb-2 mb-4">Brand Strategy</h3>
                      
                      <div className="space-y-4">
                        {/* Typography */}
                        <div className="bg-white rounded-lg border border-gray-100 p-4">
                          <h4 className="font-semibold text-gray-800 mb-2">Typography</h4>
                          <p className="text-sm text-gray-600 mb-2">
                            {brandingResult.typographyRecommendation}
                          </p>
                          <div className="grid grid-cols-2 gap-2 mt-3">
                            <div className="bg-gray-50 p-2 rounded">
                              <p className="text-xs text-gray-500">Headings</p>
                              <p className="font-semibold">{brandingResult.fontRecommendations.headings}</p>
                            </div>
                            <div className="bg-gray-50 p-2 rounded">
                              <p className="text-xs text-gray-500">Body</p>
                              <p className="font-semibold">{brandingResult.fontRecommendations.body}</p>
                            </div>
                          </div>
                        </div>
                        
                        {/* Imagery Style */}
                        <div className="bg-white rounded-lg border border-gray-100 p-4">
                          <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                            <ImageIcon size={16} className="text-blue-500" />
                            Imagery Style
                          </h4>
                          <p className="text-sm text-gray-600">
                            {brandingResult.imageryRecommendation}
                          </p>
                        </div>
                        
                        {/* Brand Voice */}
                        <div className="bg-white rounded-lg border border-gray-100 p-4">
                          <h4 className="font-semibold text-gray-800 mb-2">Brand Voice</h4>
                          <p className="text-sm text-gray-600">
                            {brandingResult.brandVoiceRecommendation}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Color Palette Preview */}
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold border-b pb-2 mb-4">Complete Color Palette</h3>
                    <div className="flex flex-wrap">
                      {brandingResult.completeColorPalette.map((color, index) => (
                        <div 
                          key={index}
                          className="relative group"
                        >
                          <div 
                            className="w-16 h-16 md:w-24 md:h-24"
                            style={{ backgroundColor: color }}
                          ></div>
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 flex items-center justify-center transition-all duration-200">
                            <button
                              onClick={() => copyColorToClipboard(color)}
                              className="opacity-0 group-hover:opacity-100 bg-white p-1.5 rounded-full shadow-md"
                            >
                              {copiedColor === color ? (
                                <Check size={14} />
                              ) : (
                                <Copy size={14} />
                              )}
                            </button>
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs py-1 px-2 text-center opacity-0 group-hover:opacity-100 transition-all duration-200">
                            {color}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Implementation Tips */}
                  <div className="mt-8 bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <h3 className="text-lg font-semibold mb-4">Implementation Tips</h3>
                    <div className="space-y-3">
                      {brandingResult.implementationTips.map((tip, index) => (
                        <div key={index} className="flex">
                          <div className="flex-shrink-0 text-blue-500 mr-2">•</div>
                          <p className="text-sm text-gray-700">{tip}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Download & Share */}
                  <div className="mt-8 flex justify-center space-x-4">
                    <button
                      onClick={generatePDF}
                      disabled={isPdfGenerating}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg flex items-center gap-2 disabled:bg-gray-400"
                    >
                      {isPdfGenerating ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Generating PDF...
                        </>
                      ) : (
                        <>
                          <Download size={18} />
                          Download Brand Guide
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={() => handleRemove()}
                      className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg"
                    >
                      Start Over
                    </button>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center">
                  <p className="text-gray-500">No branding recommendations generated yet</p>
                  <button
                      onClick={() => handleRemove()}
                      className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg"
                    >
                      Back
                    </button>
                </div>
                
              )}
            </div>
          )}
        </div>
        
        <footer className="mt-8 text-center text-gray-500 text-sm">
          <p>© 2023 Color Palette Branding Tool. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}