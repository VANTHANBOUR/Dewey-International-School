import React, { useState } from 'react';
import { HelpCircle, ChevronDown, MessageSquare, BookOpen, Send, CheckCircle2 } from 'lucide-react';

export const HelpSupportView: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMsg, setTicketMsg] = useState('');
  const [sentTicket, setSentTicket] = useState(false);

  const faqs = [
    {
      q: 'How do I open and flip through an interactive Flipbook?',
      a: 'Click on any resource card marked with the blue "FLIPBOOK" tag. In the modal viewer, use the on-screen left/right arrow buttons or your keyboard arrow keys to turn pages in realistic 3D perspective.'
    },
    {
      q: 'Can students access textbooks offline or print chapters?',
      a: 'Yes! Inside the reader, click the "Print" or "Download PDF" action to save physical or offline copies for classroom activities.'
    },
    {
      q: 'How do I add custom lesson notes or assign reading pages?',
      a: 'Open the book and toggle the "Notes" drawer on the top bar. You can type instructions, discussion questions, or lab safety reminders directly alongside the text.'
    },
    {
      q: 'How do I filter materials for a specific grade level?',
      a: 'Use the colorful Grade selector bar (K through 12) at the top of the dashboard or navigate to the "Grades" tab in the left sidebar.'
    }
  ];

  const handleSendTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketMsg.trim()) return;
    setSentTicket(true);
    setTimeout(() => {
      setSentTicket(false);
      setTicketSubject('');
      setTicketMsg('');
    }, 2500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <HelpCircle size={24} className="stroke-[2.2]" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Dewey Help & Educator Support</h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
              Knowledge base, flipbook reading guides, and IT support for Dewey International School staff.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* FAQs */}
        <div className="lg:col-span-2 space-y-3">
          <h3 className="font-extrabold text-base text-slate-900 mb-2">Frequently Asked Questions</h3>
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-4 text-left font-bold text-xs sm:text-sm text-slate-900 flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    size={16}
                    className={`text-slate-400 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-blue-600' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Contact Support Box */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs h-fit">
          <div className="flex items-center gap-2 text-blue-600 mb-3">
            <MessageSquare size={20} />
            <h3 className="font-bold text-sm text-slate-900">Contact Dewey IT Support</h3>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            Need help configuring a class roster or reporting a missing curriculum file?
          </p>

          {sentTicket ? (
            <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl text-xs text-center font-bold">
              <CheckCircle2 size={24} className="mx-auto text-emerald-600 mb-1" />
              Ticket submitted to Dewey IT Desk!
            </div>
          ) : (
            <form onSubmit={handleSendTicket} className="space-y-3">
              <input
                type="text"
                required
                value={ticketSubject}
                onChange={(e) => setTicketSubject(e.target.value)}
                placeholder="Subject..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <textarea
                required
                rows={3}
                value={ticketMsg}
                onChange={(e) => setTicketMsg(e.target.value)}
                placeholder="Describe the issue..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
              <button
                type="submit"
                className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Send size={13} />
                <span>Submit Ticket</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
