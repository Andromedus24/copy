import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
// import heroMockup from '@/assets/hero-app-mockup.jpg';

const HeroSection = () => {
  const navigate = useNavigate();

  const goToAuth = () => {
    navigate('/auth');
  };

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-hero" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          <div className="animate-fade-up" style={{ animationDelay: '0.1s' }}>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-light tracking-tighter mb-6">
              <span className="block text-foreground">Your Style.</span>
              <span className="block bg-gradient-primary bg-clip-text text-transparent">
                Your Clout.
              </span>
            </h1>
          </div>
          
          <div className="animate-fade-up" style={{ animationDelay: '0.3s' }}>
            <p className="text-xl md:text-2xl font-light tracking-tight text-muted-foreground mb-12 max-w-2xl mx-auto">
              The Gen Z fashion network that transforms your wardrobe into social currency. 
              Express, connect, and earn clout with AI-powered style.
            </p>
          </div>

          <div className="animate-fade-up" style={{ animationDelay: '0.5s' }}>
            <Button 
              onClick={goToAuth}
              size="lg"
              className="glow-button text-lg px-12 py-6 rounded-2xl font-light tracking-tight"
            >
              Login / Sign Up
            </Button>
          </div>
        </div>

        {/* App Mockup */}
        <div className="animate-fade-up mt-20" style={{ animationDelay: '0.7s' }}>
          <div className="relative max-w-4xl mx-auto">
            <div className="glass rounded-3xl p-4 shadow-elevated border-2 border-border/30">
              {/* White placeholder image, same aspect ratio as before */}
              <div className="w-full rounded-2xl bg-white" style={{ aspectRatio: '16/9', minHeight: '200px' }} />
            </div>
            {/* Floating elements for extra flair */}
            <div className="absolute -top-6 -left-6 w-24 h-24 bg-primary/20 rounded-full blur-xl animate-pulse" />
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-accent/20 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }} />
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-muted-foreground/60 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-primary rounded-full mt-2 animate-pulse" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;