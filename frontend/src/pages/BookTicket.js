// src/pages/BookTicket.js
import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { paymentAPI, trainAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Train, Plus, Minus, User, Phone, Mail, CreditCard, CheckCircle, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const CLASSES = ['General', 'Sleeper', '3AC', '2AC', '1AC'];
const CLASS_MULTIPLIERS = { General: 1.0, Sleeper: 1.3, '3AC': 1.8, '2AC': 2.5, '1AC': 3.5 };
const RAZORPAY_SCRIPT_URL = 'https://checkout.razorpay.com/v1/checkout.js';

const loadRazorpayCheckout = () => new Promise((resolve, reject) => {
  if (window.Razorpay) {
    resolve(true);
    return;
  }

  const existingScript = document.querySelector(`script[src="${RAZORPAY_SCRIPT_URL}"]`);
  if (existingScript) {
    existingScript.addEventListener('load', () => resolve(true), { once: true });
    existingScript.addEventListener('error', () => reject(new Error('Razorpay Checkout failed to load')), { once: true });
    return;
  }

  const script = document.createElement('script');
  script.src = RAZORPAY_SCRIPT_URL;
  script.async = true;
  script.onload = () => resolve(true);
  script.onerror = () => reject(new Error('Razorpay Checkout failed to load'));
  document.body.appendChild(script);
});

const BookTicket = () => {
  const { trainId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [train, setTrain] = useState(state?.train || null);
  const [seatClass, setSeatClass] = useState(state?.seatClass || 'Sleeper');
  const [journeyDate, setJourneyDate] = useState(state?.date || new Date().toISOString().split('T')[0]);
  const [passengers, setPassengers] = useState([{ name: '', age: '', gender: 'Male' }]);
  const [contactInfo, setContactInfo] = useState({ email: user?.email || '', phone: user?.phone || '' });
  const [step, setStep] = useState(1);
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!train) {
      trainAPI.getById(trainId).then(res => setTrain(res.train)).catch(() => navigate('/search'));
    }
  }, [trainId]);

  const farePerPassenger = train ? Math.round(train.baseFare * CLASS_MULTIPLIERS[seatClass]) : 0;
  const baseFare = farePerPassenger * passengers.length;
  const taxes = Math.round(baseFare * 0.05);
  const total = baseFare + taxes;

  const addPassenger = () => {
    if (passengers.length >= 6) { toast.error('Maximum 6 passengers per booking'); return; }
    setPassengers([...passengers, { name: '', age: '', gender: 'Male' }]);
  };

  const removePassenger = (i) => {
    if (passengers.length === 1) return;
    setPassengers(passengers.filter((_, idx) => idx !== i));
  };

  const updatePassenger = (i, field, value) => {
    const updated = [...passengers];
    updated[i] = { ...updated[i], [field]: value };
    setPassengers(updated);
  };

  const validateStep1 = () => {
    for (const p of passengers) {
      if (!p.name.trim()) { toast.error('Please enter passenger name'); return false; }
      if (!p.age || p.age < 1 || p.age > 120) { toast.error('Please enter valid age'); return false; }
    }
    if (!contactInfo.email || !contactInfo.phone) { toast.error('Contact info required'); return false; }
    return true;
  };

  const getBookingPayload = () => ({
    trainId,
    journeyDate,
    seatClass,
    passengers: passengers.map(p => ({ ...p, age: parseInt(p.age) })),
    contactInfo,
  });

  const handleBook = async () => {
    setLoading(true);
    try {
      const bookingPayload = getBookingPayload();
      const orderRes = await paymentAPI.createOrder(bookingPayload);
      await loadRazorpayCheckout();

      await new Promise((resolve, reject) => {
        const checkout = new window.Razorpay({
          key: orderRes.keyId,
          amount: orderRes.order.amount,
          currency: orderRes.order.currency,
          name: 'RailAxis',
          description: `${train.trainName} ticket booking`,
          order_id: orderRes.order.id,
          prefill: {
            name: passengers[0]?.name || user?.name || '',
            email: contactInfo.email,
            contact: contactInfo.phone,
          },
          theme: { color: '#6366f1' },
          handler: async (response) => {
            try {
              const verifyRes = await paymentAPI.verify({
                booking: bookingPayload,
                ...response,
              });
              setBooking(verifyRes.booking);
              setStep(3);
              toast.success('Payment successful. Ticket booked!');
              resolve();
            } catch (err) {
              reject(err);
            }
          },
          modal: {
            ondismiss: () => reject(new Error('Payment cancelled')),
          },
        });

        checkout.open();
      });
    } catch (err) {
      toast.error(err.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  if (!train) return (
    <div className="pt-32 flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
    </div>
  );

  // ── Step 3: Confirmation ──
  if (step === 3 && booking) return (
    <div className="pt-24 pb-16 px-4 page-enter">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(16,185,129,0.1))', border: '1px solid rgba(16,185,129,0.3)' }}>
            <CheckCircle size={36} className="text-emerald-400" />
          </div>
          <h1 className="font-display text-3xl font-bold text-white mb-2">Booking Confirmed!</h1>
          <p className="text-slate-500">Your journey has been successfully booked</p>
        </div>

        <div className="glass-strong rounded-2xl border border-white/10 overflow-hidden">
          {/* PNR Header */}
          <div className="p-6 border-b border-white/10" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.1))' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 mb-1">PNR Number</p>
                <p className="font-mono text-2xl font-bold gradient-text">{booking.pnrNumber}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500 mb-1">Status</p>
                <span className="badge-confirmed px-3 py-1 rounded-full text-sm font-medium">{booking.status}</span>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-4">
            {/* Train info */}
            <div className="glass rounded-xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <Train size={16} className="text-indigo-400" />
                <span className="font-semibold text-white">{booking.trainSnapshot?.trainName}</span>
                <span className="font-mono text-xs text-slate-500">{booking.trainSnapshot?.trainNumber}</span>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div>
                  <div className="text-xl font-bold text-white">{booking.trainSnapshot?.departureTime}</div>
                  <div className="text-xs text-slate-500">{booking.trainSnapshot?.source}</div>
                </div>
                <div className="flex-1 h-px bg-white/10" />
                <div className="text-right">
                  <div className="text-xl font-bold text-white">{booking.trainSnapshot?.arrivalTime}</div>
                  <div className="text-xs text-slate-500">{booking.trainSnapshot?.destination}</div>
                </div>
              </div>
            </div>

            {/* Passengers */}
            <div>
              <p className="text-xs text-slate-500 mb-2">Passengers ({booking.passengers?.length})</p>
              <div className="space-y-2">
                {booking.passengers?.map((p, i) => (
                  <div key={i} className="flex items-center justify-between glass rounded-xl px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <User size={14} className="text-slate-500" />
                      <span className="text-sm text-white">{p.name}</span>
                      <span className="text-xs text-slate-500">{p.age}y, {p.gender}</span>
                    </div>
                    <span className="font-mono text-sm text-indigo-400">{p.seatNumber}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Fare */}
            <div className="glass rounded-xl p-4">
              <div className="flex justify-between text-sm text-slate-400 mb-2">
                <span>Base fare × {booking.passengers?.length}</span>
                <span>₹{booking.baseFare}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-400 mb-3">
                <span>Service tax (5%)</span>
                <span>₹{booking.taxes}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t border-white/10 pt-3">
                <span className="text-white">Total Paid</span>
                <span className="gradient-text">₹{booking.totalFare}</span>
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-white/10 flex gap-3">
            <button onClick={() => navigate('/my-bookings')}
              className="flex-1 py-3 rounded-xl font-semibold text-sm glass border border-white/10 hover:border-indigo-500/30 transition-all text-slate-300">
              View My Bookings
            </button>
            <button onClick={() => navigate('/')}
              className="flex-1 py-3 rounded-xl font-semibold text-sm text-white btn-glow"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
              Book Another
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="pt-24 pb-16 px-4 page-enter">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate(-1)} className="w-10 h-10 glass rounded-xl border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="font-display text-2xl font-bold text-white">Book Ticket</h1>
            <p className="text-slate-500 text-sm">{train.trainName} · {train.source} → {train.destination}</p>
          </div>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-3 mb-8">
          {['Passenger Details', 'Review & Pay'].map((label, i) => (
            <React.Fragment key={i}>
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step > i + 1 ? 'bg-emerald-500 text-white' : step === i + 1 ? 'bg-indigo-500 text-white' : 'bg-white/10 text-slate-500'}`}>
                  {step > i + 1 ? '✓' : i + 1}
                </div>
                <span className={`text-sm hidden sm:block ${step === i + 1 ? 'text-white font-medium' : 'text-slate-500'}`}>{label}</span>
              </div>
              {i < 1 && <div className="flex-1 h-px bg-white/10" />}
            </React.Fragment>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main form */}
          <div className="lg:col-span-2 space-y-4">
            {step === 1 && (
              <>
                {/* Journey details */}
                <div className="glass rounded-2xl p-5 border border-white/10">
                  <h3 className="font-semibold text-white mb-4">Journey Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-slate-500 mb-1.5">Journey Date</label>
                      <input type="date" value={journeyDate} onChange={e => setJourneyDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full input-dark rounded-xl px-4 py-2.5 text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1.5">Seat Class</label>
                      <select value={seatClass} onChange={e => setSeatClass(e.target.value)}
                        className="w-full input-dark rounded-xl px-4 py-2.5 text-sm">
                        {CLASSES.map(c => <option key={c} value={c}>{c} · ₹{Math.round(train.baseFare * CLASS_MULTIPLIERS[c])}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Passengers */}
                <div className="glass rounded-2xl p-5 border border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-white">Passengers</h3>
                    <button onClick={addPassenger} className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                      <Plus size={14} /> Add Passenger
                    </button>
                  </div>

                  {passengers.map((p, i) => (
                    <div key={i} className="glass rounded-xl p-4 mb-3 border border-white/5">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-medium text-slate-400">Passenger {i + 1}</span>
                        {passengers.length > 1 && (
                          <button onClick={() => removePassenger(i)} className="text-xs text-red-400 hover:text-red-300">
                            <Minus size={14} />
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-1">
                          <input type="text" placeholder="Full Name" value={p.name}
                            onChange={e => updatePassenger(i, 'name', e.target.value)}
                            className="w-full input-dark rounded-xl px-4 py-2.5 text-sm" />
                        </div>
                        <div>
                          <input type="number" placeholder="Age" value={p.age} min="1" max="120"
                            onChange={e => updatePassenger(i, 'age', e.target.value)}
                            className="w-full input-dark rounded-xl px-4 py-2.5 text-sm" />
                        </div>
                        <div>
                          <select value={p.gender} onChange={e => updatePassenger(i, 'gender', e.target.value)}
                            className="w-full input-dark rounded-xl px-4 py-2.5 text-sm">
                            <option>Male</option>
                            <option>Female</option>
                            <option>Other</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Contact */}
                <div className="glass rounded-2xl p-5 border border-white/10">
                  <h3 className="font-semibold text-white mb-4">Contact Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="relative">
                      <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input type="email" placeholder="Email" value={contactInfo.email}
                        onChange={e => setContactInfo({...contactInfo, email: e.target.value})}
                        className="w-full input-dark rounded-xl pl-9 pr-4 py-2.5 text-sm" />
                    </div>
                    <div className="relative">
                      <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input type="tel" placeholder="Phone" value={contactInfo.phone}
                        onChange={e => setContactInfo({...contactInfo, phone: e.target.value})}
                        className="w-full input-dark rounded-xl pl-9 pr-4 py-2.5 text-sm" />
                    </div>
                  </div>
                </div>

                <button onClick={() => { if (validateStep1()) setStep(2); }}
                  className="w-full py-4 rounded-xl font-semibold text-white btn-glow"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                  Continue to Payment →
                </button>
              </>
            )}

            {step === 2 && (
              <>
                {/* Review */}
                <div className="glass rounded-2xl p-5 border border-white/10">
                  <h3 className="font-semibold text-white mb-4">Review Booking</h3>
                  <div className="space-y-2">
                    {passengers.map((p, i) => (
                      <div key={i} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                        <div className="flex items-center gap-2">
                          <User size={14} className="text-slate-500" />
                          <span className="text-sm text-white">{p.name}</span>
                          <span className="text-xs text-slate-500">{p.age}y · {p.gender}</span>
                        </div>
                        <span className="text-sm text-emerald-400">₹{farePerPassenger}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Payment */}
                <div className="glass rounded-2xl p-5 border border-white/10">
                  <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                    <CreditCard size={16} className="text-indigo-400" /> Razorpay Payment
                  </h3>
                  <div className="glass rounded-xl p-4 border border-indigo-500/20 text-center">
                    <p className="text-xs text-slate-500">Secured test checkout</p>
                    <p className="text-sm text-indigo-400 mt-1">Complete payment to confirm your ticket.</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setStep(1)}
                    className="px-6 py-3 rounded-xl glass border border-white/10 text-slate-400 hover:text-white transition-colors text-sm font-medium flex items-center gap-2">
                    <ArrowLeft size={14} /> Back
                  </button>
                  <button onClick={handleBook} disabled={loading}
                    className="flex-1 py-3 rounded-xl font-semibold text-white btn-glow disabled:opacity-50"
                    style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                    {loading ? 'Processing...' : `Confirm & Pay ₹${total}`}
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Fare Summary */}
          <div className="lg:col-span-1">
            <div className="glass-strong rounded-2xl border border-white/10 p-5 sticky top-28">
              <h3 className="font-semibold text-white mb-4">Fare Summary</h3>

              <div className="glass rounded-xl p-4 mb-4">
                <div className="flex items-center gap-3 mb-3">
                  <Train size={16} className="text-indigo-400" />
                  <div>
                    <div className="text-sm font-semibold text-white">{train.trainName}</div>
                    <div className="text-xs text-slate-500">{train.trainNumber}</div>
                  </div>
                </div>
                <div className="flex justify-between text-sm text-slate-400">
                  <span>{train.source} → {train.destination}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-400 mt-1">
                  <span>Class: {seatClass}</span>
                </div>
              </div>

              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between text-slate-400">
                  <span>Fare × {passengers.length}</span>
                  <span>₹{baseFare}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Service Tax (5%)</span>
                  <span>₹{taxes}</span>
                </div>
                <div className="border-t border-white/10 pt-3 flex justify-between font-bold text-lg">
                  <span className="text-white">Total</span>
                  <span className="gradient-text">₹{total}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookTicket;
