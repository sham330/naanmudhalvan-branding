import { useState, useEffect } from 'react';
import { Palette } from 'lucide-react';

export default function Hero() {
  const [isHovered, setIsHovered] = useState(false);
  const [floatingCircles, setFloatingCircles] = useState([]);
  
  useEffect(() => {
    // Create random floating circles with bright colors
    const circles = [];
    const brightColors = [
      'bg-pink-400', 'bg-purple-400', 'bg-blue-400', 
      'bg-green-400', 'bg-yellow-400', 'bg-red-400', 
      'bg-indigo-400', 'bg-teal-400', 'bg-cyan-400',
      'bg-emerald-400', 'bg-lime-400', 'bg-amber-400'
    ];
    
    for (let i = 0; i < 20; i++) {
      circles.push({
        id: i,
        color: brightColors[Math.floor(Math.random() * brightColors.length)],
        size: Math.floor(Math.random() * 10) + 5,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        delay: `${Math.random() * 5}s`,
        duration: `${Math.random() * 10 + 10}s`
      });
    }
    
    setFloatingCircles(circles);
  }, []);

  return (
    <div className="relative min-h-screen bg-white flex flex-col items-center justify-center overflow-hidden">
      {/* Animated Background Elements */}
      {floatingCircles.map((circle) => (
        <div
          key={circle.id}
          className={`absolute rounded-full opacity-40 ${circle.color}`}
          style={{
            width: `${circle.size}px`,
            height: `${circle.size}px`,
            left: circle.left,
            top: circle.top,
            animation: `float ${circle.duration} ease-in-out infinite`,
            animationDelay: circle.delay,
            filter: 'blur(1px)'
          }}
        />
      ))}
      
      {/* 3D Rotating Color Wheel */}
      <div className="absolute w-64 h-64 animate-spin-slow opacity-20">
        <div className="absolute w-full h-full rounded-full border-8 border-rainbow animate-pulse" />
        <div className="absolute w-full h-full rounded-full border-4 border-rainbow transform rotate-45 animate-pulse" />
        <div className="absolute w-full h-full rounded-full border-2 border-rainbow transform rotate-90 animate-pulse" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center">
        <h1 className="md:text-5xl font-bold mb-6 tracking-wide text-4xl">
          <span className="text-cyan-500">C</span>
          <span className="text-fuchsia-500">o</span>
          <span className="text-yellow-500">l</span>
          <span className="text-green-500">o</span>
          <span className="text-orange-500">r</span>
          <span className="text-gray-800 ml-2">Palette</span>
          <span className="text-gray-800 ml-2">Generator</span>
        </h1>
        
        <p className="text-lg text-gray-600 mb-10 max-w-lg mx-auto">
          Upload an image and instantly generate beautiful color palettes that match your style
        </p>
        
        {/* 3D Button with Animation */}
        <div 
          className="group relative pl-[170px]" 
          style={{ perspective: '500px' }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <button 
          onClick={() => {
            document.getElementById("image")?.scrollIntoView({ behavior: "smooth" });
          }}
            className={`
              flex items-center justify-center gap-2
              text-xl font-bold px-8 py-4 rounded-lg
              bg-gradient-to-r from-fuchsia-500 to-cyan-500
              text-white shadow-lg
              transform transition-all duration-300
              ${isHovered ? 'scale-110 shadow-xl' : ''}
              hover:from-cyan-500 hover:to-fuchsia-500
              active:scale-95
            `}
          >
            <Palette size={24} className={`transition-all duration-300 ${isHovered ? 'animate-bounce' : ''}`} />
            Generate
          </button>
          
          {/* Button Glow Effect */}
          <div className="absolute w-full h-4 bg-gradient-to-r from-fuchsia-200 to-cyan-200 rounded-full blur-md transform -translate-y-2 opacity-60"></div>
        </div>
        
        <p className="text-sm text-gray-500 mt-6">
          Discover the perfect color scheme for your next project
        </p>
      </div>
      
      {/* Bright Accent Elements */}
      <div className="absolute top-10 left-10 w-20 h-20 rounded-full bg-gradient-to-r from-yellow-300 to-amber-300 opacity-20 blur-md animate-pulse"></div>
      <div className="absolute bottom-10 right-10 w-16 h-16 rounded-full bg-gradient-to-r from-green-300 to-emerald-300 opacity-20 blur-md animate-pulse"></div>
      <div className="absolute top-20 right-20 w-12 h-12 rounded-full bg-gradient-to-r from-cyan-300 to-blue-300 opacity-20 blur-md animate-pulse"></div>
      
      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-fuchsia-500 via-cyan-500 to-fuchsia-500"></div>
      
      {/* CSS Animations - Moved to style element */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes float {
            0%, 100% {
              transform: translateY(0) rotate(0deg);
            }
            50% {
              transform: translateY(-20px) rotate(10deg);
            }
          }
          
          .animate-spin-slow {
            animation: spin 20s linear infinite;
          }
          
          @keyframes spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
          
          .border-rainbow {
            border-image-slice: 1;
            border-image-source: linear-gradient(to right, #ff00ff, #00ffff, #ffff00, #00ff00, #ff8800, #ff0088);
          }
        `
      }} />
    </div>
  );
}