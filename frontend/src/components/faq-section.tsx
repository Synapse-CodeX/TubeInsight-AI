
import { useState } from "react";
import { ChevronDown } from "lucide-react";

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: "What's included in the Standard plan?",
      answer: "The Standard plan includes access to free templates, the ability to remix links with prompts, and community updates. It's perfect for getting started with our platform at no cost."
    },
    {
      question: "How does the Premium plan billing work?",
      answer: "Premium plan billing is flexible - you can choose monthly at $9.99/mo or yearly at $4.99/mo (50% savings). You get unlimited templates & sections, priority support, new weekly drops, and early access exclusives."
    },
    {
      question: "Can I upgrade or downgrade my plan anytime?",
      answer: "Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle, and we'll prorate any differences accordingly."
    },
    {
      question: "What is tubeinsight.com and how does it work with Lovable?",
      answer: "Tubeinsight.com is our platform that seamlessly integrates with Lovable to provide you with premium templates and design resources. It enhances your Lovable experience by offering professionally crafted components and layouts."
    },
    {
      question: "How can I use uilens.com to speed up my design process?",
      answer: "Unlike Framer where you have to design from scratch, with our handmade templates, you can ask AI to customize your site without the hassle of drag and drop. This streamlines your workflow and gets you to your final design much faster."
    }
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="w-full bg-black px-4 md:px-16 py-14 md:py-28 overflow-hidden">
      <div className="w-full max-w-[1280px] mx-auto flex flex-col gap-12 md:gap-20">
        <div className="flex flex-col lg:flex-row gap-12 md:gap-20">
          {/* Left Column - Header */}
          <div className="w-full lg:w-[500px] flex flex-col gap-8">
            <div className="flex flex-col gap-6">
              <h2 className="text-white text-3xl md:text-5xl font-normal leading-tight md:leading-[48px]">
                FAQs
              </h2>
              <p className="text-white text-base font-normal leading-6">
                We are here to help you with any questions you may have. If you don't find what you need, please contact us at
              </p>
            </div>
            <div className="flex items-center gap-6">
              <a 
                href="mailto:support@tubeinsight.com" 
                className="text-white text-base font-normal leading-6 hover:text-gray-300 transition-colors"
              >
                support@tubeinsight.com
              </a>
            </div>
          </div>

          {/* Right Column - FAQ Items */}
          <div className="flex-1 flex flex-col">
            {faqs.map((faq, index) => (
              <div key={index} className="flex flex-col border-t border-[#1F2228]">
                <button
                  onClick={() => toggleFAQ(index)}
                  className="flex items-center justify-between gap-6 py-5 text-left hover:bg-[#0A0A0A] transition-colors duration-200"
                >
                  <h3 className="flex-1 text-white text-lg md:text-xl font-normal leading-7">
                    {faq.question}
                  </h3>
                  <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
                    <ChevronDown 
                      className={`w-4 h-4 text-white transition-transform duration-200 ${
                        openIndex === index ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </button>
                
                {openIndex === index && (
                  <div className="pb-6 animate-in slide-in-from-top-2 duration-200">
                    <p className="text-[#7D8187] text-base font-normal leading-6">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
