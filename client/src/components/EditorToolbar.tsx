import { 
  ArrowLeft, 
  Undo, 
  RotateCcw, 
  Check, 
  Download 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Link } from 'wouter';
import { IMAGE_FORMATS } from '@shared/schema';
import { capitalize } from '@/lib/utils';

interface EditorToolbarProps {
  filename: string;
  canUndo: boolean;
  outputFormat: string;
  onUndo: () => void;
  onReset: () => void;
  onApply: () => void;
  onFormatChange: (format: string) => void;
  onQualityChange: (quality: string) => void;
  onDownload: () => void;
  isPending: boolean;
  isApplied: boolean;
}

const EditorToolbar = ({
  filename,
  canUndo,
  outputFormat,
  onUndo,
  onReset,
  onApply,
  onFormatChange,
  onQualityChange,
  onDownload,
  isPending,
  isApplied
}: EditorToolbarProps) => {
  return (
    <>
      {/* Editor Header */}
      <div className="bg-gray-100 p-4 border-b flex justify-between items-center">
        <div className="flex items-center">
          <Link href="/">
            <Button variant="ghost" className="mr-2">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <h2 className="text-xl font-semibold font-poppins text-textColor">
            Editing: <span>{filename}</span>
          </h2>
        </div>
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            className="flex items-center" 
            onClick={onUndo}
            disabled={!canUndo}
          >
            <Undo className="w-4 h-4 mr-1" />
            Undo
          </Button>
          <Button 
            variant="outline" 
            className="flex items-center" 
            onClick={onReset}
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            Reset
          </Button>
          <Button 
            className="bg-secondary text-white hover:bg-green-600 flex items-center"
            onClick={onApply}
            disabled={isPending || isApplied}
          >
            <Check className="w-4 h-4 mr-1" />
            {isPending ? 'Processing...' : 'Apply'}
          </Button>
        </div>
      </div>

      {/* Editor Footer */}
      <div className="bg-gray-100 p-4 border-t flex justify-between items-center">
        <div className="flex items-center">
          <span className="text-sm text-gray-600">Output format:</span>
          <Select value={outputFormat} onValueChange={onFormatChange}>
            <SelectTrigger className="ml-2 w-24">
              <SelectValue placeholder="Format" />
            </SelectTrigger>
            <SelectContent>
              {IMAGE_FORMATS.map((format) => (
                <SelectItem key={format} value={format}>
                  {format.toUpperCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select defaultValue="high" onValueChange={onQualityChange}>
            <SelectTrigger className="ml-2 w-48">
              <SelectValue placeholder="Quality" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="max">Best quality</SelectItem>
              <SelectItem value="high">High quality</SelectItem>
              <SelectItem value="medium">Medium quality</SelectItem>
              <SelectItem value="low">Low quality (smaller file)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button 
          className="bg-accent text-white hover:bg-orange-600 flex items-center"
          onClick={onDownload}
          disabled={!isApplied}
        >
          <Download className="w-4 h-4 mr-2" />
          Download
        </Button>
      </div>
    </>
  );
};

export default EditorToolbar;
