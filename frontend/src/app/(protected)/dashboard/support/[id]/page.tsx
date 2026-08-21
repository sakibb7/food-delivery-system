"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft,
  LifeBuoy, 
  Send, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  User,
  ShieldCheck
} from "lucide-react";
import { toast } from "sonner";
import { privateInstance } from "@/configs/axiosConfig";
import { useAuthStore } from "@/store/auth";

interface Ticket {
  id: number;
  ticketNumber: string;
  subject: string;
  type: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  userId: number;
}

interface Message {
  id: number;
  senderType: "user" | "staff";
  senderId: number;
  text: string;
  createdAt: string;
  senderName: string;
  attachmentUrl?: string;
}

export default function TicketDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchTicketDetails();
    }
  }, [id]);

  const fetchTicketDetails = async () => {
    try {
      setIsLoading(true);
      const res = await privateInstance.get(`/support/${id}`);
      setTicket(res.data.ticket);
      setMessages(res.data.messages);
    } catch (error: any) {
      console.error("Failed to fetch ticket:", error);
      toast.error(error?.response?.data?.message || "Failed to load ticket details.");
      router.push("/dashboard/support");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setIsSubmitting(true);
    try {
      await privateInstance.post(`/support/${id}/user-reply`, {
        text: newMessage,
      });
      
      setNewMessage("");
      toast.success("Reply sent successfully.");
      
      // Refresh messages
      await fetchTicketDetails();
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || "Failed to send reply.";
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open": return <AlertCircle size={16} className="text-orange-500" />;
      case "in_progress": return <Clock size={16} className="text-blue-500" />;
      case "resolved": return <CheckCircle2 size={16} className="text-green-500" />;
      default: return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open": return "bg-orange-50 text-orange-700 border-orange-200";
      case "in_progress": return "bg-blue-50 text-blue-700 border-blue-200";
      case "resolved": return "bg-green-50 text-green-700 border-green-200";
      default: return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const formatStatus = (status: string) => {
    switch (status) {
      case "open": return "Open";
      case "in_progress": return "In Progress";
      case "resolved": return "Resolved";
      default: return status;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4 text-gray-500">
          <Loader2 size={40} className="animate-spin text-red-500" />
          <p className="font-medium">Loading ticket details...</p>
        </div>
      </div>
    );
  }

  if (!ticket) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full font-sans">
      {/* Header section */}
      <div className="mb-8">
        <button 
          onClick={() => router.push("/dashboard/support")}
          className="flex items-center gap-2 text-gray-500 hover:text-red-600 transition-colors font-medium mb-6 group w-fit"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          Back to Tickets
        </button>

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-sm font-bold text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                {ticket.ticketNumber}
              </span>
              <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold border ${getStatusBadge(ticket.status)}`}>
                {getStatusIcon(ticket.status)}
                {formatStatus(ticket.status)}
              </div>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
              {ticket.subject}
            </h1>
            <p className="text-gray-500 mt-2 font-medium">
              Created on {new Date(ticket.createdAt).toLocaleDateString()} at {new Date(ticket.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </p>
          </div>
        </div>
      </div>

      {/* Email-like thread container */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-8">
        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
          <h2 className="font-bold text-gray-900 flex items-center gap-2">
            <LifeBuoy size={20} className="text-gray-400" />
            Ticket History
          </h2>
        </div>

        <div className="divide-y divide-gray-100">
          {messages.map((message, index) => {
            const isStaff = message.senderType === "staff";
            
            return (
              <div key={message.id} className={`p-6 sm:p-8 transition-colors ${isStaff ? 'bg-blue-50/30' : 'bg-white'}`}>
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                  
                  {/* Sender Info */}
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${isStaff ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                      {isStaff ? <ShieldCheck size={24} /> : <User size={24} />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-gray-900 text-lg">
                          {isStaff ? message.senderName || "Support Team" : message.senderName || "You"}
                        </h3>
                        {isStaff && (
                          <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                            Support
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-medium text-gray-500">
                        {isStaff ? "support@fooddelivery.com" : user?.email}
                      </p>
                    </div>
                  </div>

                  {/* Timestamp */}
                  <div className="text-right sm:text-right text-sm font-medium text-gray-400 shrink-0">
                    {new Date(message.createdAt).toLocaleDateString()} <br className="hidden sm:block" />
                    {new Date(message.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </div>

                </div>

                {/* Message Content */}
                <div className="pl-0 sm:pl-16">
                  <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {message.text}
                  </div>
                  {message.attachmentUrl && (
                    <div className="mt-4">
                      <a
                        href={message.attachmentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 transition-colors"
                      >
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                        View Attachment
                      </a>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reply Section */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 sm:p-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Reply to Ticket</h3>
          
          {ticket.status === "resolved" ? (
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mx-auto mb-3">
                <CheckCircle2 size={24} />
              </div>
              <h4 className="font-bold text-gray-900 mb-1">This ticket is resolved</h4>
              <p className="text-gray-500 text-sm">
                If you have a new issue, please create a new support ticket.
              </p>
            </div>
          ) : (
            <form onSubmit={handleReplySubmit}>
              <div className="mb-4">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  rows={4}
                  placeholder="Type your reply here..."
                  className="block w-full px-4 py-3 border border-gray-200 rounded-2xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all font-medium text-gray-700 resize-none"
                  required
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting || !newMessage.trim()}
                  className="inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-red-600/20 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none disabled:hover:scale-100"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      Send Reply
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
