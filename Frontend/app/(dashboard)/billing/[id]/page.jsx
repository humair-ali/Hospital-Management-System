'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useUser } from '@/context/UserContext';
import { useNavigation } from '@/context/NavigationContext';
import { getBill, recordPayment } from '@/lib/api';
import {
    FaFileInvoiceDollar, FaPrint, FaArrowLeft, FaCheckCircle,
    FaExclamationCircle, FaUser, FaCalendarDay, FaCreditCard,
    FaMoneyBillWave, FaTimes
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import { LoadingState } from '@/components/ui/LoadingState';

export default function BillDetailPage({ id: propId }) {
    const params = useParams();
    const id = propId || params?.id;
    const { navigateTo } = useNavigation();
    const { user, loading: authLoading } = useUser();

    const [bill, setBill] = useState(null);
    const [loading, setLoading] = useState(true);

    
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [processingPayment, setProcessingPayment] = useState(false);

    useEffect(() => {
        if (!user || authLoading) return;
        if (id) fetchBill();
    }, [id, user, authLoading]);

    async function fetchBill() {
        try {
            const res = await getBill(id);
            if (res.success) {
                setBill(res.data);
                
                if (res.data) setPaymentAmount(res.data.total_amount);
            } else {
                toast.error('Bill not found');
            }
        } catch (err) {
            toast.error('Failed to retrieve fiscal record');
            navigateTo('billing');
        } finally {
            setLoading(false);
        }
    }

    async function handlePayment(e) {
        e.preventDefault();
        setProcessingPayment(true);
        try {
            const res = await recordPayment(id, {
                amount: parseFloat(paymentAmount),
                payment_method: paymentMethod
            });

            if (res.success) {
                toast.success('Payment recorded successfully');
                setShowPaymentModal(false);
                fetchBill(); 
            } else {
                toast.error(res.error || 'Payment failed');
            }
        } catch (err) {
            toast.error('Error processing payment');
            console.error(err);
        } finally {
            setProcessingPayment(false);
        }
    }

    if (loading) return <LoadingState message="Decoding Fiscal Matrix..." />;
    if (!bill) return (
        <div className="flex flex-col items-center justify-center p-20 gap-6">
            <FaExclamationCircle className="text-rose-500" size={48} />
            <p className="text-xl font-black text-gray-900 uppercase tracking-widest">Fiscal Record Missing</p>
            <button onClick={() => navigateTo('billing')} className="btn-secondary px-8">Return to Ledger</button>
        </div>
    );

    const isPaid = bill.status === 'paid';

    return (
        <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20 relative">
            <div className="flex justify-between items-center px-4 md:px-0">
                <button
                    onClick={() => navigateTo('billing')}
                    className="flex items-center gap-3 text-sm font-black text-gray-400 hover:text-primary-600 transition-colors uppercase tracking-[0.2em]"
                >
                    <FaArrowLeft size={12} /> Return to Ledger
                </button>
                <div className="flex gap-4">
                    {!isPaid && (
                        <button
                            onClick={() => setShowPaymentModal(true)}
                            className="btn-primary h-12 px-8 flex items-center gap-3 shadow-xl shadow-emerald-500/20 bg-emerald-600 hover:bg-emerald-700 border-emerald-600"
                        >
                            <FaCreditCard size={14} /> Record Payment
                        </button>
                    )}
                    <button
                        onClick={() => window.print()}
                        className="btn-secondary h-12 px-8 flex items-center gap-3"
                    >
                        <FaPrint size={14} /> Print
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-[3rem] shadow-2xl border border-gray-100 overflow-hidden print:shadow-none print:border-none">
                <div className={`h-4 ${isPaid ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                <div className="p-8 md:p-16 space-y-16">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-10">
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-gray-900 rounded-2xl flex items-center justify-center text-white shadow-2xl">
                                    <FaFileInvoiceDollar size={24} />
                                </div>
                                <div>
                                    <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase leading-none">Invoice</h1>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mt-2">OFFICIAL FISCAL RECORD</p>
                                </div>
                            </div>
                            <div className="pt-4">
                                <span className="font-mono text-xl font-black text-gray-300">#INV-{bill.id.toString().padStart(5, '0')}</span>
                            </div>
                        </div>
                        <div className="text-right space-y-4">
                            <div className={`inline-flex items-center gap-3 px-6 py-2 rounded-2xl border-2 font-black text-xs uppercase tracking-widest ${isPaid ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                                {isPaid ? <FaCheckCircle size={14} /> : <FaExclamationCircle size={14} />} {bill.status}
                            </div>
                            <div className="space-y-1">
                                <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Temporal Vector</p>
                                <p className="text-sm font-black text-gray-900">{new Date(bill.created_at).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
                            </div>
                        </div>
                    </div>

                    <div className="h-px bg-gray-50"></div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
                        <div className="space-y-6">
                            <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.3em] flex items-center gap-3 text-primary-600">
                                <FaUser size={10} /> Patient Principal
                            </h4>
                            <div className="space-y-2">
                                <p className="text-2xl font-black text-gray-900 tracking-tight">{bill.patient_name}</p>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-relaxed">Identity Vector Sync Complete</p>
                            </div>
                        </div>
                        <div className="space-y-6">
                            <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.3em] flex items-center gap-3 text-indigo-600">
                                <FaCalendarDay size={10} /> Fiscal Strategy
                            </h4>
                            <div className="space-y-2">
                                <p className="text-sm font-black text-gray-700">Immediate Settlement</p>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-relaxed">Verified by Institutional Comptroller</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.3em]">Itemized Billing Protocols</h4>
                        <div className="rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50/50">
                                    <tr>
                                        <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Service Description</th>
                                        <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Qty</th>
                                        <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Unit Price</th>
                                        <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Ext. Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {(bill.items || []).length > 0 ? (bill.items.map((item, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50/30 transition-colors">
                                            <td className="px-8 py-6 font-bold text-gray-700">
                                                {item.description}
                                                {item.service_code && <span className="block text-[10px] text-gray-400 font-mono mt-1">CODE-{item.service_code}</span>}
                                            </td>
                                            <td className="px-8 py-6 text-center font-black text-gray-500">{item.quantity}</td>
                                            <td className="px-8 py-6 text-right font-black text-gray-600">PKR {parseFloat(item.unit_price).toLocaleString()}</td>
                                            <td className="px-8 py-6 text-right font-black text-gray-900">PKR {(item.quantity * item.unit_price).toLocaleString()}</td>
                                        </tr>
                                    ))) : (
                                        <tr className="hover:bg-gray-50/30 transition-colors">
                                            <td className="px-8 py-6 font-bold text-gray-700">General Consultation / Clinical Service</td>
                                            <td className="px-8 py-6 text-center font-black text-gray-500">1</td>
                                            <td className="px-8 py-6 text-right font-black text-gray-600">PKR {parseFloat(bill.total_amount).toLocaleString()}</td>
                                            <td className="px-8 py-6 text-right font-black text-gray-900">PKR {parseFloat(bill.total_amount).toLocaleString()}</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="flex justify-end pt-10">
                        <div className="w-full max-w-sm space-y-6">
                            <div className="flex justify-between items-center px-4">
                                <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Subtotal</span>
                                <span className="font-bold text-gray-600">PKR {parseFloat(bill.total_amount).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center px-4">
                                <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Clinical Tax (0%)</span>
                                <span className="font-bold text-gray-600">PKR 0.00</span>
                            </div>
                            <div className="h-px bg-gray-100"></div>
                            <div className="flex justify-between items-center bg-gray-900 rounded-3xl p-8 text-white shadow-2xl shadow-gray-950/20 group hover:scale-[1.02] transition-transform">
                                <span className="text-xs font-black uppercase tracking-[0.2em] opacity-60">Grand Total</span>
                                <div className="text-right">
                                    <span className="text-3xl font-black tracking-tighter block leading-none">PKR {parseFloat(bill.total_amount).toLocaleString()}</span>
                                    <p className="text-[10px] font-black text-emerald-400 mt-2 uppercase tracking-widest">Synchronized</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-50 p-10 border-t border-gray-100">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em] text-center leading-relaxed">
                        This is a computer-generated institutional record and does not require a physical signature. <br />
                        All fiscal transactions are final and clinical-verified.
                    </p>
                </div>
            </div>

            {}
            {showPaymentModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl p-8 space-y-8 relative">
                        <button
                            onClick={() => setShowPaymentModal(false)}
                            className="absolute top-6 right-6 text-gray-400 hover:text-gray-900"
                        >
                            <FaTimes />
                        </button>

                        <div className="text-center space-y-2">
                            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FaMoneyBillWave size={24} />
                            </div>
                            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Record Payment</h2>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Settlement for INV-{bill.id.toString().padStart(5, '0')}</p>
                        </div>

                        <form onSubmit={handlePayment} className="space-y-6">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Payment Amount (PKR)</label>
                                <input
                                    type="number"
                                    value={paymentAmount}
                                    onChange={e => setPaymentAmount(e.target.value)}
                                    className="w-full h-14 px-6 bg-gray-50 border-2 border-transparent focus:border-emerald-100 focus:bg-white rounded-2xl outline-none text-lg font-black transition-all"
                                    placeholder="0.00"
                                    required
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Payment Method</label>
                                <select
                                    value={paymentMethod}
                                    onChange={e => setPaymentMethod(e.target.value)}
                                    className="w-full h-14 px-6 bg-gray-50 border-2 border-transparent focus:border-emerald-100 focus:bg-white rounded-2xl outline-none text-sm font-black transition-all appearance-none"
                                >
                                    <option value="cash">Cash Settlement</option>
                                    <option value="card">Credit/Debit Card</option>
                                    <option value="bank">Bank Transfer</option>
                                    <option value="insurance">Insurance Claim</option>
                                </select>
                            </div>

                            <button
                                type="submit"
                                disabled={processingPayment}
                                className="btn-primary w-full h-14 bg-emerald-600 hover:bg-emerald-700 shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2"
                            >
                                {processingPayment ? (
                                    <span className="animate-spin rounded-full h-5 w-5 border-2 border-white/20 border-t-white"></span>
                                ) : (
                                    <>
                                        <FaCheckCircle /> Process Transaction
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}