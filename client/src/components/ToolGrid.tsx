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
  ArrowRight
} from 'lucide-react';

interface Tool {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
}

const ToolGrid = () => {
  const tools: Tool[] = [
    {
      id: 'resize',
      name: 'Resize',
      description: 'Change dimensions while preserving quality',
      icon: <Crop className="text-primary text-5xl" />,
    },
    {
      id: 'convert',
      name: 'Convert',
      description: 'Change format (PNG, JPG, WEBP, etc.)',
      icon: <FileType className="text-primary text-5xl" />,
    },
    {
      id: 'adjust',
      name: 'Adjust',
      description: 'Modify brightness, contrast & more',
      icon: <Filter className="text-primary text-5xl" />,
    },
    {
      id: 'crop',
      name: 'Crop',
      description: 'Trim and frame your image perfectly',
      icon: <Crop className="text-primary text-5xl" />,
    },
    {
      id: 'remove-bg',
      name: 'Remove Background',
      description: 'Extract subject from background',
      icon: <Scissors className="text-primary text-5xl" />,
    },
    {
      id: 'blur-faces',
      name: 'Face Blur',
      description: 'Automatically detect & blur faces',
      icon: <EyeOff className="text-primary text-5xl" />,
    },
    {
      id: 'add-text',
      name: 'Add Text',
      description: 'Overlay text with custom fonts',
      icon: <Type className="text-primary text-5xl" />,
    },
    {
      id: 'filters',
      name: 'Filters',
      description: 'Apply artistic filters and effects',
      icon: <Filter className="text-primary text-5xl" />,
    },
  ];

  return (
    <section className="mb-12">
      <h2 className="text-2xl font-semibold font-poppins text-textColor mb-6 text-center">
        Powerful Tools at Your Fingertips
      </h2>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
        {tools.map((tool) => (
          <Link key={tool.id} href={`/tools/${tool.id}`}>
            <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden cursor-pointer">
              <div className="h-32 bg-blue-50 flex items-center justify-center">
                {tool.icon}
              </div>
              <div className="p-4">
                <h3 className="font-medium text-textColor mb-1">{tool.name}</h3>
                <p className="text-sm text-gray-500">{tool.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
      
      <div className="text-center">
        <Link href="/tools" className="text-primary hover:underline font-medium flex items-center justify-center">
          View all 20+ tools
          <ArrowRight className="ml-1" size={16} />
        </Link>
      </div>
    </section>
  );
};

export default ToolGrid;
