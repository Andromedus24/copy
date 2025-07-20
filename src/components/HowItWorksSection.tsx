const HowItWorksSection = () => {
  const steps = [
    {
      step: "01",
      title: "Upload your wardrobe or scan your closet",
      description: "Add your clothes to build your digital wardrobe. Our AI recognizes brands, colors, and styles automatically.",
      gradient: "from-primary/20 to-accent/20"
    },
    {
      step: "02", 
      title: "Post fits & tag your vibe",
      description: "Share your outfits with the community. Tag your mood, occasion, and style for better AI recommendations.",
      gradient: "from-accent/20 to-primary/20"
    },
    {
      step: "03",
      title: "Earn clout & get AI style boosts", 
      description: "Get likes, comments, and style points. Unlock exclusive challenges and receive personalized AI styling tips.",
      gradient: "from-primary/20 to-secondary/20"
    }
  ];

  return (
    <section id="how-it-works" className="py-20">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16 animate-fade-up">
          <h2 className="text-3xl md:text-5xl font-light tracking-tighter mb-4">
            How <span className="text-primary">Fitzty</span> Works
          </h2>
          <p className="text-lg font-light text-muted-foreground max-w-2xl mx-auto">
            Three simple steps to transform your style into social currency
          </p>
        </div>

        <div className="relative max-w-4xl mx-auto">
          {steps.map((step, index) => (
            <div 
              key={index} 
              className="flex flex-col lg:flex-row items-center gap-12 mb-16 last:mb-0 animate-fade-up"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              {/* Step Number */}
              <div className="flex-shrink-0 relative">
                <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${step.gradient} flex items-center justify-center glass border-2 border-border/40 shadow-glow`}>
                  <span className="text-3xl font-light tracking-tighter text-primary">
                    {step.step}
                  </span>
                </div>
                
                {/* Connector Line (except for last item) */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute left-1/2 top-24 w-px h-16 bg-gradient-to-b from-primary/30 to-transparent transform -translate-x-1/2" />
                )}
              </div>
              
              {/* Content */}
              <div className="flex-1 text-center lg:text-left">
                <h3 className="text-2xl lg:text-3xl font-light tracking-tight mb-4 text-foreground">
                  {step.title}
                </h3>
                <p className="text-lg text-muted-foreground font-light leading-relaxed max-w-2xl">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;