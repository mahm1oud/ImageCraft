import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

const PremiumFeatures = () => {
  return (
    <section className="mb-12">
      <div className="bg-gradient-to-r from-primary to-blue-700 rounded-xl text-white p-8 max-w-4xl mx-auto">
        <h2 className="text-2xl font-semibold font-poppins mb-4 text-center">
          Upgrade to Premium
        </h2>
        <p className="text-center mb-8 max-w-2xl mx-auto">
          Unlock advanced features, remove watermarks, and get priority processing for all your images.
        </p>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-sm rounded-lg p-6">
            <h3 className="text-xl font-medium mb-4">Premium Features</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <CheckCircle className="text-accent mr-2 flex-shrink-0" size={20} />
                <span>Process up to 100 images at once</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="text-accent mr-2 flex-shrink-0" size={20} />
                <span>Advanced background removal with edge refinement</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="text-accent mr-2 flex-shrink-0" size={20} />
                <span>Face recognition and AI-powered enhancements</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="text-accent mr-2 flex-shrink-0" size={20} />
                <span>Premium templates and design assets</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="text-accent mr-2 flex-shrink-0" size={20} />
                <span>Priority processing and customer support</span>
              </li>
            </ul>
          </div>
          <div className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-sm rounded-lg p-6">
            <h3 className="text-xl font-medium mb-4">API Access</h3>
            <p className="mb-4">
              Integrate our powerful image processing capabilities directly into your applications.
            </p>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start">
                <CheckCircle className="text-accent mr-2 flex-shrink-0" size={20} />
                <span>RESTful API with comprehensive documentation</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="text-accent mr-2 flex-shrink-0" size={20} />
                <span>SDKs for popular programming languages</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="text-accent mr-2 flex-shrink-0" size={20} />
                <span>Webhook notifications for processing completion</span>
              </li>
            </ul>
            <a href="#" className="text-accent hover:text-white transition font-medium">
              Learn more about our API →
            </a>
          </div>
        </div>
        
        <div className="text-center mt-8">
          <Button className="bg-accent hover:bg-orange-600 text-white px-8 py-6 rounded-lg font-medium text-lg">
            Get Premium Access
          </Button>
        </div>
      </div>
    </section>
  );
};

export default PremiumFeatures;
