import React, { useState } from 'react';
import { QrCode, Smartphone, CreditCard, ArrowRight, Shield, Zap, Globe, CheckCircle, Play, Menu, X } from 'lucide-react';
import FeaturesCarousel from '../components/FeaturesCarousel';

const LandingPage: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleGetStarted = () => {
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <img src="/Logo_IRIS_gradient.svg" alt="Iris" className="w-24 h-12" />
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#values" className="text-gray-600 hover:text-gray-900 transition-colors">Values</a>
              <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">Features</a>
              <button
                onClick={handleGetStarted}
                className="bg-gradient-to-r from-blue-500 to-blue-400 text-white px-6 py-2 rounded-xl hover:shadow-lg transition-all duration-300"
              >
                Get Started
              </button>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden absolute top-16 left-0 right-0 bg-white border-b border-gray-100 shadow-lg">
              <div className="px-4 py-4 space-y-4">
                <a href="#values" className="block text-gray-600 hover:text-gray-900">Values</a>
                <a href="#features" className="block text-gray-600 hover:text-gray-900">Features</a>
                <button
                  onClick={handleGetStarted}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-400 text-white py-3 rounded-xl"
                >
                  Get Started
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="text-center md:text-left">
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-gray-900 leading-tight mb-6">
                        Making payments with crypto <span className="bg-gradient-to-r font-bold from-blue-500 to-green-400 bg-clip-text text-transparent">easy</span>
                    </h1>
                    <p className="text-lg sm:text-xl text-gray-600 mb-8 leading-relaxed">
                        Enable seamless cryptocurrency payments through QR codes. Merchants can accept crypto or fiat, customers can pay instantly, and everyone can cash out effortlessly.
                    </p>
                    <div className="flex justify-center md:justify-start">
                        <button
                        onClick={handleGetStarted}
                        className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-green-400 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-lg hover:brightness-105 transition-all duration-300 flex items-center justify-center gap-2"
                        >
                            Get Started
                            <ArrowRight size={20} />
                        </button>
                    </div>
                </div>

                <div className="mt-8 md:mt-0">
                    <img src="/SCAN_LANDING_ILLUST.png" alt="Iris Hero" className="w-full max-w-2xl mx-auto" />
                </div>

            </div>
        </div>
      </section>

      <section id="values" className="py-16 bg-gradient-to-br from-blue-50 to-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Why Choose Iris?</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-shadow duration-300">
              <div className="bg-blue-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                <Zap className="text-blue-600" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Lightning Fast</h3>
              <p className="text-gray-600 leading-relaxed">
                Process payments in seconds, not minutes. Our QR code system enables instant transactions with minimal friction for both merchants and customers.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-shadow duration-300">
              <div className="bg-green-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                <Shield className="text-green-600" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Secure & Reliable</h3>
              <p className="text-gray-600 leading-relaxed">
                Built on Internet Computer Protocol with enterprise-grade security. Your transactions are protected by decentralized infrastructure.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-shadow duration-300">
              <div className="bg-purple-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                <Globe className="text-purple-600" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Universal Access</h3>
              <p className="text-gray-600 leading-relaxed">
                Accept both cryptocurrency and fiat payments seamlessly. Cash out to your preferred currency with competitive exchange rates.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="py-16">
        <FeaturesCarousel />
      </section>

      <section className="py-16 bg-gradient-to-r from-blue-500 to-green-400">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to revolutionize your payments?
          </h2>
          <p className="text-lg text-blue-100 mb-8">
            Join Iris today to accept cryptocurrency payments effortlessly.
          </p>
          <button
            onClick={handleGetStarted}
            className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-lg hover:bg-gray-50 transition-all duration-300 inline-flex items-center gap-2"
          >
            Get Started Now
            <ArrowRight size={20} />
          </button>
        </div>
      </section>

      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <img src="/Logo_IRIS_gradient.svg" alt="Iris" className="w-32 h-16 mb-4" />
              <p className="text-gray-400 mb-6 max-w-md">
                Making cryptocurrency payments accessible to everyone. Bridging the gap between digital assets and everyday commerce.
              </p>
              <p className="text-sm text-gray-500">
                Secure decentralized payments powered by Internet Computer Protocol
              </p>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center">
            <p className="text-gray-400">© 2025 Iris. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;