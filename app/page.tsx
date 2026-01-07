'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Scale, Users, Shield, Calendar, Mail, Award } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Navigation */}
      <nav className="container mx-auto px-4 py-6 flex justify-between items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center space-x-2"
        >
          <Scale className="w-8 h-8 text-primary-600 dark:text-primary-400" />
          <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
            LexConnect
          </span>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex space-x-4"
        >
          <Link
            href="/login"
            className="px-4 py-2 text-primary-600 dark:text-primary-400 font-medium hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-lg hover:shadow-xl"
          >
            Get Started
          </Link>
        </motion.div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary-600 via-secondary-600 to-primary-600 bg-clip-text text-transparent">
  Connect with Legal Experts
</h1>

          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Find verified lawyers, book consultations, and get the legal help you need
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/register?role=client')}
              className="px-8 py-4 bg-primary-600 text-white rounded-lg text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              Find a Lawyer
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/register?role=lawyer')}
              className="px-8 py-4 bg-white dark:bg-gray-800 text-primary-600 dark:text-primary-400 rounded-lg text-lg font-semibold border-2 border-primary-600 dark:border-primary-400 hover:bg-primary-50 dark:hover:bg-gray-700 transition-all"
            >
              Join as Lawyer
            </motion.button>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-4xl font-bold text-center mb-16 text-gray-800 dark:text-gray-200"
        >
          Why Choose LexConnect?
        </motion.h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: Shield,
              title: 'Verified Lawyers',
              description: 'All lawyers are verified by our admin team with background checks and certificate verification',
            },
            {
              icon: Users,
              title: 'Easy Booking',
              description: 'Simple booking system with instant notifications and email confirmations',
            },
            {
              icon: Calendar,
              title: 'Schedule Management',
              description: 'Lawyers can manage their schedules and clients can book available slots',
            },
            {
              icon: Award,
              title: 'Blockchain Certificates',
              description: 'Lawyer certificates are stored on blockchain for transparency and security',
            },
            {
              icon: Mail,
              title: 'Instant Notifications',
              description: 'Get notified via email when your booking is accepted or rejected',
            },
            {
              icon: Scale,
              title: 'Transparent Pricing',
              description: 'See lawyer charges upfront before booking a consultation',
            },
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
            >
              <feature.icon className="w-12 h-12 text-primary-600 dark:text-primary-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-200">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}

