import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

const WaitlistSection = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter your email address to join the waitlist.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "You're in! 🎉",
      description: "Welcome to the Fitzty waitlist. We'll notify you when early access opens.",
    });
    
    setEmail('');
    setIsSubmitting(false);
  };

  return (
    <section id="waitlist" className="py-20">
      <div className="container mx-auto px-6">
        <div className="max-w-2xl mx-auto text-center">
          <div className="animate-fade-up">
            <h2 className="text-3xl md:text-5xl font-light tracking-tighter mb-6">
              Ready to Transform Your <span className="text-primary">Style</span>?
            </h2>
            <p className="text-lg font-light text-muted-foreground mb-12">
              Join thousands of Gen Z fashion enthusiasts on the waitlist. 
              Be the first to experience the future of style expression.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="glass border-border/40 font-light"
                disabled={isSubmitting}
              />
              <Button 
                type="submit"
                className="glow-button font-light px-8"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Joining...' : 'Join Waitlist'}
              </Button>
            </form>

            <p className="text-sm text-muted-foreground mt-6">
              No spam, ever. Just the latest updates and early access perks.
            </p>
          </div>

          {/* Floating decoration */}
          <div className="relative mt-16">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 bg-primary/10 rounded-full blur-xl animate-pulse" />
            </div>
            <div className="relative z-10 text-6xl animate-bounce" style={{ animationDelay: '0.5s' }}>
              ✨
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WaitlistSection;