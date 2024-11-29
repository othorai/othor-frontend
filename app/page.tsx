'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center items-center p-4">
      <div className="max-w-3xl w-full text-center space-y-8">
        {/* Logo */}
        <div className="mb-12">
          <Image
            src="/images/othor-logo.png"
            alt="Othor AI"
            width={300}
            height={100}
            priority
            className="mx-auto"
          />
        </div>

        {/* Description */}
        <div className="space-y-6 mb-12">
          <h1 className="text-4xl font-semibold text-gray-900">
            Welcome to Othor AI
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Transform your business data into actionable insights with our advanced analytics platform. 
            Get real-time updates, powerful visualizations, and AI-driven recommendations.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            onClick={() => router.push('/login')}
            size="lg"
            className="w-full sm:w-auto px-8 py-2 bg-primary hover:bg-primary-dark"
          >
            Log in
          </Button>
          <Button
            onClick={() => router.push('/signup')}
            size="lg"
            variant="outline"
            className="w-full sm:w-auto px-8 py-2 border-primary text-primary hover:bg-primary hover:text-white"
          >
            Sign up
          </Button>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-16">
          <div className="p-6 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Real-time Analytics
            </h3>
            <p className="text-gray-600">
              Get instant insights into your business performance with live data updates
            </p>
          </div>
          <div className="p-6 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Smart Visualizations
            </h3>
            <p className="text-gray-600">
              Understand your data better with intelligent and interactive charts
            </p>
          </div>
          <div className="p-6 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              AI-Powered Insights
            </h3>
            <p className="text-gray-600">
              Let our AI analyze your data and provide actionable recommendations
            </p>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 text-sm text-gray-500">
          © {new Date().getFullYear()} Othor AI. All rights reserved.
        </footer>
      </div>
    </div>
  );
}