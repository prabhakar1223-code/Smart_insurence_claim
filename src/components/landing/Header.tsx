import React, { useState, useEffect } from 'react';
import { Shield, Menu, X } from 'lucide-react';

interface HeaderProps {
  onStartClaim: () => void;
  onSignIn?: () => void; // <--- Added this prop
}

export function Header({ onStartClaim, onSignIn }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <header 
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-card/95 backdrop-blur-md shadow-card-elevated border-b border-border' 
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer">
            <div className="bg-primary p-2 rounded-lg">
              <Shield className="text-primary-foreground" size={24} />
            </div>
            <span className="text-lg text-foreground">SmartClaim AI</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            <button 
              onClick={() => scrollToSection('how-it-works')}
              className="text-foreground hover:text-primary transition-colors"
            >
              How It Works
            </button>
            <button 
              onClick={() => scrollToSection('features')}
              className="text-foreground hover:text-primary transition-colors"
            >
              Features
            </button>
            <button 
              onClick={() => scrollToSection('security')}
              className="text-foreground hover:text-primary transition-colors"
            >
              Security
            </button>
            <button 
              onClick={() => scrollToSection('faq')}
              className="text-foreground hover:text-primary transition-colors"
            >
              FAQ
            </button>
          </nav>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-4">
            <button 
              onClick={onSignIn} // <--- Connected to onSignIn
              className="text-foreground hover:text-primary transition-colors px-4 py-2"
            >
              Sign In
            </button>
            <button 
              onClick={onStartClaim}
              className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg transition-all hover:opacity-90 active:scale-[0.98]"
            >
              Start Claim
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="lg:hidden p-2 hover:bg-muted rounded-lg transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} className="text-foreground" /> : <Menu size={24} className="text-foreground" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-border">
            <nav className="flex flex-col gap-4">
              <button 
                onClick={() => scrollToSection('how-it-works')}
                className="text-foreground hover:text-primary transition-colors text-left px-4 py-2 hover:bg-muted rounded-lg"
              >
                How It Works
              </button>
              <button 
                onClick={() => scrollToSection('features')}
                className="text-foreground hover:text-primary transition-colors text-left px-4 py-2 hover:bg-muted rounded-lg"
              >
                Features
              </button>
              <button 
                onClick={() => scrollToSection('security')}
                className="text-foreground hover:text-primary transition-colors text-left px-4 py-2 hover:bg-muted rounded-lg"
              >
                Security
              </button>
              <button 
                onClick={() => scrollToSection('faq')}
                className="text-foreground hover:text-primary transition-colors text-left px-4 py-2 hover:bg-muted rounded-lg"
              >
                FAQ
              </button>
              <div className="border-t border-border pt-4 px-4 flex flex-col gap-3">
                <button 
                  onClick={() => {
                    if (onSignIn) onSignIn(); // <--- Connected to onSignIn
                    setIsMobileMenuOpen(false); // Close menu after clicking
                  }}
                  className="text-foreground hover:text-primary transition-colors text-left"
                >
                  Sign In
                </button>
                <button 
                  onClick={() => {
                    onStartClaim();
                    setIsMobileMenuOpen(false);
                  }}
                  className="bg-primary text-primary-foreground px-6 py-3 rounded-lg transition-all hover:opacity-90 active:scale-[0.98] w-full"
                >
                  Start Claim
                </button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}