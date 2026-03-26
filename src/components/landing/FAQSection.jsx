import React, { useState } from 'react';
import { Minus, Plus } from 'lucide-react';

export default function FAQSection() {
  const [openIndex, setOpenIndex] = React.useState(null);

  const faqs = [
    {
      question: "How does knXw infer psychographic state?",
      answer: "knXw interprets behavioral signals such as navigation patterns, hesitation, completion behavior, and interaction sequences to estimate motivation, cognitive style, and decision friction. The goal is runtime decision context, not a static personality label."
    },
    {
      question: "What data does knXw use?",
      answer: "knXw uses product interaction and behavioral telemetry captured through instrumentation. Teams control what they send, how it is mapped, and where it is activated."
    },
    {
      question: "How is adaptation governed?",
      answer: "knXw is designed so adaptation remains visible, reviewable, and constrainable. Teams can inspect intervention logic, trace why changes were made, and define acceptable operational boundaries."
    },
    {
      question: "What is deterministic versus AI-driven?",
      answer: "Some system behavior can be rule-driven and explicitly configured, while some inference layers use probabilistic or AI-assisted interpretation. The platform is intended to make that distinction visible rather than opaque."
    },
    {
      question: "How difficult is integration?",
      answer: "Teams can start with instrumentation and APIs, then add adaptive UI behaviors through the SDK. Integration effort depends on how deeply you want experience changes wired into your product, but the initial path is designed to be incremental."
    },
    {
      question: "How is privacy handled?",
      answer: "The platform includes encrypted data handling, privacy controls, and product-level governance patterns. Teams remain responsible for configuring data collection and usage to match their legal and operational requirements."
    },
    {
      question: "How quickly can teams measure value?",
      answer: "Time-to-value depends on traffic, instrumentation quality, and how many adaptive flows are activated. Most teams should expect an initial learning period before they can evaluate which interventions improve product outcomes."
    }
  ];

  return (
    <section className="py-20 md:py-24 bg-black relative overflow-hidden">
      {/* Parallax Background */}
      <div data-parallax-bg className="absolute inset-0 h-[130%] -top-[15%]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(6,182,212,0.05),transparent_50%)]" />
        <div className="absolute top-1/3 left-1/3 w-64 h-64 bg-cyan-500/4 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/3 w-56 h-56 bg-purple-500/4 rounded-full blur-[80px]" />
      </div>
      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-16 text-center">
          Frequently Asked Questions
        </h2>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div 
              key={i}
              className="border border-white/10 rounded-2xl bg-white/5 overflow-hidden hover:bg-white/10 transition-colors"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between p-6 text-left"
              >
                <span className="text-lg font-medium text-white">{faq.question}</span>
                {openIndex === i ? (
                  <Minus className="w-5 h-5 text-cyan-400" />
                ) : (
                  <Plus className="w-5 h-5 text-gray-400" />
                )}
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${openIndex === i ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
              >
                <p className="p-6 pt-0 text-gray-400 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}