
import React, { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Brush, 
  Circle, 
  Eraser, 
  ArrowLeft, 
  ArrowRight, 
  CirclePlus,
  CircleMinus,
  Send,
  MessageCircle,
  MessageSquare
} from "lucide-react";

type Tool = "brush" | "eraser" | "circle";
type HistoryStep = ImageData;
type Layer = {
  id: string;
  name: string;
  visible: boolean;
  canvas: HTMLCanvasElement;
};

const DrawingApp = () => {
  // Canvas and drawing state
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const layersRef = useRef<Layer[]>([]);
  const [activeLayerIndex, setActiveLayerIndex] = useState(0);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<Tool>("brush");
  const [color, setColor] = useState("#FF5252");
  const [brushSize, setBrushSize] = useState(5);
  const [history, setHistory] = useState<HistoryStep[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [layers, setLayers] = useState<Layer[]>([]);
  const [showWelcome, setShowWelcome] = useState(true);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showLayersPanel, setShowLayersPanel] = useState(false);
  const [showToolSettings, setShowToolSettings] = useState(false);
  const startDrawingPointRef = useRef<{ x: number; y: number } | null>(null);
  
  // Welcome modal state
  const welcomeExamples = [
    "Landscape drawing with mountains and trees",
    "Portrait sketch of a person",
    "Abstract pattern with geometric shapes",
    "Simple logo design",
    "Cartoon character"
  ];

  // Initialize canvas and first layer
  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      
      const initialLayer = createLayer("Background Layer");
      layersRef.current = [initialLayer];
      setLayers([initialLayer]);
      
      saveToHistory();
    }
  }, []);

  // Create a new layer with a given name
  const createLayer = (name: string): Layer => {
    const canvas = document.createElement('canvas');
    if (canvasRef.current) {
      canvas.width = canvasRef.current.width;
      canvas.height = canvasRef.current.height;
    }
    return {
      id: Math.random().toString(36).substring(2),
      name,
      visible: true,
      canvas
    };
  };

  // Save current canvas state to history
  const saveToHistory = () => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const currentState = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    // If we're not at the end of history, remove future states
    if (historyIndex < history.length - 1) {
      setHistory(history.slice(0, historyIndex + 1));
    }
    
    setHistory(prev => [...prev, currentState]);
    setHistoryIndex(prev => prev + 1);
  };

  // Undo the last action
  const handleUndo = () => {
    if (historyIndex <= 0 || !canvasRef.current) return;
    
    const newIndex = historyIndex - 1;
    setHistoryIndex(newIndex);
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.putImageData(history[newIndex], 0, 0);
  };

  // Redo the previously undone action
  const handleRedo = () => {
    if (historyIndex >= history.length - 1 || !canvasRef.current) return;
    
    const newIndex = historyIndex + 1;
    setHistoryIndex(newIndex);
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.putImageData(history[newIndex], 0, 0);
  };

  // Clear the canvas completely
  const handleClearCanvas = () => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    saveToHistory();
  };

  // Add a new layer to the canvas
  const handleAddLayer = () => {
    const newLayer = createLayer(`Layer ${layers.length + 1}`);
    layersRef.current = [...layersRef.current, newLayer];
    setLayers(prev => [...prev, newLayer]);
    setActiveLayerIndex(layersRef.current.length - 1);
  };

  // Delete the currently active layer
  const handleDeleteLayer = (index: number) => {
    if (layers.length <= 1) return;
    
    const newLayers = [...layers];
    newLayers.splice(index, 1);
    layersRef.current = newLayers;
    setLayers(newLayers);
    
    // Adjust active layer index if needed
    if (activeLayerIndex >= newLayers.length) {
      setActiveLayerIndex(newLayers.length - 1);
    }
    
    renderCompositeLayers();
  };

  // Toggle layer visibility
  const toggleLayerVisibility = (index: number) => {
    const newLayers = [...layers];
    newLayers[index].visible = !newLayers[index].visible;
    layersRef.current = newLayers;
    setLayers(newLayers);
    
    renderCompositeLayers();
  };

  // Rename a layer
  const renameLayer = (index: number, newName: string) => {
    const newLayers = [...layers];
    newLayers[index].name = newName;
    layersRef.current = newLayers;
    setLayers(newLayers);
  };

  // Render all visible layers onto the main canvas
  const renderCompositeLayers = () => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    layers.forEach(layer => {
      if (layer.visible) {
        ctx.drawImage(layer.canvas, 0, 0);
      }
    });
  };

  // Start drawing on the canvas
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const activeLayer = layersRef.current[activeLayerIndex];
    const ctx = activeLayer.canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.beginPath();
    
    if (tool === "brush" || tool === "eraser") {
      ctx.moveTo(x, y);
      ctx.lineTo(x, y);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.lineWidth = brushSize;
      ctx.strokeStyle = tool === "brush" ? color : "#ffffff";
      ctx.stroke();
    } else if (tool === "circle") {
      // For circle, just store start point
      startDrawingPointRef.current = { x, y };
    }
    
    renderCompositeLayers();
  };

  // Continue drawing as the mouse moves
  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const activeLayer = layersRef.current[activeLayerIndex];
    const ctx = activeLayer.canvas.getContext('2d');
    if (!ctx) return;
    
    if (tool === "brush" || tool === "eraser") {
      ctx.lineTo(x, y);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.lineWidth = brushSize;
      ctx.strokeStyle = tool === "brush" ? color : "#ffffff";
      ctx.stroke();
    } else if (tool === "circle" && startDrawingPointRef.current) {
      // For circle, clear the layer and redraw
      const startPoint = startDrawingPointRef.current;
      const radius = Math.sqrt(
        Math.pow(x - startPoint.x, 2) + Math.pow(y - startPoint.y, 2)
      );
      
      // Clear only the active layer
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw circle
      ctx.beginPath();
      ctx.arc(startPoint.x, startPoint.y, radius, 0, 2 * Math.PI);
      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize;
      ctx.stroke();
    }
    
    renderCompositeLayers();
  };

  // Stop drawing when mouse is released
  const stopDrawing = () => {
    if (!isDrawing) return;
    
    const activeLayer = layersRef.current[activeLayerIndex];
    const ctx = activeLayer.canvas.getContext('2d');
    if (ctx) {
      ctx.closePath();
    }
    
    startDrawingPointRef.current = null;
    setIsDrawing(false);
    saveToHistory();
  };

  // Save the canvas as an image
  const saveAsImage = () => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const dataURL = canvas.toDataURL("image/png");
    
    const a = document.createElement("a");
    a.href = dataURL;
    a.download = "drawing.png";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Common colors for the color palette
  const commonColors = [
    "#000000", "#FFFFFF", "#FF5252", "#FF4081", "#E040FB", 
    "#7C4DFF", "#536DFE", "#448AFF", "#40C4FF", "#18FFFF", 
    "#64FFDA", "#69F0AE", "#B2FF59", "#EEFF41", "#FFFF00", 
    "#FFD740", "#FFAB40", "#FF6E40", "#8D6E63", "#BDBDBD"
  ];

  // Close welcome screen and start drawing
  const handleStartDrawing = () => {
    setShowWelcome(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* Navbar */}
      <nav className="w-full py-3 px-4 md:px-6 flex items-center justify-between border-b border-border">
        <div className="flex items-center space-x-2">
          <Brush className="text-accent h-6 w-6" />
          <h1 className="text-xl font-bold">Canvas Spark</h1>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={saveAsImage}
            className="px-3 py-1.5 rounded-md bg-accent text-accent-foreground hover:bg-accent/80 transition-colors"
          >
            Save Image
          </button>
        </div>
      </nav>

      {/* Main content area */}
      <main className="flex-grow flex flex-col md:flex-row">
        {/* Left sidebar for tools */}
        <div className="bg-muted p-4 flex flex-row md:flex-col justify-center md:justify-start items-center space-y-0 md:space-y-5 space-x-3 md:space-x-0">
          <button
            className={`tool-button ${tool === "brush" ? "active" : ""}`}
            onClick={() => setTool("brush")}
            title="Brush Tool"
          >
            <Brush className="h-5 w-5" />
          </button>
          <button
            className={`tool-button ${tool === "eraser" ? "active" : ""}`}
            onClick={() => setTool("eraser")}
            title="Eraser Tool"
          >
            <Eraser className="h-5 w-5" />
          </button>
          <button
            className={`tool-button ${tool === "circle" ? "active" : ""}`}
            onClick={() => setTool("circle")}
            title="Circle Tool"
          >
            <Circle className="h-5 w-5" />
          </button>
          
          <div className="my-3 border-b border-border w-8 md:w-full"></div>
          
          <button
            className="tool-button"
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            title="Undo"
          >
            <ArrowLeft className={`h-5 w-5 ${historyIndex <= 0 ? 'opacity-30' : ''}`} />
          </button>
          
          <button
            className="tool-button"
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            title="Redo"
          >
            <ArrowRight className={`h-5 w-5 ${historyIndex >= history.length - 1 ? 'opacity-30' : ''}`} />
          </button>

          <div className="my-3 border-b border-border w-8 md:w-full"></div>
          
          <div className="relative">
            <button
              className="tool-button flex items-center justify-center"
              onClick={() => setShowColorPicker(!showColorPicker)}
              title="Color Picker"
            >
              <div
                className="w-5 h-5 rounded-full"
                style={{ backgroundColor: color }}
              ></div>
            </button>
            
            {/* Color picker dropdown */}
            <AnimatePresence>
              {showColorPicker && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute left-full ml-3 bottom-0 z-10 bg-muted border border-border rounded-lg p-3 w-56"
                >
                  <div className="flex flex-wrap gap-2">
                    {commonColors.map((c) => (
                      <button
                        key={c}
                        className={`w-6 h-6 rounded-full border ${
                          color === c ? "border-white scale-110" : "border-gray-700"
                        }`}
                        style={{ backgroundColor: c }}
                        onClick={() => {
                          setColor(c);
                          setShowColorPicker(false);
                        }}
                      />
                    ))}
                  </div>
                  <div className="mt-4">
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="w-full h-8 cursor-pointer"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="relative">
            <button
              className="tool-button"
              onClick={() => setShowToolSettings(!showToolSettings)}
              title="Brush Settings"
            >
              <div className="flex flex-col items-center">
                <span className="text-xs font-semibold">{brushSize}</span>
                <span className="text-xs">px</span>
              </div>
            </button>
            
            {/* Brush settings */}
            <AnimatePresence>
              {showToolSettings && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute left-full ml-3 bottom-0 z-10 bg-muted border border-border rounded-lg p-3 w-48"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm">Brush Size: {brushSize}px</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      className="p-1 rounded hover:bg-accent/20"
                      onClick={() => setBrushSize((prev) => Math.max(1, prev - 1))}
                    >
                      <CircleMinus className="h-4 w-4" />
                    </button>
                    
                    <input
                      type="range"
                      min="1"
                      max="50"
                      value={brushSize}
                      onChange={(e) => setBrushSize(parseInt(e.target.value))}
                      className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-accent/30 [&::-webkit-slider-thumb]:slider-thumb [&::-moz-range-thumb]:slider-thumb"
                    />
                    
                    <button
                      className="p-1 rounded hover:bg-accent/20"
                      onClick={() => setBrushSize((prev) => Math.min(50, prev + 1))}
                    >
                      <CirclePlus className="h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <div className="my-3 border-b border-border w-8 md:w-full"></div>
          
          <button
            className="tool-button"
            onClick={() => setShowLayersPanel(!showLayersPanel)}
            title="Layers"
          >
            <MessageCircle className="h-5 w-5" />
          </button>
          
          <button
            className="tool-button"
            onClick={handleClearCanvas}
            title="Clear Canvas"
          >
            <MessageSquare className="h-5 w-5" />
          </button>
        </div>

        {/* Canvas area */}
        <div className="flex-grow flex items-center justify-center p-4">
          <div className="canvas-container w-full max-w-4xl aspect-video bg-canvas">
            <canvas
              ref={canvasRef}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              className="w-full h-full cursor-crosshair"
            />
          </div>
        </div>

        {/* Layers panel */}
        <AnimatePresence>
          {showLayersPanel && (
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.2 }}
              className="bg-muted border-l border-border w-64 p-4 absolute right-0 top-16 bottom-0 md:relative md:top-0"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium">Layers</h3>
                <button
                  onClick={handleAddLayer}
                  className="p-1.5 rounded-md hover:bg-accent/20"
                  title="Add Layer"
                >
                  <CirclePlus className="h-5 w-5" />
                </button>
              </div>
              
              <div className="space-y-2">
                {layers.map((layer, index) => (
                  <div
                    key={layer.id}
                    className={`p-2 rounded-md flex items-center space-x-2 cursor-pointer transition-colors ${
                      activeLayerIndex === index ? "bg-accent/20" : "hover:bg-accent/10"
                    }`}
                    onClick={() => setActiveLayerIndex(index)}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLayerVisibility(index);
                      }}
                      className={`w-4 h-4 rounded-sm border ${
                        layer.visible
                          ? "bg-accent border-accent"
                          : "bg-transparent border-border"
                      }`}
                    />
                    <input
                      className="bg-transparent flex-grow outline-none focus:border-b border-accent"
                      value={layer.name}
                      onChange={(e) => renameLayer(index, e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    {layers.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteLayer(index);
                        }}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Welcome modal overlay */}
      <AnimatePresence>
        {showWelcome && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-background rounded-lg p-6 max-w-lg w-full"
            >
              <div className="text-center mb-6">
                <Brush className="w-12 h-12 text-accent mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">Welcome to Canvas Spark</h2>
                <p className="text-muted-foreground">
                  Your digital canvas for creative expression
                </p>
              </div>
              
              <div className="mb-6">
                <h3 className="font-medium mb-3">What would you like to create?</h3>
                <div className="grid grid-cols-1 gap-2">
                  {welcomeExamples.map((example, index) => (
                    <button
                      key={index}
                      className="text-left p-3 rounded-md border border-border hover:bg-accent/10 transition-colors"
                      onClick={handleStartDrawing}
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="text-center">
                <button
                  onClick={handleStartDrawing}
                  className="px-5 py-2.5 rounded-md bg-accent text-accent-foreground hover:bg-accent/80 transition-colors flex items-center mx-auto"
                >
                  <span>Start Drawing</span>
                  <Send className="ml-2 h-4 w-4" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="py-3 px-6 border-t border-border">
        <div className="flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground">
          <p>© 2025 Canvas Spark. All rights reserved.</p>
          <div className="flex space-x-6 mt-2 md:mt-0">
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Help</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default DrawingApp;
