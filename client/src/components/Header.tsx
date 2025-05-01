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
        <Link href="/" className="flex items-center cursor-pointer">
          <Camera className="text-primary text-3xl mr-2" />
          <h1 className="text-2xl font-bold font-poppins text-textColor">
            Image<span className="text-primary">Editor</span>Pro
          </h1>
        </Link>

        <nav className="hidden md:flex space-x-6">
          <Link href="/" className={`font-medium ${location === '/' ? 'text-primary' : 'text-textColor hover:text-primary'} transition`}>
            Tools
          </Link>
          <Link href="/pricing" className={`font-medium ${location === '/pricing' ? 'text-primary' : 'text-textColor hover:text-primary'} transition`}>
            Pricing
          </Link>
          <Link href="/api" className={`font-medium ${location === '/api' ? 'text-primary' : 'text-textColor hover:text-primary'} transition`}>
            API
          </Link>
          <Link href="/help" className={`font-medium ${location === '/help' ? 'text-primary' : 'text-textColor hover:text-primary'} transition`}>
            Help
          </Link>
        </nav>

        <div className="flex items-center">
          <Link href="/login" className="hidden md:block text-primary hover:text-blue-700 font-medium mr-4 transition">
            Login
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
                <Link href="/" className="font-medium text-textColor hover:text-primary transition py-2">
                  Tools
                </Link>
                <Link href="/pricing" className="font-medium text-textColor hover:text-primary transition py-2">
                  Pricing
                </Link>
                <Link href="/api" className="font-medium text-textColor hover:text-primary transition py-2">
                  API
                </Link>
                <Link href="/help" className="font-medium text-textColor hover:text-primary transition py-2">
                  Help
                </Link>
                <hr className="border-gray-200" />
                <Link href="/login" className="font-medium text-primary hover:text-blue-700 transition py-2">
                  Login
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
