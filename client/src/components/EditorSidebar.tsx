import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { 
  ImageOperation, 
  IMAGE_OPERATIONS 
} from '@shared/schema';

// Icons for tools
import { 
  Crop, 
  RotateCw, 
  Settings, 
  Filter, 
  Image, 
  FileType, 
  Type, 
  Scissors, 
  Droplets, 
  EyeOff
} from 'lucide-react';

interface EditorSidebarProps {
  activeOperation: ImageOperation | null;
  onSelectOperation: (operation: ImageOperation) => void;
}

interface ToolCategory {
  name: string;
  operations: ImageOperation[];
  icon: React.ReactNode;
}

const EditorSidebar = ({ 
  activeOperation, 
  onSelectOperation 
}: EditorSidebarProps) => {
  const [expandedCategories, setExpandedCategories] = useState<string[]>([
    'Image Adjustment', // Start with this category expanded
  ]);

  // Organize operations into categories
  const toolCategories: ToolCategory[] = [
    {
      name: 'Image Adjustment',
      operations: ['resize', 'rotate', 'crop'],
      icon: <Settings size={16} />,
    },
    {
      name: 'Image Effects',
      operations: ['adjustBrightness', 'adjustContrast', 'adjustSaturation'],
      icon: <Filter size={16} />,
    },
    {
      name: 'Format Conversion',
      operations: ['convert', 'compress'],
      icon: <FileType size={16} />,
    },
    {
      name: 'Advanced Tools',
      operations: ['removeBackground', 'blurFaces', 'addWatermark'],
      icon: <Scissors size={16} />,
    },
    {
      name: 'Add Content',
      operations: ['addText', 'addFrame'],
      icon: <Type size={16} />,
    },
  ];

  const toggleCategory = (category: string) => {
    if (expandedCategories.includes(category)) {
      setExpandedCategories(expandedCategories.filter(c => c !== category));
    } else {
      setExpandedCategories([...expandedCategories, category]);
    }
  };

  // Map operations to icons
  const operationIcons: Record<ImageOperation, React.ReactNode> = {
    resize: <Crop size={16} />,
    rotate: <RotateCw size={16} />,
    compress: <Image size={16} />,
    crop: <Crop size={16} />,
    addText: <Type size={16} />,
    addFrame: <Image size={16} />,
    removeBackground: <Scissors size={16} />,
    addWatermark: <Droplets size={16} />,
    blurFaces: <EyeOff size={16} />,
    adjustBrightness: <Settings size={16} />,
    adjustContrast: <Settings size={16} />,
    adjustSaturation: <Settings size={16} />,
    convert: <FileType size={16} />,
  };

  // Map operations to display names
  const operationNames: Record<ImageOperation, string> = {
    resize: 'Resize',
    rotate: 'Rotate & Flip',
    compress: 'Compress',
    crop: 'Crop',
    addText: 'Add Text',
    addFrame: 'Add Frame',
    removeBackground: 'Remove Background',
    addWatermark: 'Add Watermark',
    blurFaces: 'Blur Faces',
    adjustBrightness: 'Brightness',
    adjustContrast: 'Contrast',
    adjustSaturation: 'Saturation',
    convert: 'Convert Format',
  };

  return (
    <div className="md:w-64 bg-gray-50 p-4 border-r overflow-y-auto h-[calc(100vh-250px)]">
      <h3 className="font-medium text-textColor mb-3">Tools</h3>
      <div className="space-y-1">
        {toolCategories.map((category) => (
          <div className="mb-4" key={category.name}>
            <button 
              className={`flex items-center justify-between w-full text-left py-2 px-3 rounded ${
                expandedCategories.includes(category.name) 
                  ? 'bg-blue-50 text-primary font-medium' 
                  : 'hover:bg-blue-50 text-gray-700 font-medium'
              }`}
              onClick={() => toggleCategory(category.name)}
            >
              <span className="flex items-center">
                {category.icon}
                <span className="ml-2">{category.name}</span>
              </span>
              {expandedCategories.includes(category.name) ? (
                <ChevronDown size={16} />
              ) : (
                <ChevronRight size={16} />
              )}
            </button>
            
            {expandedCategories.includes(category.name) && (
              <div className="pl-2 mt-1 space-y-1">
                {category.operations.map((operation) => (
                  <button 
                    key={operation}
                    className={`flex items-center w-full text-left py-1 px-3 rounded ${
                      activeOperation === operation 
                        ? 'bg-primary text-white' 
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                    onClick={() => onSelectOperation(operation)}
                  >
                    {operationIcons[operation]}
                    <span className="ml-2">{operationNames[operation]}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default EditorSidebar;
