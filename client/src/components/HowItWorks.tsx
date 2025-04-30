import { Upload, Edit, Download } from 'lucide-react';

const HowItWorks = () => {
  return (
    <section className="mb-12 max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold font-poppins text-textColor mb-8 text-center">
        How It Works
      </h2>
      
      <div className="grid md:grid-cols-3 gap-8">
        <div className="text-center">
          <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Upload className="text-primary" size={32} />
          </div>
          <h3 className="text-lg font-medium text-textColor mb-2">1. Upload</h3>
          <p className="text-gray-600">
            Drag & drop or select your image file in any supported format.
          </p>
        </div>
        <div className="text-center">
          <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Edit className="text-primary" size={32} />
          </div>
          <h3 className="text-lg font-medium text-textColor mb-2">2. Edit</h3>
          <p className="text-gray-600">
            Use our powerful tools to modify your image with real-time preview.
          </p>
        </div>
        <div className="text-center">
          <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Download className="text-primary" size={32} />
          </div>
          <h3 className="text-lg font-medium text-textColor mb-2">3. Download</h3>
          <p className="text-gray-600">
            Save your edited image in your preferred format and quality.
          </p>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
