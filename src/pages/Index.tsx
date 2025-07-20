import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import TestimonialsSection from '@/components/TestimonialsSection';
import HowItWorksSection from '@/components/HowItWorksSection';
import FeaturesSection from '@/components/FeaturesSection';
import MissionSection from '@/components/MissionSection';
import FAQSection from '@/components/FAQSection';
import Footer from '@/components/Footer';

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate('/feed');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    // Intersection Observer for scroll animations
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-up');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    const animateElements = document.querySelectorAll('.animate-fade-up');
    animateElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-background font-inter">
      <Header />
      <main>
        <HeroSection />
        <TestimonialsSection />
        <HowItWorksSection />
        <FeaturesSection />
        <MissionSection />
        <FAQSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
