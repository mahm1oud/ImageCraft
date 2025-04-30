import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { 
  Camera, 
  Menu 
} from 'lucide-react';

const Header = () => {
  const [location] = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/">
          <div className="flex items-center cursor-pointer">
            <Camera className="text-primary text-3xl mr-2" />
            <h1 className="text-2xl font-bold font-poppins text-textColor">
              Image<span className="text-primary">Editor</span>Pro
            </h1>
          </div>
        </Link>

        <nav className="hidden md:flex space-x-6">
          <Link href="/">
            <a className={`font-medium ${location === '/' ? 'text-primary' : 'text-textColor hover:text-primary'} transition`}>
              Tools
            </a>
          </Link>
          <Link href="/pricing">
            <a className={`font-medium ${location === '/pricing' ? 'text-primary' : 'text-textColor hover:text-primary'} transition`}>
              Pricing
            </a>
          </Link>
          <Link href="/api">
            <a className={`font-medium ${location === '/api' ? 'text-primary' : 'text-textColor hover:text-primary'} transition`}>
              API
            </a>
          </Link>
          <Link href="/help">
            <a className={`font-medium ${location === '/help' ? 'text-primary' : 'text-textColor hover:text-primary'} transition`}>
              Help
            </a>
          </Link>
        </nav>

        <div className="flex items-center">
          <Link href="/login">
            <a className="hidden md:block text-primary hover:text-blue-700 font-medium mr-4 transition">
              Login
            </a>
          </Link>
          <Button className="bg-primary hover:bg-blue-600 text-white">
            Sign Up
          </Button>

          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" className="md:hidden ml-4 p-1">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <div className="flex flex-col space-y-4 pt-10">
                <Link href="/">
                  <a className="font-medium text-textColor hover:text-primary transition py-2">
                    Tools
                  </a>
                </Link>
                <Link href="/pricing">
                  <a className="font-medium text-textColor hover:text-primary transition py-2">
                    Pricing
                  </a>
                </Link>
                <Link href="/api">
                  <a className="font-medium text-textColor hover:text-primary transition py-2">
                    API
                  </a>
                </Link>
                <Link href="/help">
                  <a className="font-medium text-textColor hover:text-primary transition py-2">
                    Help
                  </a>
                </Link>
                <hr className="border-gray-200" />
                <Link href="/login">
                  <a className="font-medium text-primary hover:text-blue-700 transition py-2">
                    Login
                  </a>
                </Link>
                <Button className="bg-primary hover:bg-blue-600 text-white w-full">
                  Sign Up
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;
