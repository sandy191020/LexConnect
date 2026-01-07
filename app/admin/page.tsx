'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, FileText, User, Briefcase, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';

interface PendingLawyer {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
    address: string;
    phone?: string;
    profilePhoto?: string;
  };
  barCouncilNumber: string;
  specialization: string[];
  experience: number;
  chargesPerHearing: number;
  bio?: string;
  certificates: any[];
  createdAt: string;
}

export default function AdminPage() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [lawyers, setLawyers] = useState<PendingLawyer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/login');
      return;
    }
    fetchPendingLawyers();
  }, [user, router]);

  const fetchPendingLawyers = async () => {
    try {
      const response = await fetch('/api/admin/lawyers/pending', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setLawyers(data.lawyers);
      }
    } catch (error) {
      toast.error('Failed to fetch pending lawyers');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (lawyerId: string, approve: boolean) => {
    try {
      const response = await fetch('/api/admin/lawyers/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ lawyerId, approve }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(approve ? 'Lawyer approved successfully' : 'Lawyer rejected');
        fetchPendingLawyers();
      } else {
        toast.error(data.error || 'Failed to update lawyer status');
      }
    } catch (error) {
      toast.error('Failed to update lawyer status');
    }
  };

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
        >
          <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-200 mb-8">
            Admin Panel - Pending Lawyer Approvals
          </h1>

          {lawyers.length === 0 ? (
            <div className="text-center py-20">
              <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                No pending lawyer approvals
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {lawyers.map((lawyer, index) => (
                <motion.div
                  key={lawyer.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
                >
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
                        {lawyer.user.name}
                      </h2>
                      <div className="space-y-2 text-gray-600 dark:text-gray-400">
                        <div className="flex items-center space-x-2">
                          <User className="w-5 h-5" />
                          <span>{lawyer.user.email}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Briefcase className="w-5 h-5" />
                          <span>Bar Council: {lawyer.barCouncilNumber}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <DollarSign className="w-5 h-5" />
                          <span>₹{lawyer.chargesPerHearing} per hearing</span>
                        </div>
                        <p className="text-sm">{lawyer.user.address}</p>
                        {lawyer.user.phone && (
                          <p className="text-sm">Phone: {lawyer.user.phone}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <div className="mb-4">
                        <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
                          Specialization
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {lawyer.specialization.map((spec, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 text-sm rounded-full"
                            >
                              {spec}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="mb-4">
                        <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
                          Experience
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          {lawyer.experience} years
                        </p>
                      </div>

                      {lawyer.bio && (
                        <div className="mb-4">
                          <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
                            Bio
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400 text-sm">
                            {lawyer.bio}
                          </p>
                        </div>
                      )}

                      <div className="mb-4">
                        <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
                          Certificates
                        </h3>
                        {lawyer.certificates.length > 0 ? (
                          <div className="space-y-2">
                            {lawyer.certificates.map((cert: any, idx: number) => (
                              <div
                                key={idx}
                                className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400"
                              >
                                <FileText className="w-4 h-4" />
                                <span>{cert.fileName}</span>
                                {cert.blockchainHash && (
                                  <span className="text-green-600 dark:text-green-400">
                                    (Blockchain Verified)
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500 dark:text-gray-500">
                            No certificates uploaded
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => handleApprove(lawyer.id, true)}
                      className="flex-1 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center space-x-2"
                    >
                      <CheckCircle className="w-5 h-5" />
                      <span>Approve & Verify</span>
                    </button>
                    <button
                      onClick={() => handleApprove(lawyer.id, false)}
                      className="flex-1 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center space-x-2"
                    >
                      <XCircle className="w-5 h-5" />
                      <span>Reject</span>
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

