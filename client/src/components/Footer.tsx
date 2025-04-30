import { Link } from 'wouter';
import { Facebook, Twitter, Instagram, Camera } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-100 border-t">
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <Camera className="text-primary mr-2" size={24} />
              <h3 className="text-xl font-bold font-poppins text-textColor">
                ImageEditorPro
              </h3>
            </div>
            <p className="text-gray-600 mb-4">
              Professional image editing tools right in your browser. No software installation required.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-primary">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary">
                <Instagram size={20} />
              </a>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-textColor mb-4">Tools</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-600 hover:text-primary">Resize Images</a></li>
              <li><a href="#" className="text-gray-600 hover:text-primary">Convert Format</a></li>
              <li><a href="#" className="text-gray-600 hover:text-primary">Remove Background</a></li>
              <li><a href="#" className="text-gray-600 hover:text-primary">Add Text & Watermarks</a></li>
              <li><a href="#" className="text-gray-600 hover:text-primary">Compress Images</a></li>
              <li><a href="#" className="text-gray-600 hover:text-primary">Face Blur</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-textColor mb-4">Resources</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-600 hover:text-primary">API Documentation</a></li>
              <li><a href="#" className="text-gray-600 hover:text-primary">Tutorials</a></li>
              <li><a href="#" className="text-gray-600 hover:text-primary">Blog</a></li>
              <li><a href="#" className="text-gray-600 hover:text-primary">Help Center</a></li>
              <li><a href="#" className="text-gray-600 hover:text-primary">Status</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-textColor mb-4">Company</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-600 hover:text-primary">About Us</a></li>
              <li><a href="#" className="text-gray-600 hover:text-primary">Pricing</a></li>
              <li><a href="#" className="text-gray-600 hover:text-primary">Terms of Service</a></li>
              <li><a href="#" className="text-gray-600 hover:text-primary">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-600 hover:text-primary">Contact Us</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t mt-8 pt-6 text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} ImageEditorPro. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
