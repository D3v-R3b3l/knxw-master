import React from 'react';
import { motion } from 'framer-motion';
import { Check, ChevronDown, Minus, Plus } from 'lucide-react';
import { createPageUrl } from '@/utils';

export default function FAQSection() {
  const [openIndex, setOpenIndex] = React.useState(null);

  const faqs = [
    {
      question: "How hard is setup?",
      answer: "One script install. Insights flow instantly. We provide SDKs for React, standard JS, and game engines."
    },
    {
      question: "Is data private?",
      answer: "SOC 2 certified, end-to-end encrypted, GDPR compliant. We prioritize user privacy and data sovereignty."
    },
    {
      question: "When do I see ROI?",
      answer: "Most customers see measurable lift within 30 days through improved engagement and conversion rates."
    }
  ];

  return (
    <section className="py-20 md:py-24 bg-black relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl md:text-5xl font-bold text-white mb-16 text-center"
        >
          Frequently Asked Questions
        </motion.h2>

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