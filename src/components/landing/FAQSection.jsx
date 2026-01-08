import React from 'react';
import { motion } from 'framer-motion';
import { Check, ChevronDown, Minus, Plus } from 'lucide-react';
import { createPageUrl } from '@/utils';
import KineticText from '@/components/landing/KineticText';

export default function FAQSection() {
  const [openIndex, setOpenIndex] = React.useState(null);

  const faqs = [
    {
      question: "How hard is setup?",
      answer: "One script install. Insights flow instantly. We provide SDKs for React, standard JS, and game engines."
    },
    {
      question: "Is data private?",
      answer: "We take data privacy seriously. All data is encrypted in transit and at rest. We are GDPR-ready and do not sell or share your data with third parties. You maintain full control and ownership of your data, with the ability to export or delete it at any time."
    },
    {
      question: "When do I see ROI?",
      answer: "Most customers see measurable lift within 30 days through improved engagement and conversion rates."
    }
  ];

  return (
    <section className="py-20 md:py-24 bg-black relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white">
            <KineticText trigger="inView" staggerDelay={0.04} duration={0.7} y={80}>
              Frequently Asked Questions
            </KineticText>
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
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
              <motion.div
                initial={false}
                animate={{ height: openIndex === i ? 'auto' : 0, opacity: openIndex === i ? 1 : 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <p className="p-6 pt-0 text-gray-400 leading-relaxed">
                  {faq.answer}
                </p>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}