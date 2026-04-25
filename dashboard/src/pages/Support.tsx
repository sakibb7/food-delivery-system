import { useState, useEffect } from "react";
import { 
  MessageSquare, 
  Search, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  X,
  Send,
  Paperclip,
  MoreVertical,
  User,
  Bike,
  Store,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { privateInstance } from "../configs/axiosConfig";

interface TicketMessage {
  id: number;
  senderType: string;
  senderId: number;
  text: string;
  createdAt: string;
  senderName: string;
}

interface Ticket {
  id: number;
  ticketNumber: string;
  subject: string;
  type: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  sender: string;
  senderEmail: string;
  senderRole: string;
}

interface TicketDetail extends Ticket {
  userId: number;
  messages: TicketMessage[];
}

export default function Support() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [isLoading, setIsLoading] = useState(true);
  
  const [selectedTicket, setSelectedTicket] = useState<TicketDetail | null>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  // Fetch all tickets on mount and when filters change
  useEffect(() => {
    fetchTickets();
  }, [filterRole, filterStatus, searchTerm]);

  const fetchTickets = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (filterStatus !== "All") params.append("status", filterStatus);
      if (filterRole !== "All") params.append("role", filterRole);
      if (searchTerm) params.append("search", searchTerm);

      const res = await privateInstance.get(`/support/admin/all?${params.toString()}`);
      setTickets(res.data.tickets);
    } catch (error) {
      console.error("Failed to fetch tickets:", error);
      toast.error("Failed to load tickets.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTicketDetail = async (ticketId: number) => {
    try {
      setIsLoadingDetail(true);
      const res = await privateInstance.get(`/support/${ticketId}`);
      setSelectedTicket({
        ...res.data.ticket,
        messages: res.data.messages,
      });
    } catch (error) {
      console.error("Failed to fetch ticket detail:", error);
      toast.error("Failed to load ticket details.");
    } finally {
      setIsLoadingDetail(false);
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

  const formatType = (type: string) => {
    return type
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "user": return <User size={14} className="text-gray-500" />;
      case "rider": return <Bike size={14} className="text-indigo-500" />;
      case "restaurant": return <Store size={14} className="text-emerald-500" />;
      default: return <User size={14} className="text-gray-500" />;
    }
  };

  const formatRole = (role: string) => {
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyMessage.trim() || !selectedTicket) return;

    setIsSubmitting(true);

    try {
      await privateInstance.post(`/support/${selectedTicket.id}/reply`, {
        text: replyMessage,
      });

      setReplyMessage("");
      toast.success("Reply sent successfully");

      // Refresh ticket detail and list
      await fetchTicketDetail(selectedTicket.id);
      await fetchTickets();
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || "Failed to send reply.";
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResolve = async () => {
    if (!selectedTicket) return;
    
    try {
      await privateInstance.patch(`/support/${selectedTicket.id}/status`, {
        status: "resolved",
      });

      toast.success("Ticket marked as resolved");

      // Refresh
      await fetchTicketDetail(selectedTicket.id);
      await fetchTickets();
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || "Failed to update ticket.";
      toast.error(errorMsg);
    }
  };

  const handleReopen = async () => {
    if (!selectedTicket) return;
    
    try {
      await privateInstance.patch(`/support/${selectedTicket.id}/status`, {
        status: "open",
      });

      toast.success("Ticket reopened");

      // Refresh
      await fetchTicketDetail(selectedTicket.id);
      await fetchTickets();
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || "Failed to reopen ticket.";
      toast.error(errorMsg);
    }
  };

  const handleSelectTicket = (ticket: Ticket) => {
    fetchTicketDetail(ticket.id);
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex gap-6 overflow-hidden">
      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden ${selectedTicket ? 'hidden lg:flex' : 'flex'}`}>
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <MessageSquare className="text-orange-500" />
              Support Tickets
            </h1>
            <p className="text-gray-500 text-sm mt-1">Manage and respond to user inquiries.</p>
          </div>
          <div className="flex gap-2">
             <div className="px-4 py-2 bg-orange-50 text-orange-700 rounded-lg font-semibold text-sm border border-orange-100 flex items-center gap-2">
               <AlertCircle size={16} />
               {tickets.filter(t => t.status === "open").length} Open Tickets
             </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search by ID, subject, or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
            />
          </div>
          
          <div className="flex gap-3">
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm font-medium text-gray-700 cursor-pointer"
            >
              <option value="All">All Roles</option>
              <option value="User">Users</option>
              <option value="Rider">Riders</option>
              <option value="Restaurant">Restaurants</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm font-medium text-gray-700 cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
        </div>

        {/* Tickets List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
               <Loader2 size={40} className="animate-spin mb-4" />
               <p className="font-medium text-gray-500">Loading tickets...</p>
            </div>
          ) : tickets.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
               <MessageSquare size={48} className="mb-4 opacity-20" />
               <p className="font-medium text-gray-500">No tickets found</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 sticky top-0 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Ticket</th>
                  <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Sender</th>
                  <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Subject</th>
                  <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {tickets.map((ticket) => (
                  <tr 
                    key={ticket.id} 
                    onClick={() => handleSelectTicket(ticket)}
                    className={`cursor-pointer hover:bg-orange-50/50 transition-colors ${selectedTicket?.id === ticket.id ? 'bg-orange-50' : ''}`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-bold text-gray-900">{ticket.ticketNumber}</span>
                      <p className="text-xs text-gray-500 mt-0.5">{formatType(ticket.type)}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                          {getRoleIcon(ticket.senderRole)}
                        </div>
                        <div>
                          <p>{ticket.sender}</p>
                          <p className="text-xs text-gray-500 font-normal">{formatRole(ticket.senderRole)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900 font-medium line-clamp-2 max-w-xs">{ticket.subject}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusBadge(ticket.status)}`}>
                        {getStatusIcon(ticket.status)}
                        {formatStatus(ticket.status)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(ticket.createdAt), "MMM d, yyyy")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Slide-out / Detail Panel */}
      {selectedTicket && (
        <div className={`w-full lg:w-[500px] flex-shrink-0 bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col overflow-hidden`}>
          {/* Header */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setSelectedTicket(null)}
                className="lg:hidden p-1.5 hover:bg-gray-200 rounded-lg text-gray-500"
              >
                <X size={20} />
              </button>
              <div>
                <h2 className="font-bold text-gray-900 flex items-center gap-2">
                  {selectedTicket.ticketNumber}
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    selectedTicket.status === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                  }`}>
                    {formatStatus(selectedTicket.status)}
                  </span>
                </h2>
                <p className="text-xs text-gray-500">{formatType(selectedTicket.type)}</p>
              </div>
            </div>
            <div className="flex gap-2">
               {selectedTicket.status !== "resolved" && (
                 <button 
                   onClick={handleResolve}
                   className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-700 hover:bg-green-50 hover:text-green-600 hover:border-green-200 transition-colors"
                 >
                   Mark Resolved
                 </button>
               )}
               <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg">
                 <MoreVertical size={20} />
               </button>
            </div>
          </div>

          {/* User Info */}
          <div className="p-4 border-b border-gray-100 flex items-center gap-4">
             <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
               {getRoleIcon(selectedTicket.senderRole)}
             </div>
             <div className="flex-1">
               <h3 className="font-bold text-gray-900">{selectedTicket.sender}</h3>
               <p className="text-sm text-gray-500">{selectedTicket.senderEmail} • {formatRole(selectedTicket.senderRole)}</p>
             </div>
          </div>

          <div className="p-4 border-b border-gray-100 bg-orange-50/30">
            <h4 className="text-sm font-bold text-gray-900 mb-1">Subject</h4>
            <p className="text-sm text-gray-700">{selectedTicket.subject}</p>
          </div>

          {/* Messages Thread */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
            {isLoadingDetail ? (
              <div className="h-full flex items-center justify-center">
                <Loader2 size={32} className="animate-spin text-gray-400" />
              </div>
            ) : (
              selectedTicket.messages?.map((msg) => (
                <div key={msg.id} className={`flex flex-col ${msg.senderType === 'staff' ? 'items-end' : 'items-start'}`}>
                   <div className="flex items-center gap-2 mb-1 px-1">
                     <span className="text-xs font-bold text-gray-500">
                       {msg.senderType === 'staff' ? 'Support Team' : selectedTicket.sender}
                     </span>
                     <span className="text-[10px] text-gray-400">
                       {format(new Date(msg.createdAt), "h:mm a")}
                     </span>
                   </div>
                   <div className={`p-3 max-w-[85%] rounded-2xl text-sm ${
                     msg.senderType === 'staff' 
                      ? 'bg-orange-500 text-white rounded-tr-sm' 
                      : 'bg-white border border-gray-200 text-gray-800 rounded-tl-sm'
                   }`}>
                     {msg.text}
                   </div>
                </div>
              ))
            )}
          </div>

          {/* Reply Box */}
          <div className="p-4 border-t border-gray-200 bg-white">
            {selectedTicket.status === "resolved" ? (
              <div className="text-center py-4 bg-gray-50 rounded-xl border border-gray-200">
                <CheckCircle2 className="mx-auto h-8 w-8 text-green-500 mb-2" />
                <p className="text-sm font-medium text-gray-600">This ticket has been resolved.</p>
                <button 
                  onClick={handleReopen}
                  className="mt-2 text-sm font-bold text-orange-600 hover:text-orange-700"
                >
                  Reopen Ticket
                </button>
              </div>
            ) : (
              <form onSubmit={handleReply}>
                <div className="relative">
                  <textarea
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder="Type your reply..."
                    rows={3}
                    className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none text-sm"
                  />
                  <div className="absolute right-2 bottom-2 flex items-center gap-1">
                    <button type="button" className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-colors">
                      <Paperclip size={18} />
                    </button>
                    <button 
                      type="submit"
                      disabled={isSubmitting || !replyMessage.trim()}
                      className="p-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isSubmitting ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <Send size={18} />
                      )}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
