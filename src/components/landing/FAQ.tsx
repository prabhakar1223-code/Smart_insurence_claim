import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs: FAQItem[] = [
    {
      question: 'How long does it take to process a claim?',
      answer: 'Most claims are processed within 2-5 minutes using our AI-powered verification system. Complex claims that require manual review typically take 24-48 hours. You\'ll receive real-time updates throughout the entire process.'
    },
    {
      question: 'Is SmartClaim free to use?',
      answer: 'Yes! Filing claims through SmartClaim is completely free for policyholders. There are no hidden fees, subscription costs, or charges. Your insurance company covers the cost of our platform.'
    },
    {
      question: 'What types of insurance claims can I file?',
      answer: 'SmartClaim supports auto, home, health, life, and travel insurance claims. We work with over 500 insurance providers across multiple countries. If you\'re unsure, you can check compatibility during the sign-up process.'
    },
    {
      question: 'What happens if my claim is rejected?',
      answer: 'If your claim is rejected, you\'ll receive a detailed explanation of why and what steps you can take to appeal or resubmit. Our system also provides guidance on missing documents or policy coverage questions before submission to minimize rejections.'
    },

  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-16 lg:py-24 bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 lg:mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 border border-primary/20 rounded-full mb-4">
            <HelpCircle className="text-primary" size={32} />
          </div>
          <h2 className="mb-4 text-foreground">Frequently Asked Questions</h2>
          <p className="text-lg text-muted-foreground">
            Everything you need to know about SmartClaim. Can't find an answer? Chat with our team.
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-card border border-border rounded-lg shadow-card overflow-hidden transition-all hover:shadow-card-hover"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full flex items-center justify-between gap-4 p-6 text-left transition-colors hover:bg-muted/50"
              >
                <h4 className="flex-1 text-foreground">{faq.question}</h4>
                <ChevronDown
                  className={`text-primary transition-transform flex-shrink-0 ${openIndex === index ? 'rotate-180' : ''
                    }`}
                  size={24}
                />
              </button>

              <div
                className={`overflow-hidden transition-all duration-300 ${openIndex === index ? 'max-h-96' : 'max-h-0'
                  }`}
              >
                <div className="px-6 pb-6 pt-0">
                  <p className="text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Contact CTA */}
        <div className="mt-12 text-center">
          <div className="bg-card border border-border rounded-lg p-8 shadow-card">
            <h3 className="mb-2 text-foreground">Still have questions?</h3>
            <p className="text-muted-foreground mb-6">
              Our support team is here to help you 24/7
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-primary text-primary-foreground px-6 py-3 rounded-lg transition-all hover:opacity-90 active:scale-[0.98] w-full sm:w-auto">
                Start Live Chat
              </button>
              <button className="bg-secondary text-secondary-foreground px-6 py-3 rounded-lg transition-all hover:bg-muted active:scale-[0.98] border border-border w-full sm:w-auto">
                Email Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}