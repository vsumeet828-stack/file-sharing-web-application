import React from 'react';
import { motion } from 'framer-motion';
import { Check, Zap, Star, Shield, HelpCircle, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';

const pricingLevels = [
  {
    name: 'Starter',
    price: '$0',
    description: 'Perfect for casual sharing',
    features: [
      '5GB Cloud Storage',
      'Instant WiFi Transfer',
      'Real-time P2P Sharing',
      'Basic File Previews',
      'Community Support',
    ],
    buttonText: 'Current Plan',
    highlight: false,
  },
  {
    name: 'Professional',
    price: '$12',
    description: 'For power users and creators',
    features: [
      '500GB Cloud Storage',
      'Multi-device Auto-sync',
      'Expiring Share Links',
      'End-to-End Encryption',
      'Priority Email Support',
      'Advanced Analytics',
    ],
    buttonText: 'Upgrade to Pro',
    highlight: true,
  },
  {
    name: 'Enterprise',
    price: '$49',
    description: 'Advanced features for teams',
    features: [
      '5TB Cloud Storage',
      'Custom Team Workspaces',
      'Admin Control Panel',
      'Dedicated Account Manager',
      'API Access',
      'SSO Integration',
    ],
    buttonText: 'Contact Sales',
    highlight: false,
  },
];

export default function PricingPage() {
  const [activeFaq, setActiveFaq] = React.useState<number | null>(null);

  const pricingLevels = [
    {
      name: 'Starter',
      price: '$0',
      description: 'Perfect for casual sharing',
      features: [
        '5GB Cloud Storage',
        'Instant WiFi Transfer',
        'Real-time P2P Sharing',
        'Basic File Previews',
        'Community Support',
      ],
      buttonText: 'Current Plan',
      highlight: false,
    },
    {
      name: 'Professional',
      price: '$12',
      description: 'For power users and creators',
      features: [
        '500GB Cloud Storage',
        'Multi-device Auto-sync',
        'Expiring Share Links',
        'End-to-End Encryption',
        'Priority Email Support',
        'Advanced Analytics',
      ],
      buttonText: 'Upgrade to Pro',
      highlight: true,
    },
    {
      name: 'Enterprise',
      price: '$49',
      description: 'Advanced features for teams',
      features: [
        '5TB Cloud Storage',
        'Custom Team Workspaces',
        'Admin Control Panel',
        'Dedicated Account Manager',
        'API Access',
        'SSO Integration',
      ],
      buttonText: 'Contact Sales',
      highlight: false,
    },
  ];

  return (
    <div className="pt-40 pb-32 px-4 relative bg-white">
      {/* Background decoration */}
      <div className="absolute top-0 inset-x-0 h-[800px] bg-gradient-to-b from-primary/5 to-transparent -z-0 pointer-events-none" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-24 max-w-3xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-black mb-8 text-slate-900 tracking-tight"
          >
            Choose your <span className="text-gradient">Storage</span>
          </motion.h1>
          <p className="text-slate-500 text-xl font-medium leading-relaxed">
            Transparent pricing for individuals and teams. Scale your library as you grow. No hidden fees.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-10 mb-40">
          {pricingLevels.map((plan, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              className={`premium-card relative flex flex-col p-12 transition-all duration-500 ${
                plan.highlight 
                  ? 'border-primary/20 shadow-2xl shadow-primary/10 scale-[1.05] z-10 bg-white' 
                  : 'bg-white/80 backdrop-blur-md'
              }`}
            >
              {plan.highlight && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-white text-[10px] font-black uppercase tracking-[0.2em] px-6 py-2.5 rounded-full shadow-xl shadow-primary/20">
                  Most Popular
                </div>
              )}

              <div className="mb-10">
                <h3 className="text-3xl font-black mb-3 text-slate-900 tracking-tight">{plan.name}</h3>
                <p className="text-slate-400 font-medium text-sm mb-10 leading-relaxed">{plan.description}</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-6xl font-black text-slate-900 leading-none">{plan.price}</span>
                  <span className="text-slate-400 font-bold uppercase tracking-widest text-xs">/ month</span>
                </div>
              </div>

              <div className="space-y-5 mb-12 flex-grow">
                {plan.features.map((feature, j) => (
                  <div key={j} className="flex items-center gap-4 group">
                    <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary transition-colors duration-300">
                      <Check size={14} className="text-primary group-hover:text-white transition-colors duration-300" />
                    </div>
                    <span className="text-sm font-bold text-slate-600 transition-colors group-hover:text-slate-900">{feature}</span>
                  </div>
                ))}
              </div>

              <button
                className={`w-full py-5 rounded-[2rem] font-black uppercase tracking-widest text-xs transition-all duration-300 ${
                  plan.highlight
                    ? 'btn-primary shadow-2xl shadow-primary/20 hover:scale-[1.03]'
                    : 'bg-gray-100 text-slate-600 hover:bg-primary hover:text-white border border-black/[0.02]'
                }`}
              >
                {plan.buttonText}
              </button>
            </motion.div>
          ))}
        </div>

        {/* FAQ Section */}
        <section className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Need help?</h2>
            <p className="text-slate-500 font-medium">Everything you need to know about DropX plans.</p>
          </div>
          
          <div className="space-y-6">
            {[
              {
                q: "What's the difference between local share and cloud storage?",
                a: "Local share uses your WiFi network to send files directly between devices without counting against your storage quota. Cloud storage uploads your files to our secure servers so they're accessible from anywhere."
              },
              {
                q: "Is there a limit on file size for users?",
                a: "Free users can upload files up to 5GB in size. Professional and Enterprise users have no individual file size limits, restricted only by their total storage quota."
              },
              {
                q: "How secure is my data at rest?",
                a: "All files are encrypted using AES-256 military-grade encryption before being stored on our distributed network. Your privacy is our absolute priority."
              }
            ].map((faq, i) => (
              <div 
                key={i} 
                className={`premium-card !p-0 overflow-hidden cursor-pointer group border transition-all duration-500 ${
                  activeFaq === i ? 'border-primary/20 bg-primary/5' : 'border-black/[0.03]'
                }`}
                onClick={() => setActiveFaq(activeFaq === i ? null : i)}
              >
                <div className="p-8 flex items-center justify-between">
                  <h4 className={`text-lg font-bold transition-colors ${activeFaq === i ? 'text-primary' : 'text-slate-900 group-hover:text-primary'}`}>{faq.q}</h4>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 ${activeFaq === i ? 'bg-primary text-white rotate-180' : 'bg-gray-100 text-slate-400 group-hover:bg-primary/10'}`}>
                    <ChevronDown size={18} />
                  </div>
                </div>
                <motion.div 
                  initial={false}
                  animate={{ 
                    height: activeFaq === i ? 'auto' : 0,
                    opacity: activeFaq === i ? 1 : 0
                  }}
                  className="overflow-hidden"
                >
                  <p className="px-8 pb-8 text-slate-500 font-medium leading-relaxed max-w-3xl">
                    {faq.a}
                  </p>
                </motion.div>
              </div>
            ))}
          </div>

          <div className="mt-20 p-12 bg-slate-900 rounded-[3rem] text-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(110,168,254,0.15),transparent)] pointer-events-none" />
            <h3 className="text-2xl font-black text-white mb-4 relative z-10 tracking-tight">Have more questions?</h3>
            <p className="text-slate-400 font-medium mb-10 relative z-10 max-w-md mx-auto">Our specialized support team is ready to help you with any technical or billing inquiry.</p>
            <button className="px-10 py-4 bg-white text-slate-950 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:scale-105 transition-all relative z-10 shadow-xl shadow-white/5 active:scale-95">
              Contact Support
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
