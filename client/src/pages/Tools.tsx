import { Link } from 'wouter';
import { 
  Crop, 
  RotateCw, 
  Image, 
  FileType, 
  Scissors, 
  EyeOff, 
  Type, 
  Filter,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Tool {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: 'basic' | 'advanced' | 'convert' | 'premium';
}

const Tools = () => {
  const tools: Tool[] = [
    {
      id: 'resize',
      name: 'Resize Image',
      description: 'Change dimensions while preserving quality',
      icon: <Crop className="text-primary text-5xl" />,
      category: 'basic'
    },
    {
      id: 'convert',
      name: 'Convert Format',
      description: 'Change format (PNG, JPG, WEBP, etc.)',
      icon: <FileType className="text-primary text-5xl" />,
      category: 'convert'
    },
    {
      id: 'adjust',
      name: 'Adjust Image',
      description: 'Modify brightness, contrast & more',
      icon: <Filter className="text-primary text-5xl" />,
      category: 'basic'
    },
    {
      id: 'crop',
      name: 'Crop Image',
      description: 'Trim and frame your image perfectly',
      icon: <Crop className="text-primary text-5xl" />,
      category: 'basic'
    },
    {
      id: 'remove-bg',
      name: 'Remove Background',
      description: 'Extract subject from background',
      icon: <Scissors className="text-primary text-5xl" />,
      category: 'premium'
    },
    {
      id: 'blur-faces',
      name: 'Face Blur',
      description: 'Automatically detect & blur faces',
      icon: <EyeOff className="text-primary text-5xl" />,
      category: 'premium'
    },
    {
      id: 'add-text',
      name: 'Add Text',
      description: 'Overlay text with custom fonts',
      icon: <Type className="text-primary text-5xl" />,
      category: 'advanced'
    },
    {
      id: 'filters',
      name: 'Image Filters',
      description: 'Apply artistic filters and effects',
      icon: <Filter className="text-primary text-5xl" />,
      category: 'advanced'
    },
    {
      id: 'rotate',
      name: 'Rotate Image',
      description: 'Rotate or flip your image',
      icon: <RotateCw className="text-primary text-5xl" />,
      category: 'basic'
    },
    {
      id: 'compress',
      name: 'Compress Image',
      description: 'Reduce file size while maintaining quality',
      icon: <Image className="text-primary text-5xl" />,
      category: 'basic'
    },
    {
      id: 'jpg-to-png',
      name: 'JPG to PNG',
      description: 'Convert JPG images to PNG format',
      icon: <FileType className="text-primary text-5xl" />,
      category: 'convert'
    },
    {
      id: 'png-to-jpg',
      name: 'PNG to JPG',
      description: 'Convert PNG images to JPG format',
      icon: <FileType className="text-primary text-5xl" />,
      category: 'convert'
    },
    {
      id: 'to-webp',
      name: 'Convert to WebP',
      description: 'Convert images to WebP format',
      icon: <FileType className="text-primary text-5xl" />,
      category: 'convert'
    },
    {
      id: 'to-tiff',
      name: 'Convert to TIFF',
      description: 'Convert images to TIFF format',
      icon: <FileType className="text-primary text-5xl" />,
      category: 'convert'
    },
    {
      id: 'to-svg',
      name: 'Convert to SVG',
      description: 'Convert images to SVG format (premium)',
      icon: <FileType className="text-primary text-5xl" />,
      category: 'premium'
    },
    {
      id: 'meme-generator',
      name: 'Meme Generator',
      description: 'Create memes with custom text',
      icon: <Type className="text-primary text-5xl" />,
      category: 'advanced'
    },
  ];

  const categories = [
    { id: 'all', name: 'All Tools' },
    { id: 'basic', name: 'Basic Editing' },
    { id: 'convert', name: 'Convert Formats' },
    { id: 'advanced', name: 'Advanced Editing' },
    { id: 'premium', name: 'Premium Tools' },
  ];

  const filteredTools = (category: string) => {
    if (category === 'all') return tools;
    return tools.filter(tool => tool.category === category);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <Link href="/" className="mr-4">
          <Button variant="outline" className="flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>
        <h1 className="text-3xl font-bold font-poppins text-textColor">
          All <span className="text-primary">Tools</span>
        </h1>
      </div>

      <div className="mb-8">
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <button 
              key={category.id}
              className="px-4 py-2 rounded-full bg-gray-100 text-gray-800 hover:bg-primary hover:text-white transition-colors"
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {tools.map((tool) => (
          <Link key={tool.id} href={`/tools/${tool.id}`}>
            <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden cursor-pointer h-full flex flex-col">
              <div className="h-40 bg-blue-50 flex items-center justify-center">
                {tool.icon}
              </div>
              <div className="p-4 flex flex-col flex-1">
                <h3 className="font-medium text-textColor mb-1">{tool.name}</h3>
                <p className="text-sm text-gray-500 mb-4">{tool.description}</p>
                <div className="mt-auto">
                  {tool.category === 'premium' ? (
                    <span className="text-xs font-medium px-2 py-1 bg-amber-100 text-amber-700 rounded-full">Premium</span>
                  ) : null}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Tools;