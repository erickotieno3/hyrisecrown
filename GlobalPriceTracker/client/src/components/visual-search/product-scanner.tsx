import React, { useState, useRef } from 'react';
import { Camera, Scan, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export interface IdentifiedProduct {
  name: string;
  brand: string;
  category: string;
  attributes: Record<string, string>;
  confidence: number;
}

export interface SimilarProduct {
  id: number;
  name: string;
  brand: string;
  imageUrl: string;
  price?: number;
  store?: string;
  currency?: string;
}

interface VisualSearchProps {
  onResultsFound: (identifiedProduct: IdentifiedProduct, similarProducts: SimilarProduct[]) => void;
}

export function ProductScanner({ onResultsFound }: VisualSearchProps) {
  const [isCapturing, setIsCapturing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [captureMethod, setCaptureMethod] = useState<'camera' | 'upload' | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  const startCapture = async (method: 'camera' | 'upload') => {
    setCaptureMethod(method);
    
    if (method === 'camera') {
      setIsCapturing(true);
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: { ideal: 'environment' } }
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        toast({
          title: 'Camera Access Failed',
          description: 'Unable to access your camera. Please check permissions.',
          variant: 'destructive',
        });
        setIsCapturing(false);
        setCaptureMethod(null);
      }
    } else if (method === 'upload') {
      fileInputRef.current?.click();
    }
  };

  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw the current video frame to the canvas
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convert canvas to image URL
      const imageUrl = canvas.toDataURL('image/jpeg');
      setPreviewUrl(imageUrl);
      
      // Stop the camera stream
      const stream = video.srcObject as MediaStream;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      
      setIsCapturing(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const resetCapture = () => {
    setPreviewUrl(null);
    setCaptureMethod(null);
    setIsCapturing(false);
    
    // Stop any active camera stream
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const analyzeImage = async () => {
    if (!previewUrl) return;
    
    setIsProcessing(true);
    
    try {
      // Convert the data URL to a Blob
      const fetchResponse = await fetch(previewUrl);
      const blob = await fetchResponse.blob();
      
      // Create a File object from the Blob
      const file = new File([blob], 'product-image.jpg', { type: 'image/jpeg' });
      
      // Create a FormData object and append the file
      const formData = new FormData();
      formData.append('productImage', file);
      
      // Send the image to the server for analysis
      const response = await fetch('/api/ai/visual-search', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        onResultsFound(data.identifiedProduct, data.similarProducts);
        toast({
          title: 'Product Identified',
          description: `Found: ${data.identifiedProduct.name}`,
        });
      } else {
        toast({
          title: 'Analysis Failed',
          description: data.error || 'Unable to identify product. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error analyzing image:', error);
      toast({
        title: 'Analysis Failed',
        description: 'An error occurred while analyzing the image. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="w-full max-w-xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Scan className="mr-2 h-5 w-5" />
          Product Scanner
        </CardTitle>
        <CardDescription>
          Take a photo or upload an image of a product to find similar items
        </CardDescription>
      </CardHeader>
      <Separator />
      <CardContent className="pt-6">
        {isCapturing ? (
          <div className="flex flex-col items-center">
            <div className="relative w-full aspect-square bg-black rounded-md overflow-hidden mb-4">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex gap-4">
              <Button onClick={captureImage} variant="default">
                <Camera className="mr-2 h-4 w-4" />
                Capture
              </Button>
              <Button onClick={resetCapture} variant="outline">
                Cancel
              </Button>
            </div>
          </div>
        ) : previewUrl ? (
          <div className="flex flex-col items-center">
            <div className="relative w-full aspect-square bg-gray-100 rounded-md overflow-hidden mb-4">
              <img 
                src={previewUrl} 
                alt="Product preview" 
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex gap-4">
              {isProcessing ? (
                <Button disabled variant="default">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </Button>
              ) : (
                <Button onClick={analyzeImage} variant="default">
                  <Scan className="mr-2 h-4 w-4" />
                  Analyze
                </Button>
              )}
              <Button onClick={resetCapture} variant="outline">
                Reset
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col space-y-4">
            <Button 
              onClick={() => startCapture('camera')} 
              variant="outline" 
              className="h-24"
            >
              <Camera className="mr-2 h-5 w-5" />
              Take a Photo
            </Button>
            <Button 
              onClick={() => startCapture('upload')} 
              variant="outline" 
              className="h-24"
            >
              <Upload className="mr-2 h-5 w-5" />
              Upload Image
            </Button>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleFileChange}
            />
          </div>
        )}
      </CardContent>
      
      {/* Hidden canvas for image capture */}
      <canvas ref={canvasRef} className="hidden" />
    </Card>
  );
}