import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: "Is Fitzty free to use?",
      answer: "Yes! Fitzty is free to download and use. We offer premium features for power users who want to unlock advanced AI styling, exclusive challenges, and priority brand partnerships."
    },
    {
      question: "Do I need to upload my full closet?",
      answer: "Not at all! You can start with just a few pieces. Our AI learns your style preferences over time and gets better at suggesting combinations. The more you use it, the smarter it gets."
    },
    {
      question: "When does the app launch?",
      answer: "We're launching in early 2024! Login or sign up to get exclusive early access, plus special beta user perks when we go live."
    },
    {
      question: "How does the StyleMap work?",
      answer: "StyleMap uses geo-tagging to show you trending styles in your area. Discover what's popular locally, find fashion events, and connect with creators near you who share your aesthetic."
    }
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-20">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16 animate-fade-up">
          <h2 className="text-3xl md:text-5xl font-light tracking-tighter mb-4">
            Frequently Asked <span className="text-primary">Questions</span>
          </h2>
          <p className="text-lg font-light text-muted-foreground max-w-2xl mx-auto">
            Everything you need to know about Fitzty
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index}
              className="glass rounded-2xl overflow-hidden animate-fade-up shadow-card border-2 border-border/30"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full p-6 text-left flex items-center justify-between hover:bg-white/5 transition-colors"
              >
                <h3 className="text-lg font-light tracking-tight text-foreground pr-4">
                  {faq.question}
                </h3>
                <div className="flex-shrink-0">
                  {openIndex === index ? (
                    <Minus className="w-5 h-5 text-primary" />
                  ) : (
                    <Plus className="w-5 h-5 text-primary" />
                  )}
                </div>
              </button>
              
              <div 
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === index ? 'max-h-48 pb-6' : 'max-h-0'
                }`}
              >
                <div className="px-6">
                  <p className="text-muted-foreground font-light leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;