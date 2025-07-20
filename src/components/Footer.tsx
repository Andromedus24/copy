import { InstagramLogo, TiktokLogo, LinkedinLogo } from 'phosphor-react';

const Footer = () => {
  return (
    <footer className="py-12 border-t border-border/20">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Logo */}
          <div className="animate-fade-up">
            <h3 className="text-2xl font-bold tracking-tighter text-primary">
              Fitzty
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Your style. Your clout.
            </p>
          </div>

          {/* Contact */}
          <div className="text-center animate-fade-up" style={{ animationDelay: '0.1s' }}>
            <p className="text-sm text-muted-foreground">
              Questions? Reach us at{' '}
              <a 
                href="mailto:hello@fitzty.app" 
                className="text-primary hover:text-primary-glow transition-colors"
              >
                hello@fitzty.app
              </a>
            </p>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-6 animate-fade-up" style={{ animationDelay: '0.2s' }}>
            <a 
              href="https://instagram.com/fitzty.app" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-10 h-10 glass rounded-full flex items-center justify-center hover:shadow-glow transition-all hover:scale-110"
            >
              <InstagramLogo size={20} weight="light" className="text-primary" />
            </a>
            <a 
              href="https://tiktok.com/@fitzty.app" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-10 h-10 glass rounded-full flex items-center justify-center hover:shadow-glow transition-all hover:scale-110"
            >
              <TiktokLogo size={20} weight="light" className="text-primary" />
            </a>
            <a 
              href="https://linkedin.com/company/fitzty" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-10 h-10 glass rounded-full flex items-center justify-center hover:shadow-glow transition-all hover:scale-110"
            >
              <LinkedinLogo size={20} weight="light" className="text-primary" />
            </a>
          </div>
        </div>

        {/* Bottom section */}
        <div className="mt-8 pt-8 border-t border-border/20 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="animate-fade-up" style={{ animationDelay: '0.3s' }}>
            <p>&copy; 2024 Fitzty. All rights reserved.</p>
          </div>
          <div className="flex gap-6 animate-fade-up" style={{ animationDelay: '0.4s' }}>
            <a href="/terms" className="hover:text-primary transition-colors">
              Terms of Service
            </a>
            <a href="/privacy" className="hover:text-primary transition-colors">
              Privacy Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;