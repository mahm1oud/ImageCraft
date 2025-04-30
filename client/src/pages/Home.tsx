import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import DragDropUpload from '@/components/DragDropUpload';
import ToolGrid from '@/components/ToolGrid';
import FormatSupport from '@/components/FormatSupport';
import PremiumFeatures from '@/components/PremiumFeatures';
import HowItWorks from '@/components/HowItWorks';
import { Upload, PlayCircle, Lock, CloudOff, Gauge, Monitor } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Home = () => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelected = async (file: File) => {
    try {
      setIsUploading(true);
      
      // In a real implementation, you would upload the file to the server here
      // For now, we'll simulate a successful upload and navigate to the editor
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Store the file in sessionStorage (just the filename for now, in a real app we'd store a reference)
      sessionStorage.setItem('editingFile', file.name);
      
      // Navigate to the editor
      navigate('/editor');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: "There was an error uploading your image. Please try again."
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleUploadClick = () => {
    // Scroll to upload section
    const uploadSection = document.getElementById('upload-section');
    if (uploadSection) {
      uploadSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Welcome section */}
      <section id="welcome-section" className="mb-12">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold font-poppins text-textColor mb-4">
            Transform Your Images with <span className="text-primary">Powerful Tools</span>
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Edit, convert, and enhance your images with our comprehensive suite of tools. 
            No software installation required.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button 
              className="bg-primary text-white px-6 py-6 rounded-lg font-medium hover:bg-blue-600 flex items-center"
              onClick={handleUploadClick}
            >
              <Upload className="mr-2" size={20} />
              Upload Image
            </Button>
            <Button 
              variant="outline"
              className="border-primary text-primary px-6 py-6 rounded-lg font-medium hover:bg-blue-50 flex items-center"
            >
              <PlayCircle className="mr-2" size={20} />
              See How It Works
            </Button>
          </div>
        </div>
      </section>

      {/* Upload Section */}
      <section id="upload-section" className="mb-12 transition-all duration-300">
        <Card className="max-w-4xl mx-auto">
          <CardContent className="p-6">
            <h2 className="text-2xl font-semibold font-poppins text-textColor mb-4">
              Upload Your Image
            </h2>
            
            <DragDropUpload 
              onFileSelected={handleFileSelected}
              maxSize={50}
            />
            
            <div className="flex flex-wrap justify-between text-center">
              <div className="w-1/2 md:w-1/4 p-2">
                <div className="bg-blue-50 rounded-lg p-4">
                  <Lock className="text-primary mx-auto" size={24} />
                  <p className="text-sm mt-2">Secure Processing</p>
                </div>
              </div>
              <div className="w-1/2 md:w-1/4 p-2">
                <div className="bg-blue-50 rounded-lg p-4">
                  <CloudOff className="text-primary mx-auto" size={24} />
                  <p className="text-sm mt-2">No Cloud Storage</p>
                </div>
              </div>
              <div className="w-1/2 md:w-1/4 p-2">
                <div className="bg-blue-50 rounded-lg p-4">
                  <Gauge className="text-primary mx-auto" size={24} />
                  <p className="text-sm mt-2">Fast Processing</p>
                </div>
              </div>
              <div className="w-1/2 md:w-1/4 p-2">
                <div className="bg-blue-50 rounded-lg p-4">
                  <Monitor className="text-primary mx-auto" size={24} />
                  <p className="text-sm mt-2">All Platforms</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Tools Grid */}
      <ToolGrid />

      {/* Format Support */}
      <FormatSupport />

      {/* Premium Features */}
      <PremiumFeatures />

      {/* How It Works */}
      <HowItWorks />
    </div>
  );
};

export default Home;
