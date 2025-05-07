import { useState, useRef, useEffect } from 'react';
import { Upload, Image as ImageIcon, X, Check, Settings, RefreshCw, Trash2, Pipette, Copy, ZoomIn, ZoomOut, Info, } from 'lucide-react';

export default function ImageUpload() {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingState, setProcessingState] = useState('idle'); // idle, uploading, processing, complete, error
  const [selectedOption, setSelectedOption] = useState('vibrant');
  const [selectedColor, setSelectedColor] = useState(null);
  const [clickPosition, setClickPosition] = useState(null);
  const [hoverPosition, setHoverPosition] = useState(null);
  const [isZoomActive, setIsZoomActive] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(4); // Default 4x zoom
  const [showTooltip, setShowTooltip] = useState(false);
  const [advancedExpanded, setAdvancedExpanded] = useState(false);
  const [showZoomTip, setShowZoomTip] = useState(true);
  const [activeTab, setActiveTab] = useState('palette');
  const [animationParticles, setAnimationParticles] = useState([]);
  
  const canvasRef = useRef(null);
  const imgRef = useRef(null);
  const zoomCanvasRef = useRef(null);
  const containerRef = useRef(null);
  const bgCanvasRef = useRef(null);
  
  const paletteOptions = [
    { id: 'vibrant', name: 'Vibrant', description: 'Bold and energetic colors' },
    { id: 'pastel', name: 'Pastel', description: 'Soft and soothing tones' },
    { id: 'monochrome', name: 'Monochrome', description: 'Variations of a single color' },
    { id: 'complementary', name: 'Complementary', description: 'Colors from opposite sides of wheel' },
    { id: 'analogous', name: 'Analogous', description: 'Colors adjacent to each other' }
  ];

  // Creative background animation
  useEffect(() => {
    if (!bgCanvasRef.current) return;
    
    const canvas = bgCanvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set canvas dimensions
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Create initial particles
    const createParticles = () => {
      const particleCount = 50;
      const particles = [];
      
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 3 + 1,
          color: `hsla(${Math.random() * 60 + 200}, 80%, 60%, ${Math.random() * 0.3 + 0.1})`,
          speedX: Math.random() * 0.5 - 0.25,
          speedY: Math.random() * 0.5 - 0.25,
          life: Math.random() * 100 + 50
        });
      }
      
      return particles;
    };
    
    const particles = createParticles();
    
    // Animation function
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw gradient background
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, 'rgba(236, 72, 153, 0.03)'); // Fuchsia tint
      gradient.addColorStop(1, 'rgba(6, 182, 212, 0.03)'); // Cyan tint
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Update and draw particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        
        p.x += p.speedX;
        p.y += p.speedY;
        p.life -= 0.3;
        
        // Reset particle if it goes off-screen or dies
        if (p.x < 0 || p.x > canvas.width || p.y < 0 || p.y > canvas.height || p.life <= 0) {
          particles[i] = {
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * 3 + 1,
            color: `hsla(${Math.random() * 60 + 200}, 80%, 60%, ${Math.random() * 0.3 + 0.1})`,
            speedX: Math.random() * 0.5 - 0.25,
            speedY: Math.random() * 0.5 - 0.25,
            life: Math.random() * 100 + 50
          };
          continue;
        }
        
        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      }
      
      requestAnimationFrame(animate);
    };
    
    const animationId = requestAnimationFrame(animate);
    
    // Clean up
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  // Set up canvas for color picking when image changes
  useEffect(() => {
    if (uploadedImage && canvasRef.current && processingState === 'complete') {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      const img = new window.Image();
      img.onload = () => {
        // Match canvas dimensions to the displayed image
        const imgElement = imgRef.current;
        if (imgElement) {
          canvas.width = imgElement.clientWidth;
          canvas.height = imgElement.clientHeight;
          
          // Draw image to canvas (scaled to fit the canvas dimensions)
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        }
      };
      img.src = uploadedImage;
    }
  }, [uploadedImage, processingState]);

  // Handle window resize to update canvas dimensions
  useEffect(() => {
    const handleResize = () => {
      if (uploadedImage && canvasRef.current && imgRef.current) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const img = new window.Image();
        
        img.onload = () => {
          canvas.width = imgRef.current.clientWidth;
          canvas.height = imgRef.current.clientHeight;
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        };
        img.src = uploadedImage;
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [uploadedImage]);

  // Update zoom canvas on hover with optimized positioning
  useEffect(() => {
    if (isZoomActive && hoverPosition && zoomCanvasRef.current && canvasRef.current) {
      const zoomCanvas = zoomCanvasRef.current;
      const zoomCtx = zoomCanvas.getContext('2d');
      const mainCanvas = canvasRef.current;
      const containerRect = containerRef.current?.getBoundingClientRect();
      
      // Clear previous content
      zoomCtx.clearRect(0, 0, zoomCanvas.width, zoomCanvas.height);
      
      // Enhanced zoom calculations - square size is used for sampling area
      const captureSize = Math.floor(zoomCanvas.width / zoomLevel);
      const halfCaptureSize = Math.floor(captureSize / 2);
      
      // Calculate source coordinates with boundary protection
      const sourceX = Math.max(0, Math.min(mainCanvas.width - captureSize, hoverPosition.x - halfCaptureSize));
      const sourceY = Math.max(0, Math.min(mainCanvas.height - captureSize, hoverPosition.y - halfCaptureSize));
      
      // Draw zoomed portion of the image
      zoomCtx.drawImage(
        mainCanvas,
        sourceX, sourceY, captureSize, captureSize,
        0, 0, zoomCanvas.width, zoomCanvas.height
      );
      
      // Draw enhanced crosshair
      const centerX = zoomCanvas.width / 2;
      const centerY = zoomCanvas.height / 2;
      
      // Draw outer circle for better visibility
      zoomCtx.beginPath();
      zoomCtx.arc(centerX, centerY, 14, 0, 2 * Math.PI);
      zoomCtx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
      zoomCtx.lineWidth = 2;
      zoomCtx.stroke();
      
      // Draw white crosshair
      zoomCtx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
      zoomCtx.lineWidth = 2;
      
      // Horizontal line
      zoomCtx.beginPath();
      zoomCtx.moveTo(centerX - 10, centerY);
      zoomCtx.lineTo(centerX + 10, centerY);
      zoomCtx.stroke();
      
      // Vertical line
      zoomCtx.beginPath();
      zoomCtx.moveTo(centerX, centerY - 10);
      zoomCtx.lineTo(centerX, centerY + 10);
      zoomCtx.stroke();
      
      // Get and display the center color
      const centerPixel = zoomCtx.getImageData(centerX, centerY, 1, 1).data;
      const centerColor = `rgb(${centerPixel[0]}, ${centerPixel[1]}, ${centerPixel[2]})`;
      
      // Enhanced color info display
      zoomCtx.fillStyle = 'rgba(0, 0, 0, 0.75)';
      zoomCtx.fillRect(0, zoomCanvas.height - 30, zoomCanvas.width, 30);
      
      // Draw color preview
      zoomCtx.fillStyle = centerColor;
      zoomCtx.fillRect(8, zoomCanvas.height - 22, 14, 14);
      zoomCtx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      zoomCtx.strokeRect(8, zoomCanvas.height - 22, 14, 14);
      
      // Draw hex value
      zoomCtx.font = '12px monospace';
      zoomCtx.fillStyle = 'white';
      zoomCtx.textAlign = 'left';
      zoomCtx.fillText(
        rgbToHex(centerPixel[0], centerPixel[1], centerPixel[2]), 
        30, 
        zoomCanvas.height - 12
      );
    }
  }, [hoverPosition, isZoomActive, zoomLevel]);

  // Auto-hide zoom tip after 5 seconds
  useEffect(() => {
    if (showZoomTip && isZoomActive) {
      const timer = setTimeout(() => {
        setShowZoomTip(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [showZoomTip, isZoomActive]);

  // Add confetti particles when color is selected
  useEffect(() => {
    if (clickPosition && selectedColor) {
      // Create confetti particles at the click position
      const particleCount = 20;
      const newParticles = [];
      
      for (let i = 0; i < particleCount; i++) {
        newParticles.push({
          x: clickPosition.x,
          y: clickPosition.y,
          radius: Math.random() * 4 + 1,
          speedX: (Math.random() - 0.5) * 8,
          speedY: (Math.random() - 0.5) * 8 - 3, // Slightly upward bias
          opacity: 1,
          color: i % 3 === 0 ? selectedColor.hex : 
                 i % 3 === 1 ? '#FFFFFF' : 
                 `hsl(${(parseInt(selectedColor.hex.slice(1), 16) % 360)}, 80%, 60%)`,
          decreaseRate: Math.random() * 0.02 + 0.02
        });
      }
      
      setAnimationParticles(newParticles);
      
      // Animation loop for particles
      const animateParticles = () => {
        setAnimationParticles(prevParticles => 
          prevParticles
            .map(p => ({
              ...p,
              x: p.x + p.speedX,
              y: p.y + p.speedY,
              speedX: p.speedX * 0.96, // Damping
              speedY: p.speedY * 0.96 + 0.15, // Damping + gravity
              opacity: p.opacity - p.decreaseRate
            }))
            .filter(p => p.opacity > 0)
        );
      };
      
      const intervalId = setInterval(animateParticles, 30);
      
      return () => clearInterval(intervalId);
    }
  }, [clickPosition, selectedColor]);

  // Handle drag events
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  // Handle drop events
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  // Handle file input change
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  // Process the selected file
  const handleFile = (file) => {
    if (file.type.startsWith('image/')) {
      // Reset states
      setSelectedColor(null);
      setClickPosition(null);
      setIsZoomActive(false);
      setShowZoomTip(true);
      setActiveTab('palette');
      
      // Show file preview
      const reader = new FileReader();
      reader.onload = () => {
        setUploadedImage(reader.result);
      };
      reader.readAsDataURL(file);
      
      // Simulate upload progress
      setProcessingState('uploading');
      let progress = 0;
      const progressInterval = setInterval(() => {
        progress += 5;
        setUploadProgress(progress);
        if (progress >= 100) {
          clearInterval(progressInterval);
          setProcessingState('processing');
          setTimeout(() => {
            setProcessingState('complete');
          }, 1500);
        }
      }, 100);
    }
  };

  // Remove uploaded image
  const handleRemove = () => {
    setUploadedImage(null);
    setUploadProgress(0);
    setProcessingState('idle');
    setSelectedColor(null);
    setClickPosition(null);
    setIsZoomActive(false);
    setActiveTab('palette');
  };

  // Start extraction process
  const handleExtractColors = () => {
    if (processingState === 'complete') {
      setProcessingState('processing');
      setTimeout(() => {
        setProcessingState('complete');
      }, 1500);
    }
  };

  // Handle mouse movement over the image
  const handleMouseMove = (e) => {
    if (processingState !== 'complete' || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setHoverPosition({ x, y });
  };

  // Handle mouse leave
  const handleMouseLeave = () => {
    setHoverPosition(null);
  };

  // Handle click on image to get color
  const handleImageClick = (e) => {
    if (processingState !== 'complete' || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Get pixel color at click position
    const ctx = canvas.getContext('2d');
    const pixelData = ctx.getImageData(x, y, 1, 1).data;
    
    // Convert RGB to HEX
    const hex = rgbToHex(pixelData[0], pixelData[1], pixelData[2]);
    
    // Set selected color
    setSelectedColor({
      hex,
      rgb: `rgb(${pixelData[0]}, ${pixelData[1]}, ${pixelData[2]})`,
      r: pixelData[0],
      g: pixelData[1],
      b: pixelData[2]
    });
    
    // Save click position for indicator
    setClickPosition({ x, y });
  };

  // Toggle zoom mode
  const toggleZoom = () => {
    setIsZoomActive(!isZoomActive);
    if (!isZoomActive) {
      setShowZoomTip(true);
    }
  };

  // Change zoom level with haptic feedback animation
  const changeZoomLevel = (increment) => {
    const newZoom = Math.max(2, Math.min(8, zoomLevel + increment));
    setZoomLevel(newZoom);
    
    // Add a brief animation to show zoom level change
    if (zoomCanvasRef.current) {
      zoomCanvasRef.current.classList.add('zoom-transition');
      setTimeout(() => {
        if (zoomCanvasRef.current) {
          zoomCanvasRef.current.classList.remove('zoom-transition');
        }
      }, 300);
    }
  };

  // RGB to Hex conversion
  const rgbToHex = (r, g, b) => {
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
  };

  // Copy color code to clipboard with visual feedback
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setShowTooltip(true);
        setTimeout(() => setShowTooltip(false), 1500);
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
      });
  };

  // Calculate best zoom position to avoid edge overflow
  const getZoomPosition = () => {
    if (!hoverPosition || !canvasRef.current) return { left: 0, top: 0 };
    
    const canvas = canvasRef.current;
    const zoomWidth = 180; // Slightly larger for better visibility
    const zoomHeight = 180;
    
    // Smart positioning logic:
    // 1. Try default position (top-right of cursor)
    let left = hoverPosition.x + 20;
    let top = hoverPosition.y - zoomHeight - 10;
    
    // 2. If off the top, place below cursor
    if (top < 0) {
      top = hoverPosition.y + 20;
    }
    
    // 3. If off right edge, place to left of cursor
    if (left + zoomWidth > canvas.width) {
      left = hoverPosition.x - zoomWidth - 20;
    }
    
    // 4. Final safety checks to ensure on-screen
    left = Math.max(10, Math.min(canvas.width - zoomWidth - 10, left));
    top = Math.max(10, Math.min(canvas.height - zoomHeight - 10, top));
    
    return { left, top };
  };
  
  return (
    <div className="min-h-screen bg-white py-16 px-4 relative overflow-hidden" id="image">
      {/* Background animation canvas */}
      <canvas
        ref={bgCanvasRef}
        className="absolute top-0 left-0 w-full h-full -z-10"
      />
      
      <div className="max-w-4xl mx-auto relative">
        <div 
          className="text-center mb-12 relative" 
          style={{
            background: 'linear-gradient(120deg, rgba(236, 72, 153, 0.05), rgba(6, 182, 212, 0.05))',
            borderRadius: '1rem',
            padding: '2rem',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.04)'
          }}
        >
          <div className="absolute inset-0 overflow-hidden rounded-2xl opacity-10">
            <div className="absolute -left-10 -top-10 w-40 h-40 rounded-full bg-gradient-to-r from-fuchsia-300 to-purple-300 animate-blob" />
            <div className="absolute right-0 top-0 w-32 h-32 rounded-full bg-gradient-to-r from-cyan-300 to-blue-300 animate-blob animation-delay-2000" />
            <div className="absolute left-1/3 bottom-0 w-24 h-24 rounded-full bg-gradient-to-r from-pink-300 to-indigo-300 animate-blob animation-delay-4000" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4 relative z-10">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-500 to-cyan-500">
              Upload Your Image
            </span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto relative z-10">
            Upload an image to extract colors. Click anywhere on your image to pick a specific color.
          </p>
        </div>
        
        <div className="bg-white/80 backdrop-blur-md rounded-xl p-8 shadow-lg border border-gray-100 transition-all duration-500">
          {!uploadedImage ? (
            <div 
              className={`
                border-2 border-dashed rounded-lg p-8
                transition-all duration-500 ease-in-out
                flex flex-col items-center justify-center
                ${dragActive ? 'border-cyan-500 bg-cyan-50 scale-105' : 'border-gray-300 hover:border-gray-400'}
              `}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="w-20 h-20 bg-gradient-to-br from-fuchsia-500 to-cyan-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-fuchsia-200/40 animate-pulse-slow">
                <Upload size={32} className="text-white" />
              </div>
              
              <h3 className="text-xl font-medium text-gray-700 mb-2">
                Drag & Drop Your Image Here
              </h3>
              
              <p className="text-gray-500 mb-6 text-center">
                Or click to browse from your device
              </p>
              
              <label className="bg-gradient-to-r from-fuchsia-500 to-cyan-500 hover:from-cyan-500 hover:to-fuchsia-500 text-white font-medium py-2 px-6 rounded-lg cursor-pointer transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg">
                Select Image
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleFileChange}
                />
              </label>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Image Preview Section */}
              <div className="flex flex-col md:flex-row gap-8">
                <div 
                  ref={containerRef}
                  className="w-full md:w-1/2 rounded-lg overflow-hidden relative shadow-lg bg-gray-800"
                >
                  {/* Actual image display */}
                  <img 
                    ref={imgRef}
                    src={uploadedImage} 
                    alt="Uploaded preview" 
                    className="w-full h-64 object-cover transition-transform duration-300"
                  />
                  
                  {/* Overlay canvas for color picking */}
                  <canvas
                    ref={canvasRef}
                    onClick={handleImageClick}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    className={`absolute top-0 left-0 w-full h-full ${processingState === 'complete' ? (isZoomActive ? 'cursor-none' : 'cursor-crosshair') : ''}`}
                    style={{ opacity: 0 }} // Invisible canvas for color picking
                  />
                  
                  {/* Visual indicator for clicked position */}
                  {clickPosition && (
                    <div className="absolute pointer-events-none" style={{ 
                      left: clickPosition.x, 
                      top: clickPosition.y,
                    }}>
                      <div className="absolute w-8 h-8 border-2 border-white rounded-full -ml-4 -mt-4 shadow-md animate-pulse" style={{ 
                        backgroundColor: selectedColor?.hex || 'transparent',
                        opacity: 0.8
                      }} />
                      <div className="absolute w-2 h-2 bg-white rounded-full -ml-1 -mt-1 shadow-md" />
                    </div>
                  )}
                  
                  {/* Confetti particles animation */}
                  {animationParticles.map((p, i) => (
                    <div 
                      key={i}
                      className="absolute rounded-full pointer-events-none"
                      style={{
                        left: p.x,
                        top: p.y,
                        width: p.radius * 2,
                        height: p.radius * 2,
                        backgroundColor: p.color,
                        opacity: p.opacity,
                        transform: 'translate(-50%, -50%)'
                      }}
                    />
                  ))}
                  
                  {/* Enhanced zoom overlay */}
                  {isZoomActive && hoverPosition && (
                    <div 
                      className="absolute bg-white rounded-lg shadow-lg pointer-events-none border border-gray-200 overflow-hidden transition-all duration-300"
                      style={{ 
                        width: 180, 
                        height: 180,
                        ...getZoomPosition(),
                        transform: 'scale(1)',
                        animation: 'zoomPulse 0.5s ease-out'
                      }}
                    >
                      <canvas
                        ref={zoomCanvasRef}
                        width={180}
                        height={180}
                        className="w-full h-full"
                      />
                      {showZoomTip && (
                        <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-fuchsia-500 to-cyan-500 text-white text-xs py-1 px-2 text-center">
                          Use +/- buttons to adjust zoom level ({zoomLevel}x)
                        </div>
                      )}
                    </div>
                  )}
                  
                  <button 
                    onClick={handleRemove}
                    className="absolute top-2 right-2 bg-black/40 hover:bg-black/60 text-white rounded-full p-1.5 transition-all hover:rotate-90 duration-300"
                  >
                    <X size={16} />
                  </button>
                  
                  {processingState === 'complete' && (
                    <div className="absolute bottom-2 left-2 right-2 flex justify-between">
                      <div className="bg-black/40 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 animate-fadeIn">
                        <Pipette size={12} />
                        Click to pick a color
                      </div>
                      
                      {/* Color info display */}
                      {selectedColor && !isZoomActive && (
                        <div className="bg-black/40 text-white text-xs px-2 py-1 rounded-full animate-fadeIn">
                          {selectedColor.hex}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Enhanced zoom controls */}
                  {processingState === 'complete' && (
                    <div className="absolute top-2 left-2 flex gap-1">
                      <button
                        onClick={toggleZoom}
                        title={isZoomActive ? "Disable zoom" : "Enable zoom"}
                        className={`p-1.5 rounded-full transition-all duration-300 ${isZoomActive ? 'bg-gradient-to-r from-fuchsia-500 to-cyan-500 text-white shadow-lg' : 'bg-black/40 hover:bg-black/60 text-white'}`}
                      >
                        <ZoomIn size={16} />
                      </button>
                      
                      {isZoomActive && (
                        <>
                          <button
                            onClick={() => changeZoomLevel(1)}
                            disabled={zoomLevel >= 8}
                            title="Increase zoom level"
                            className="p-1.5 bg-black/40 hover:bg-black/60 text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                          >
                            <ZoomIn size={16} />
                          </button>
                          <button
                            onClick={() => changeZoomLevel(-1)}
                            disabled={zoomLevel <= 2}
                            title="Decrease zoom level"
                            className="p-1.5 bg-black/40 hover:bg-black/60 text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                          >
                            <ZoomOut size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="w-full md:w-1/2">
                  {processingState === 'complete' && (
                    <div className="mb-6">
                      {/* Tab Navigation */}
                      <div className="flex border-b border-gray-200">
                        <button 
                          onClick={() => setActiveTab('palette')}
                          className={`px-4 py-2 font-medium text-sm transition-all duration-300 relative
                            ${activeTab === 'palette' 
                              ? 'text-fuchsia-600' 
                              : 'text-gray-500 hover:text-gray-700'}`}
                        >
                          Palette Options
                          {activeTab === 'palette' && (
                            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-fuchsia-500 to-cyan-500 transform scale-x-100 transition-transform" />
                          )}
                        </button>
                      
                        <button 
                          onClick={() => setActiveTab('preview')}
                          className={`px-4 py-2 font-medium text-sm transition-all duration-300 relative
                            ${activeTab === 'preview' 
                              ? 'text-purple-600' 
                              : 'text-gray-500 hover:text-gray-700'}`}
                        >
                          Preview
                          {activeTab === 'preview' && (
                            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-purple-500 to-indigo-500 transform scale-x-100 transition-transform" />
                          )}
                        </button>
                      </div>
                      
                      {/* Tab Content */}
                      <div className="py-4">
                        {/* Palette Options Tab */}
                        {activeTab === 'palette' && (
                          <div className="space-y-3 animate-fadeIn transition-opacity duration-300">
                            <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center gap-2">
                              Choose the color scheme type
                              <span className="text-sm font-normal text-gray-500">
                                (Select an option)
                              </span>
                            </h3>
                            
                            {paletteOptions.map((option) => (
                              <div 
                                key={option.id}
                                className={`
                                  flex items-center p-3 rounded-lg cursor-pointer transition-all
                                  transform hover:translate-x-1 duration-300
                                  ${selectedOption === option.id 
                                    ? 'bg-gradient-to-r from-fuchsia-50 to-cyan-50 border border-fuchsia-200 shadow-sm' 
                                    : 'hover:bg-gray-100 border border-transparent'}
                                `}
                                onClick={() => setSelectedOption(option.id)}
                              >
                                <div className={`
                                  w-5 h-5 rounded-full flex items-center justify-center transition-all duration-300
                                  ${selectedOption === option.id ? 'bg-gradient-to-r from-fuchsia-500 to-cyan-500 transform scale-110' : 'border border-gray-300'}
                                `}>
                                  {selectedOption === option.id && <Check size={12} className="text-white" />}
                                </div>
                                <div className="ml-3">
                                  <p className="font-medium text-gray-800">{option.name}</p>
                                  <p className="text-sm text-gray-500">{option.description}</p>
                                </div>
                              </div>
                            ))}
                            
                            <button 
                              onClick={handleExtractColors}
                              className="mt-6 w-full flex items-center justify-center gap-2 bg-gradient-to-r from-fuchsia-500 to-cyan-500 hover:from-fuchsia-600 hover:to-cyan-600 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300 shadow hover:shadow-lg transform hover:-translate-y-0.5"
                            >
                              <RefreshCw size={16} className={processingState === 'processing' ? 'animate-spin' : ''} />
                              {processingState === 'processing' ? 'Extracting Colors...' : 'Extract Color Palette'}
                            </button>
                          </div>
                        )}
                        
                        {/* Color Tools Tab */}
                        
                        
                        {/* Preview Tab */}
                        {activeTab === 'preview' && (
                          <div className="animate-fadeIn transition-opacity duration-300">
                            <h3 className="text-lg font-medium text-gray-800 mb-3">Color Palette Preview</h3>
                            
                            {!selectedColor ? (
                              <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                                <p className="text-gray-500">
                                  Click on the image to select colors and build your palette
                                </p>
                              </div>
                            ) : (
                              <div className="space-y-4">
                                <div className="flex flex-wrap gap-2">
                                  <div 
                                    className="w-12 h-12 rounded-lg shadow-sm" 
                                    style={{ backgroundColor: selectedColor.hex }}
                                  />
                                  <div 
                                    className="w-12 h-12 rounded-lg shadow-sm" 
                                    style={{ backgroundColor: shiftHue(selectedColor, 30) }}
                                  />
                                  <div 
                                    className="w-12 h-12 rounded-lg shadow-sm" 
                                    style={{ backgroundColor: shiftHue(selectedColor, 60) }}
                                  />
                                  <div 
                                    className="w-12 h-12 rounded-lg shadow-sm" 
                                    style={{ backgroundColor: shiftHue(selectedColor, 180) }}
                                  />
                                  <div 
                                    className="w-12 h-12 rounded-lg shadow-sm" 
                                    style={{ backgroundColor: shiftHue(selectedColor, 210) }}
                                  />
                                </div>
                                
                                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                                  <div className="p-3 border-b border-gray-100">
                                    <h4 className="font-medium text-gray-800">Design Preview</h4>
                                  </div>
                                  
                                  <div className="p-4">
                                    <div 
                                      className="h-24 rounded-lg mb-3 flex items-center justify-center"
                                      style={{ backgroundColor: selectedColor.hex }}
                                    >
                                      <span className="text-white font-medium text-lg shadow-sm">
                                        Primary Color
                                      </span>
                                    </div>
                                    
                                    <div className="flex gap-2 mb-3">
                                      <div 
                                        className="flex-1 h-12 rounded-lg flex items-center justify-center" 
                                        style={{ backgroundColor: shiftHue(selectedColor, 30) }}
                                      >
                                        <span className="text-white text-sm">Secondary</span>
                                      </div>
                                      <div 
                                        className="flex-1 h-12 rounded-lg flex items-center justify-center" 
                                        style={{ backgroundColor: shiftHue(selectedColor, 210) }}
                                      >
                                        <span className="text-white text-sm">Accent</span>
                                      </div>
                                    </div>
                                    
                                    <div 
                                      className="p-3 rounded-lg"
                                      style={{ backgroundColor: lighten(selectedColor, 0.85) }}
                                    >
                                      <p 
                                        className="text-sm"
                                        style={{ color: darken(selectedColor, 0.8) }}
                                      >
                                        Sample text with your color scheme.
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Processing Status */}
              {processingState === 'uploading' && (
                <div className="bg-white rounded-lg p-6 shadow-md border border-gray-100">
                  <div className="flex items-center mb-3">
                    <RefreshCw size={18} className="text-cyan-500 animate-spin mr-2" />
                    <span className="text-gray-700 font-medium">Uploading image...</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-fuchsia-500 to-cyan-500 h-3 rounded-full transition-all duration-300" 
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <div className="mt-2 text-right text-sm text-gray-500">{uploadProgress}%</div>
                </div>
              )}
              
              {processingState === 'processing' && (
                <div className="bg-white rounded-lg p-6 shadow-md border border-gray-100 flex items-center">
                  <div className="mr-4 w-10 h-10 bg-gradient-to-r from-fuchsia-500 to-cyan-500 rounded-full flex items-center justify-center">
                    <RefreshCw size={18} className="text-white animate-spin" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800">Analyzing Image</h4>
                    <p className="text-gray-500 text-sm">Extracting colors and generating palette...</p>
                  </div>
                </div>
              )}
              
              {/* Enhanced Selected Color Display */}
              {selectedColor && processingState === 'complete' && (
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-md transition-all duration-300">
                  <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-fuchsia-50 to-cyan-50">
                    <h3 className="text-lg font-medium text-gray-800 mb-2 flex items-center gap-2">
                      <Pipette size={18} className="text-fuchsia-500" />
                      Selected Color
                    </h3>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="relative">
                      <div 
                        className="w-24 h-24 shrink-0" 
                        style={{ backgroundColor: selectedColor.hex }}
                      ></div>
                      <div 
                        className="absolute inset-0 z-10 border-2 border-r-0 border-white bg-gradient-to-r from-white to-transparent opacity-30"
                        style={{ width: '50%' }}
                      ></div>
                    </div>
                    
                    <div className="p-4 flex-1 relative">
                      {showTooltip && (
                        <div className="absolute -top-8 left-0 bg-green-100 text-green-800 text-xs rounded px-2 py-1 flex items-center gap-1 animate-fadeIn">
                          <Check size={12} />
                          Copied to clipboard!
                        </div>
                      )}
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col">
                          <span className="text-xs text-gray-500 mb-1">HEX</span>
                          <div className="flex items-center">
                            <span className="font-mono font-medium">{selectedColor.hex}</span>
                            <button 
                              onClick={() => copyToClipboard(selectedColor.hex)}
                              className="ml-2 text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-all group"
                              title="Copy HEX value"
                            >
                              <Copy size={14} className="group-hover:scale-110 transition-transform" />
                            </button>
                          </div>
                        </div>
                        
                        <div className="flex flex-col">
                          <span className="text-xs text-gray-500 mb-1">RGB</span>
                          <div className="flex items-center">
                            <span className="font-mono font-medium">{selectedColor.rgb}</span>
                            <button 
                              onClick={() => copyToClipboard(selectedColor.rgb)}
                              className="ml-2 text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-all group"
                              title="Copy RGB value"
                            >
                              <Copy size={14} className="group-hover:scale-110 transition-transform" />
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-3 flex gap-4">
                        <div className="flex flex-col items-center">
                          <span className="text-xs text-gray-500 mb-1">R</span>
                          <span className="font-medium bg-red-50 px-2 py-1 rounded w-12 text-center">{selectedColor.r}</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <span className="text-xs text-gray-500 mb-1">G</span>
                          <span className="font-medium bg-green-50 px-2 py-1 rounded w-12 text-center">{selectedColor.g}</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <span className="text-xs text-gray-500 mb-1">B</span>
                          <span className="font-medium bg-blue-50 px-2 py-1 rounded w-12 text-center">{selectedColor.b}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 justify-center sm:justify-between items-center">
                <button
                  onClick={handleRemove}
                  className="flex items-center gap-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all duration-300 hover:border-red-300 hover:text-red-500 group"
                >
                  <Trash2 size={16} className="group-hover:scale-110 transition-transform" />
                  <span>Remove Image</span>
                </button>
                
                <div className="flex gap-3">
                  <button 
                    onClick={() => setAdvancedExpanded(!advancedExpanded)}
                    className="flex items-center gap-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all duration-300"
                  >
                    <Settings size={16} className={`transition-transform duration-300 ${advancedExpanded ? 'rotate-90' : ''}`} />
                    <span>Advanced Options</span>
                  </button>
                  
                  <button 
                    onClick={handleExtractColors}
                    className="px-4 py-2 bg-gradient-to-r from-fuchsia-500 to-cyan-500 hover:from-fuchsia-600 hover:to-cyan-600 text-white font-medium rounded-lg transition-all duration-300 shadow hover:shadow-lg transform hover:-translate-y-0.5 flex items-center gap-2"
                  >
                    {processingState === 'processing' && (
                      <RefreshCw size={16} className="animate-spin" />
                    )}
                    <span>{processingState === 'processing' ? 'Processing...' : 'Extract Colors'}</span>
                  </button>
                </div>
              </div>
              
              {/* Advanced Options Panel */}
              {advancedExpanded && (
                <div className="mt-6 bg-gray-50 rounded-lg p-6 border border-gray-200 animate-expandDown">
                  <h3 className="text-lg font-medium text-gray-800 mb-4">Advanced Color Settings</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Color Algorithm</h4>
                      <select className="w-full p-2 border border-gray-300 rounded-md bg-white">
                        <option value="rgb">RGB Based</option>
                        <option value="hsv">HSV Based</option>
                        <option value="lab">LAB Color Space</option>
                      </select>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Color Count</h4>
                      <select className="w-full p-2 border border-gray-300 rounded-md bg-white">
                        <option value="3">3 Colors</option>
                        <option value="5" selected>5 Colors</option>
                        <option value="8">8 Colors</option>
                        <option value="12">12 Colors</option>
                      </select>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Vibrance Boost</h4>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        defaultValue="0"
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                      />
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Ignore Whites/Blacks</h4>
                      <div className="flex items-center gap-2">
                        <input type="checkbox" id="ignoreNeutrals" className="w-4 h-4 accent-fuchsia-500" />
                        <label htmlFor="ignoreNeutrals" className="text-sm text-gray-600">
                          Ignore neutral colors when extracting palette
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Floating Help Button */}
        <button
          className="fixed bottom-6 right-6 w-12 h-12 bg-gradient-to-r from-fuchsia-500 to-cyan-500 rounded-full flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
          title="Need help?"
        >
          <Info size={20} />
        </button>
      </div>
      
      {/* Custom Animation CSS */}
      <style jsx>{`
        @keyframes zoomPulse {
          0% { transform: scale(0.9); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        
        @keyframes blob {
          0% { transform: scale(1) translate(0px, 0px); }
          33% { transform: scale(1.1) translate(20px, -20px); }
          66% { transform: scale(0.9) translate(-20px, 20px); }
          100% { transform: scale(1) translate(0px, 0px); }
        }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        
        @keyframes fadeIn {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        
        @keyframes expandDown {
          0% { max-height: 0; opacity: 0; }
          100% { max-height: 500px; opacity: 1; }
        }
        
        .animate-blob {
          animation: blob 7s infinite ease-in-out;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 3s infinite ease-in-out;
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
        
        .animate-expandDown {
          animation: expandDown 0.5s ease-out forwards;
          overflow: hidden;
        }
        
        .zoom-transition {
          animation: zoomPulse 0.3s ease-out;
        }
      `}</style>
    </div>
  );
  
  // Helper functions for color manipulation
  function shiftHue(color, amount) {
    if (!color) return '#000000';
    
    // Convert RGB to HSL
    let r = color.r / 255;
    let g = color.g / 255;
    let b = color.b / 255;
    
    let max = Math.max(r, g, b);
    let min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    
    if (max === min) {
      h = s = 0; // achromatic
    } else {
      let d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      
      h /= 6;
    }
    
    // Shift hue
    h = (h * 360 + amount) % 360;
    if (h < 0) h += 360;
    h /= 360;
    
    // Convert back to RGB
    if (s === 0) {
      r = g = b = l; // achromatic
    } else {
      function hue2rgb(p, q, t) {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      }
      
      let q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      let p = 2 * l - q;
      
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }
    
    // Convert to hex
    return '#' + Math.round(r * 255).toString(16).padStart(2, '0') +
                 Math.round(g * 255).toString(16).padStart(2, '0') +
                 Math.round(b * 255).toString(16).padStart(2, '0');
  }
  
  function lighten(color, amount) {
    if (!color) return '#FFFFFF';
    
    // Convert hex to RGB
    const r = color.r;
    const g = color.g;
    const b = color.b;
    
    // Lighten by adding white (amount should be between 0 and 1)
    const newR = Math.min(255, r + (255 - r) * amount);
    const newG = Math.min(255, g + (255 - g) * amount);
    const newB = Math.min(255, b + (255 - b) * amount);
    
    // Convert back to hex
    return '#' + Math.round(newR).toString(16).padStart(2, '0') +
                 Math.round(newG).toString(16).padStart(2, '0') +
                 Math.round(newB).toString(16).padStart(2, '0');
  }
  
  function darken(color, amount) {
    if (!color) return '#000000';
    
    // Convert hex to RGB
    const r = color.r;
    const g = color.g;
    const b = color.b;
    
    // Darken by multiplying (amount should be between 0 and 1)
    const newR = Math.max(0, r * (1 - amount));
    const newG = Math.max(0, g * (1 - amount));
    const newB = Math.max(0, b * (1 - amount));
    
    // Convert back to hex
    return '#' + Math.round(newR).toString(16).padStart(2, '0') +
                 Math.round(newG).toString(16).padStart(2, '0') +
                 Math.round(newB).toString(16).padStart(2, '0');
  }
}