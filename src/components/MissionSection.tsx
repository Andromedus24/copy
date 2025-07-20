import fashionLifestyle from '@/assets/fashion-lifestyle.jpg';

const MissionSection = () => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <div className="animate-fade-up">
              <h2 className="text-3xl md:text-5xl font-light tracking-tighter mb-6">
                Our <span className="text-primary">Mission</span>
              </h2>
              <div className="space-y-6 text-lg font-light text-muted-foreground leading-relaxed">
                <p>
                  We built Fitzty to empower Gen Z to express their real style, 
                  earn real clout, and connect with fashion-forward communities—both online and IRL.
                </p>
                <p>
                  Fashion isn't just about clothes. It's about identity, confidence, 
                  and belonging to something bigger than yourself. Fitzty bridges the gap 
                  between your personal style and the communities that celebrate it.
                </p>
                <p className="text-primary font-medium">
                  Your style. Your story. Your time to shine.
                </p>
              </div>
            </div>

            {/* Image */}
            <div className="animate-fade-up lg:order-first" style={{ animationDelay: '0.2s' }}>
              <div className="relative">
                <div className="glass rounded-3xl p-4 border-2 border-border/30 shadow-card">
                  <img 
                    src={fashionLifestyle} 
                    alt="Fashion Community" 
                    className="w-full rounded-2xl"
                  />
                </div>
                {/* Decorative elements */}
                <div className="absolute -top-4 -left-4 w-20 h-20 bg-primary/20 rounded-full blur-xl animate-pulse" />
                <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-accent/20 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MissionSection;