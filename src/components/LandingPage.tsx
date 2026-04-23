import React, { useState } from 'react';
import { Header } from './landing/Header';
import { Hero } from './landing/Hero';
import { ProblemSection } from './landing/ProblemSection';
import { HowItWorks } from './landing/HowItWorks';
import { Features } from './landing/Features';
import { Security } from './landing/Security';
import { FAQ } from './landing/FAQ';
import { Footer } from './landing/Footer';
import { ClaimInterface } from './user/ClaimInterface';

// Define the interface to accept the sign-in function from App.tsx
interface LandingPageProps {
  onSignIn?: () => void;
}

export function LandingPage({ onSignIn }: LandingPageProps) {
  const [showClaimInterface, setShowClaimInterface] = useState(false);

  // Check if user is authenticated (has JWT token)
  const isAuthenticated = () => {
    const token = localStorage.getItem('jwt_token');
    return !!token; // Returns true if token exists
  };

  const handleStartClaim = () => {
    if (isAuthenticated()) {
      // User is logged in, show claim interface
      setShowClaimInterface(true);
    } else {
      // User is not logged in, redirect to sign in
      if (onSignIn) {
        onSignIn();
      } else {
        // Fallback: show claim interface anyway (for demo)
        setShowClaimInterface(true);
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Pass the onSignIn function to the Header */}
      <Header
        onStartClaim={handleStartClaim}
        onSignIn={onSignIn}
      />
      <main>
        <Hero onStartClaim={handleStartClaim} />
        <ProblemSection />
        <HowItWorks />
        <Features />
        <Security />
        <FAQ />
      </main>
      <Footer />

      {showClaimInterface && (
        <ClaimInterface onClose={() => setShowClaimInterface(false)} />
      )}
    </div>
  );
}