import React, { useState, useEffect } from 'react';
import { CheckCircle } from 'lucide-react'; // Example icon, you can use your own

const featureSteps = [
  {
    title: "Generate QR Code",
    description: "Merchants create payment QR codes instantly with custom amounts and preferred currencies.",
    bgColor: "bg-blue-500",
    illustration: "/GENERATE_QR_ILLUST.png"
  },
  {
    title: "Customer Scans & Pays",
    description: "Customers scan the QR code and choose to pay with crypto or fiat through their preferred wallet.",
    bgColor: "bg-green-500",
    illustration: "/SCAN_PAY_ILLUST.png"
  },
  {
    title: "Instant Settlement",
    description: "Payments are processed immediately with real-time confirmation and automatic currency conversion.",
    bgColor: "bg-purple-500",
    illustration: "/SETTLEMENT_ILLUST.png"
  },
  {
    title: "Easy Cash Out",
    description: "Merchants can withdraw earnings to their bank account or keep them as cryptocurrency.",
    bgColor: "bg-orange-500",
    illustration: "/CASH_OUT_ILLUST.png"
  }
];

const FeaturesCarousel = () => {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prevStep) => (prevStep + 1) % featureSteps.length);
    }, 5000); // Switch every 5 seconds

    return () => clearInterval(timer);
  }, []);

  const handleStepClick = (index) => {
    setActiveStep(index);
  };

  return (
    <section id="features" className="py-20 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">See Iris in Action</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover how easy it is to integrate crypto payments into your business workflow.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          <div className="space-y-6">
            {featureSteps.map((step, index) => (
              <div
                key={step.title}
                onClick={() => handleStepClick(index)}
                className={`p-6 rounded-2xl cursor-pointer transition-all duration-300 ease-in-out ${
                  activeStep === index
                    ? 'bg-white shadow-lg ring-2 ring-blue-500/50'
                    : 'bg-gray-50 hover:bg-white hover:shadow-md'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 transition-colors duration-300 ${step.bgColor}`}>
                    {activeStep === index ? <CheckCircle size={20} /> : index + 1}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 mb-2">{step.title}</h3>
                    <p className="text-gray-600">{step.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center min-h-[300px] lg:min-h-[450px] bg-gradient-to-br from-blue-50 to-green-50 rounded-3xl p-8">
            <img 
              key={activeStep}
              src={featureSteps[activeStep].illustration} 
              alt={`${featureSteps[activeStep].title} illustration`}
              className="w-full max-w-md rounded-2xl shadow-lg animate-fade-in" 
            />
          </div>

        </div>
      </div>
    </section>
  );
};

export default FeaturesCarousel;