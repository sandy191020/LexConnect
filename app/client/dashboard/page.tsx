'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { motion } from 'framer-motion';
import { Search, User, Mail, Phone, DollarSign, Award, Calendar, CheckCircle, XCircle, Clock, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface Lawyer {
  id: string;
  userId: string;
  name: string;
  email: string;
  profilePhoto?: string;
  specialization: string[];
  experience: number;
  chargesPerHearing: number;
  bio?: string;
  verificationBadge: boolean;
  rating: number;
}

export default function ClientDashboard() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [bookingLawyer, setBookingLawyer] = useState<string | null>(null);
  const [caseDescription, setCaseDescription] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'client') {
      router.push('/login');
      return;
    }
    fetchLawyers();
  }, [user, router]);

  const fetchLawyers = async () => {
    try {
      const response = await fetch('/api/lawyers');
      const data = await response.json();
      if (data.success) {
        setLawyers(data.lawyers);
      }
    } catch (error) {
      toast.error('Failed to fetch lawyers');
    } finally {
      setLoading(false);
    }
  };

  const handleBookLawyer = async (lawyerId: string) => {
    setBookingLawyer(lawyerId);
  };

  const confirmBooking = async () => {
    if (!bookingLawyer) return;

    try {
      const response = await fetch('/api/bookings/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          lawyerId: bookingLawyer,
          caseDescription,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Booking request sent!');
        setBookingLawyer(null);
        setCaseDescription('');
      } else {
        toast.error(data.error || 'Failed to create booking');
      }
    } catch (error) {
      toast.error('Failed to create booking');
    }
  };

  const filteredLawyers = lawyers.filter((lawyer) =>
    lawyer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lawyer.specialization.some((spec) => spec.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-200">
              Find Your Lawyer
            </h1>
            <Link
              href="/client/documents"
              className="flex items-center space-x-2 px-6 py-3 bg-secondary-600 text-white rounded-lg hover:bg-secondary-700 transition-colors"
            >
              <FileText className="w-5 h-5" />
              <span>Document Reader</span>
            </Link>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or specialization..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
            />
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLawyers.map((lawyer, index) => (
            <motion.div
              key={lawyer.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden"
            >
              <div className="relative">
                <div className="h-48 bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                  {lawyer.profilePhoto ? (
                    <img
                      src={lawyer.profilePhoto}
                      alt={lawyer.name}
                      className="w-32 h-32 rounded-full border-4 border-white object-cover"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-white/20 flex items-center justify-center">
                      <User className="w-16 h-16 text-white" />
                    </div>
                  )}
                </div>
                {lawyer.verificationBadge && (
                  <div className="absolute top-4 right-4 bg-green-500 text-white rounded-full p-2">
                    <Award className="w-5 h-5" />
                  </div>
                )}
              </div>

              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                  {lawyer.name}
                </h3>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-2">
                  <Mail className="w-4 h-4 mr-2" />
                  {lawyer.email}
                </div>
                <div className="mb-4">
                  <div className="flex flex-wrap gap-2">
                    {lawyer.specialization.map((spec, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 text-xs rounded-full"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-semibold">{lawyer.experience}</span> years experience
                  </div>
                  <div className="flex items-center text-yellow-500">
                    {'★'.repeat(Math.round(lawyer.rating))}
                    <span className="ml-1 text-gray-600 dark:text-gray-400 text-sm">
                      ({lawyer.rating.toFixed(1)})
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center text-primary-600 dark:text-primary-400">
                    <DollarSign className="w-5 h-5 mr-1" />
                    <span className="font-bold text-lg">₹{lawyer.chargesPerHearing}</span>
                    <span className="text-sm ml-1">/hearing</span>
                  </div>
                </div>
                {lawyer.bio && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                    {lawyer.bio}
                  </p>
                )}
                <button
                  onClick={() => handleBookLawyer(lawyer.id)}
                  className="w-full bg-primary-600 text-white py-2 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
                >
                  Book Lawyer
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredLawyers.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              No lawyers found matching your search.
            </p>
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {bookingLawyer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full"
          >
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
              Book Lawyer
            </h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Case Description (Optional)
              </label>
              <textarea
                value={caseDescription}
                onChange={(e) => setCaseDescription(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                placeholder="Describe your case..."
              />
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setBookingLawyer(null);
                  setCaseDescription('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmBooking}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Send Request
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

