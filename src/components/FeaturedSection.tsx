const FeaturedSection = () => {
  const mediaLogos = [
    { name: 'Vogue', width: 'w-24' },
    { name: 'GQ', width: 'w-16' },
    { name: 'Complex', width: 'w-28' },
    { name: 'Hypebeast', width: 'w-32' },
    { name: 'Dazed', width: 'w-20' },
    { name: 'i-D', width: 'w-14' }
  ];

  return (
    <section className="py-20">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16 animate-fade-up">
          <p className="text-sm font-light tracking-wide text-muted-foreground uppercase mb-8">
            Featured in
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 opacity-60">
            {mediaLogos.map((logo, index) => (
              <div 
                key={logo.name}
                className={`${logo.width} h-8 glass rounded-lg flex items-center justify-center animate-fade-up border border-border/40 shadow-sm`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <span className="text-xs font-light tracking-wider text-muted-foreground">
                  {logo.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedSection;