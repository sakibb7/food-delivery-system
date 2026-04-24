"use client";

import React, { useState } from "react";
import { 
  LifeBuoy, 
  Send, 
  Paperclip, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  X
} from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth";

const MOCK_TICKETS = [
  {
    id: "TKT-001",
    subject: "Issue with recent order #ORD-123",
    type: "Order Issue",
    status: "Open",
    date: "2023-10-25T10:30:00Z",
  },
  {
    id: "TKT-002",
    subject: "Cannot update payout method",
    type: "Account Management",
    status: "Resolved",
    date: "2023-10-20T14:15:00Z",
  },
  {
    id: "TKT-003",
    subject: "Question about delivery fees",
    type: "General Inquiry",
    status: "In Progress",
    date: "2023-10-22T09:45:00Z",
  }
];

export default function SupportPage() {
  const { user } = useAuthStore();
  const [topic, setTopic] = useState("");
  const [message, setMessage] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tickets, setTickets] = useState(MOCK_TICKETS);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic || !message) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      const newTicket = {
        id: `TKT-00${tickets.length + 1}`,
        subject: message.length > 30 ? message.substring(0, 30) + "..." : message,
        type: topic,
        status: "Open",
        date: new Date().toISOString(),
      };

      setTickets([newTicket, ...tickets]);
      setTopic("");
      setMessage("");
      setFile(null);
      setIsSubmitting(false);
      toast.success("Support ticket submitted successfully. We'll get back to you soon!");
    }, 1500);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Open": return <AlertCircle size={16} className="text-orange-500" />;
      case "In Progress": return <Clock size={16} className="text-blue-500" />;
      case "Resolved": return <CheckCircle2 size={16} className="text-green-500" />;
      default: return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Open": return "bg-orange-50 text-orange-700 border-orange-200";
      case "In Progress": return "bg-blue-50 text-blue-700 border-blue-200";
      case "Resolved": return "bg-green-50 text-green-700 border-green-200";
      default: return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full font-sans">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
          <div className="p-2 bg-red-100 rounded-xl text-red-600">
            <LifeBuoy size={28} />
          </div>
          Help & Support
        </h1>
        <p className="text-gray-500 mt-2 font-medium max-w-2xl">
          Need assistance? Submit a ticket below and our support team will get back to you as soon as possible.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Support Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 sm:p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Create New Ticket</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Topic / Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="block w-full px-4 py-3 border border-gray-200 rounded-2xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all font-medium text-gray-700"
                    required
                  >
                    <option value="" disabled>Select a topic</option>
                    <option value="Order Issue">Order Issue</option>
                    <option value="Payment Issue">Payment Issue</option>
                    <option value="Account Management">Account Management</option>
                    <option value="Bug Report">Report a Bug</option>
                    <option value="General Inquiry">General Inquiry</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={5}
                    placeholder="Please describe your issue in detail..."
                    className="block w-full px-4 py-3 border border-gray-200 rounded-2xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all font-medium text-gray-700 resize-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Attachments (Optional)
                  </label>
                  {!file ? (
                    <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer relative">
                      <input 
                        type="file" 
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        accept="image/*,.pdf,.doc,.docx"
                      />
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-gray-400 mb-3">
                        <Paperclip size={24} />
                      </div>
                      <p className="text-sm font-medium text-gray-700">Click to upload or drag and drop</p>
                      <p className="text-xs text-gray-500 mt-1">SVG, PNG, JPG or PDF (max. 5MB)</p>
                    </div>
                  ) : (
                    <div className="border border-gray-200 rounded-2xl p-4 flex items-center justify-between bg-white">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center text-red-500">
                          <Paperclip size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-700 line-clamp-1">{file.name}</p>
                          <p className="text-xs text-gray-500 font-medium">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => setFile(null)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-8 py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-red-600/20 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send size={18} />
                        Submit Ticket
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Recent Tickets List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden sticky top-24">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Recent Tickets</h2>
            </div>
            
            <div className="divide-y divide-gray-50 max-h-[600px] overflow-y-auto">
              {tickets.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <div className="w-16 h-16 mx-auto bg-gray-50 rounded-full flex items-center justify-center text-gray-400 mb-3">
                    <LifeBuoy size={24} />
                  </div>
                  <p className="font-medium">No recent tickets</p>
                </div>
              ) : (
                tickets.map((ticket) => (
                  <div key={ticket.id} className="p-5 hover:bg-gray-50 transition-colors cursor-pointer group">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-bold text-gray-400">{ticket.id}</span>
                      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusBadge(ticket.status)}`}>
                        {getStatusIcon(ticket.status)}
                        {ticket.status}
                      </div>
                    </div>
                    <h3 className="font-bold text-gray-900 text-sm mb-1 group-hover:text-red-600 transition-colors line-clamp-2">
                      {ticket.subject}
                    </h3>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                        {ticket.type}
                      </span>
                      <span className="text-xs font-medium text-gray-400">
                        {new Date(ticket.date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
