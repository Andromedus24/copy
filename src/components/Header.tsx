import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMenuOpen(false);
    }
  };

  const navLinks = [
    { label: 'How it works', id: 'how-it-works' },
    { label: 'Features', id: 'features' },
    { label: 'FAQ', id: 'faq' }
  ];

  return (
    <>
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? 'blur-nav border-b border-border/40 shadow-lg' : 'blur-nav border-b border-border/30'
        }`}
      >
        <div className="container mx-auto px-6 py-4">
          <nav className="flex items-center justify-between">
            <button 
              onClick={() => scrollToSection('hero')}
              className="text-2xl font-bold tracking-tighter text-primary"
            >
              Fitzty
            </button>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => scrollToSection(link.id)}
                  className="text-sm font-light tracking-tight text-muted-foreground hover:text-primary transition-colors"
                >
                  {link.label}
                </button>
              ))}
              <Button 
                onClick={() => navigate('/auth')}
                variant="outline" 
                className="glow-button font-light border-primary text-primary hover:text-primary hover:border-primary"
              >
                Login / Sign Up
              </Button>
            </div>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6 text-primary" />
              ) : (
                <Menu className="w-6 h-6 text-primary" />
              )}
            </button>
          </nav>
        </div>
      </header>

      {/* Mobile Menu Tray */}
      <div 
        className={`fixed inset-0 z-40 md:hidden transition-all duration-300 ${
          isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
             onClick={() => setIsMenuOpen(false)} 
        />
        <div 
          className={`absolute right-0 top-0 h-full w-80 glass border-l border-border/40 transform transition-transform duration-300 ${
            isMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="p-8 mt-20">
            <div className="space-y-6">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => scrollToSection(link.id)}
                  className="block text-lg font-light tracking-tight text-foreground hover:text-primary transition-colors"
                >
                  {link.label}
                </button>
              ))}
              <Button 
                onClick={() => {
                  navigate('/auth');
                  setIsMenuOpen(false);
                }}
                className="w-full glow-button font-light mt-8 border-primary text-primary hover:text-primary hover:border-primary"
              >
                Login / Sign Up
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;