'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Clock, Calendar, Upload, FileText, Brain, Loader as LoaderIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

interface Booking {
  id: string;
  status: string;
  caseDescription?: string;
  hearingDate?: string;
  hearingTime?: string;
  createdAt: string;
  client: {
    id: string;
    name: string;
    email: string;
    profilePhoto?: string;
  };
}

export default function LawyerDashboard() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'requests' | 'calendar' | 'certificates' | 'ml-model'>('requests');
  const [mlFeatures, setMlFeatures] = useState<string>('');
  const [mlPrediction, setMlPrediction] = useState<any>(null);
  const [mlLoading, setMlLoading] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'lawyer') {
      router.push('/login');
      return;
    }
    fetchBookings();
  }, [user, router]);

  const fetchBookings = async () => {
    try {
      const response = await fetch('/api/bookings/requests', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setBookings(data.bookings);
      }
    } catch (error) {
      toast.error('Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (bookingId: string) => {
    try {
      const response = await fetch('/api/bookings/accept', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ bookingId }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Booking accepted! Email sent to client.');
        fetchBookings();
      } else {
        toast.error(data.error || 'Failed to accept booking');
      }
    } catch (error) {
      toast.error('Failed to accept booking');
    }
  };

  const handleReject = async (bookingId: string) => {
    try {
      const response = await fetch('/api/bookings/reject', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ bookingId }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Booking rejected');
        fetchBookings();
      } else {
        toast.error(data.error || 'Failed to reject booking');
      }
    } catch (error) {
      toast.error('Failed to reject booking');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('certificate', file);

    try {
      const response = await fetch('/api/certificates/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Certificate uploaded and stored on blockchain!');
      } else {
        if (data.error === 'Certificate already exists' || data.error === 'You have already uploaded this certificate') {
          toast.error(data.message || 'This certificate already exists. Duplicate uploads are not allowed.');
        } else {
          toast.error(data.error || 'Failed to upload certificate');
        }
      }
    } catch (error) {
      toast.error('Failed to upload certificate');
    }
  };

  const pendingBookings = bookings.filter((b) => b.status === 'pending');
  const acceptedBookings = bookings.filter((b) => b.status === 'accepted');

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
            Lawyer Dashboard
          </h1>

          {/* Tabs */}
          <div className="flex gap-4 mb-6 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('requests')}
              className={`px-6 py-3 font-semibold transition-colors ${
                activeTab === 'requests'
                  ? 'border-b-2 border-primary-600 text-primary-600 dark:text-primary-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              Booking Requests ({pendingBookings.length})
            </button>
            <button
              onClick={() => setActiveTab('calendar')}
              className={`px-6 py-3 font-semibold transition-colors ${
                activeTab === 'calendar'
                  ? 'border-b-2 border-primary-600 text-primary-600 dark:text-primary-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              Calendar
            </button>
            <button
              onClick={() => setActiveTab('certificates')}
              className={`px-6 py-3 font-semibold transition-colors ${
                activeTab === 'certificates'
                  ? 'border-b-2 border-primary-600 text-primary-600 dark:text-primary-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              Certificates
            </button>
            <button
  onClick={() => window.open('http://localhost:8501/', '_blank')}
  className="px-6 py-3 font-semibold transition-colors text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
>
  ML Model
</button>

          </div>

          {/* Requests Tab */}
          {activeTab === 'requests' && (
            <div className="space-y-4">
              {pendingBookings.length === 0 ? (
                <div className="text-center py-20">
                  <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400 text-lg">
                    No pending booking requests
                  </p>
                </div>
              ) : (
                pendingBookings.map((booking) => (
                  <motion.div
                    key={booking.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                          <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                            {booking.client.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-1">
                            {booking.client.name}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400 mb-2">
                            {booking.client.email}
                          </p>
                          {booking.caseDescription && (
                            <p className="text-gray-700 dark:text-gray-300 mb-2">
                              {booking.caseDescription}
                            </p>
                          )}
                          <p className="text-sm text-gray-500 dark:text-gray-500">
                            Requested on {new Date(booking.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAccept(booking.id)}
                          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2"
                        >
                          <CheckCircle className="w-5 h-5" />
                          <span>Accept</span>
                        </button>
                        <button
                          onClick={() => handleReject(booking.id)}
                          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center space-x-2"
                        >
                          <XCircle className="w-5 h-5" />
                          <span>Reject</span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}

              {acceptedBookings.length > 0 && (
                <div className="mt-8">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
                    Accepted Bookings
                  </h2>
                  {acceptedBookings.map((booking) => (
                    <motion.div
                      key={booking.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-4"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-1">
                            {booking.client.name}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400">
                            {booking.client.email}
                          </p>
                          {booking.hearingDate && (
                            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                              Scheduled: {new Date(booking.hearingDate).toLocaleDateString()} at{' '}
                              {booking.hearingTime}
                            </p>
                          )}
                        </div>
                        <span className="px-4 py-2 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-lg">
                          Accepted
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Calendar Tab */}
          {activeTab === 'calendar' && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                headerToolbar={{
                  left: 'prev,next today',
                  center: 'title',
                  right: 'dayGridMonth,timeGridWeek,timeGridDay',
                }}
                height="auto"
                events={acceptedBookings.map((booking) => ({
                  title: `Meeting with ${booking.client.name}`,
                  start: booking.hearingDate || booking.createdAt,
                  backgroundColor: '#0ea5e9',
                }))}
                editable={true}
                selectable={true}
                selectMirror={true}
                dayMaxEvents={true}
              />
            </div>
          )}

          {/* Certificates Tab */}
          {activeTab === 'certificates' && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Upload Certificate
                </label>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors cursor-pointer">
                    <Upload className="w-5 h-5" />
                    <span>Choose File</span>
                    <input
                      type="file"
                      onChange={handleFileUpload}
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png"
                    />
                  </label>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Certificate will be stored on blockchain (duplicates not allowed)
                  </span>
                </div>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                  Uploaded Certificates
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Your certificates will appear here after upload and blockchain storage.
                </p>
              </div>
            </div>
          )}

          {/* ML Model Tab */}
          {activeTab === 'ml-model' && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="mb-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Brain className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                    ML Model Predictions
                  </h2>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Use the trained ML model to make predictions. Enter features as comma-separated values.
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Input Features (comma-separated numbers)
                  </label>
                  <textarea
                    value={mlFeatures}
                    onChange={(e) => setMlFeatures(e.target.value)}
                    placeholder="e.g., 1.5, 2.3, 4.1, 5.2"
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                  />
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-500">
                    Enter numeric features separated by commas. Example: 1.5, 2.3, 4.1, 5.2
                  </p>
                </div>

                <button
                  onClick={async () => {
                    if (!mlFeatures.trim()) {
                      toast.error('Please enter features');
                      return;
                    }

                    setMlLoading(true);
                    setMlPrediction(null);

                    try {
                      // Parse features
                      const features = mlFeatures
                        .split(',')
                        .map(f => parseFloat(f.trim()))
                        .filter(f => !isNaN(f));

                      if (features.length === 0) {
                        toast.error('Invalid features. Please enter valid numbers.');
                        setMlLoading(false);
                        return;
                      }

                      const response = await fetch('/api/ml/predict', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify({ features }),
                      });

                      const data = await response.json();

                      if (data.success) {
                        setMlPrediction(data);
                        toast.success('Prediction generated successfully!');
                      } else {
                        toast.error(data.error || 'Failed to get prediction');
                        if (data.message) {
                          toast.error(data.message);
                        }
                      }
                    } catch (error) {
                      toast.error('Failed to connect to ML model. Make sure the ML API is running on port 5000.');
                    } finally {
                      setMlLoading(false);
                    }
                  }}
                  disabled={mlLoading || !mlFeatures.trim()}
                  className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {mlLoading ? (
                    <>
                      <LoaderIcon className="w-5 h-5 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <Brain className="w-5 h-5" />
                      <span>Get Prediction</span>
                    </>
                  )}
                </button>

                {mlPrediction && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6"
                  >
                    <h3 className="text-lg font-semibold text-green-800 dark:text-green-300 mb-4">
                      Prediction Result
                    </h3>
                    <div className="space-y-2">
                      <div>
                        <span className="font-semibold text-green-700 dark:text-green-400">Prediction: </span>
                        <span className="text-green-800 dark:text-green-300">
                          {Array.isArray(mlPrediction.prediction)
                            ? mlPrediction.prediction.join(', ')
                            : mlPrediction.prediction}
                        </span>
                      </div>
                      {mlPrediction.probabilities && (
                        <div>
                          <span className="font-semibold text-green-700 dark:text-green-400">Probabilities: </span>
                          <span className="text-green-800 dark:text-green-300">
                            {mlPrediction.probabilities.map((p: number, i: number) => (
                              <span key={i} className="mr-2">
                                Class {i}: {(p * 100).toFixed(2)}%
                              </span>
                            ))}
                          </span>
                        </div>
                      )}
                      <div className="mt-4 pt-4 border-t border-green-200 dark:border-green-800">
                        <span className="text-sm text-green-600 dark:text-green-400">
                          Features used: [{mlPrediction.features_used?.join(', ')}]
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}

                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">
                    How to Use:
                  </h4>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-blue-700 dark:text-blue-400">
                    <li>Start the ML API: <code className="bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded">cd ml-model && python app.py</code></li>
                    <li>Enter your model's input features as comma-separated values</li>
                    <li>Click "Get Prediction" to get results from your trained model</li>
                    <li>Place your trained model at: <code className="bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded">ml-model/models/trained_model.pkl</code></li>
                  </ol>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

