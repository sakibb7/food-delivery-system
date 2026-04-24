import { useState } from "react";
import { 
  MessageSquare, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  X,
  Send,
  Paperclip,
  MoreVertical,
  User,
  Bike,
  Store
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

// Mock Data
const MOCK_TICKETS = [
  {
    id: "TKT-001",
    sender: "John Doe",
    role: "User",
    email: "john@example.com",
    subject: "Issue with recent order #ORD-123",
    type: "Order Issue",
    status: "Open",
    date: "2023-10-25T10:30:00Z",
    messages: [
      { sender: "user", text: "Hi, my order #ORD-123 arrived cold and some items were missing.", date: "2023-10-25T10:30:00Z" }
    ]
  },
  {
    id: "TKT-002",
    sender: "Pizza Express",
    role: "Restaurant",
    email: "contact@pizzaexpress.com",
    subject: "Cannot update payout method",
    type: "Account Management",
    status: "Resolved",
    date: "2023-10-20T14:15:00Z",
    messages: [
      { sender: "user", text: "I keep getting an error when I try to link my new bank account.", date: "2023-10-20T14:15:00Z" },
      { sender: "staff", text: "Hi there, we've refreshed your session. Please try again now.", date: "2023-10-20T15:00:00Z" },
      { sender: "user", text: "It worked! Thank you.", date: "2023-10-20T16:15:00Z" }
    ]
  },
  {
    id: "TKT-003",
    sender: "Mike Smith",
    role: "Rider",
    email: "mike.rider@example.com",
    subject: "Question about delivery fees",
    type: "General Inquiry",
    status: "In Progress",
    date: "2023-10-22T09:45:00Z",
    messages: [
      { sender: "user", text: "Can someone explain how the distance fee is calculated?", date: "2023-10-22T09:45:00Z" }
    ]
  }
];

export default function Support() {
  const [tickets, setTickets] = useState(MOCK_TICKETS);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          ticket.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          ticket.sender.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "All" || ticket.role === filterRole;
    const matchesStatus = filterStatus === "All" || ticket.status === filterStatus;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

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

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "User": return <User size={14} className="text-gray-500" />;
      case "Rider": return <Bike size={14} className="text-indigo-500" />;
      case "Restaurant": return <Store size={14} className="text-emerald-500" />;
      default: return null;
    }
  };

  const handleReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyMessage.trim() || !selectedTicket) return;

    setIsSubmitting(true);

    setTimeout(() => {
      const updatedTickets = tickets.map(t => {
        if (t.id === selectedTicket.id) {
          const updatedTicket = {
            ...t,
            status: "In Progress",
            messages: [
              ...t.messages,
              { sender: "staff", text: replyMessage, date: new Date().toISOString() }
            ]
          };
          setSelectedTicket(updatedTicket);
          return updatedTicket;
        }
        return t;
      });

      setTickets(updatedTickets);
      setReplyMessage("");
      setIsSubmitting(false);
      toast.success("Reply sent successfully");
    }, 1000);
  };

  const handleResolve = () => {
    if (!selectedTicket) return;
    
    const updatedTickets = tickets.map(t => {
      if (t.id === selectedTicket.id) {
        const updatedTicket = { ...t, status: "Resolved" };
        setSelectedTicket(updatedTicket);
        return updatedTicket;
      }
      return t;
    });

    setTickets(updatedTickets);
    toast.success("Ticket marked as resolved");
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
               {tickets.filter(t => t.status === "Open").length} Open Tickets
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
          {filteredTickets.length === 0 ? (
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
                {filteredTickets.map((ticket) => (
                  <tr 
                    key={ticket.id} 
                    onClick={() => setSelectedTicket(ticket)}
                    className={`cursor-pointer hover:bg-orange-50/50 transition-colors ${selectedTicket?.id === ticket.id ? 'bg-orange-50' : ''}`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-bold text-gray-900">{ticket.id}</span>
                      <p className="text-xs text-gray-500 mt-0.5">{ticket.type}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                          {getRoleIcon(ticket.role)}
                        </div>
                        <div>
                          <p>{ticket.sender}</p>
                          <p className="text-xs text-gray-500 font-normal">{ticket.role}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900 font-medium line-clamp-2 max-w-xs">{ticket.subject}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusBadge(ticket.status)}`}>
                        {getStatusIcon(ticket.status)}
                        {ticket.status}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(ticket.date), "MMM d, yyyy")}
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
        <div className={`w-full lg:w-[500px] flex-shrink-0 bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col overflow-hidden ${!selectedTicket ? 'hidden' : 'flex'}`}>
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
                  {selectedTicket.id}
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    selectedTicket.status === 'Resolved' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                  }`}>
                    {selectedTicket.status}
                  </span>
                </h2>
                <p className="text-xs text-gray-500">{selectedTicket.type}</p>
              </div>
            </div>
            <div className="flex gap-2">
               {selectedTicket.status !== "Resolved" && (
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
               {getRoleIcon(selectedTicket.role)}
             </div>
             <div className="flex-1">
               <h3 className="font-bold text-gray-900">{selectedTicket.sender}</h3>
               <p className="text-sm text-gray-500">{selectedTicket.email} • {selectedTicket.role}</p>
             </div>
          </div>

          <div className="p-4 border-b border-gray-100 bg-orange-50/30">
            <h4 className="text-sm font-bold text-gray-900 mb-1">Subject</h4>
            <p className="text-sm text-gray-700">{selectedTicket.subject}</p>
          </div>

          {/* Messages Thread */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
            {selectedTicket.messages.map((msg: any, idx: number) => (
              <div key={idx} className={`flex flex-col ${msg.sender === 'staff' ? 'items-end' : 'items-start'}`}>
                 <div className="flex items-center gap-2 mb-1 px-1">
                   <span className="text-xs font-bold text-gray-500">
                     {msg.sender === 'staff' ? 'Support Team' : selectedTicket.sender}
                   </span>
                   <span className="text-[10px] text-gray-400">
                     {format(new Date(msg.date), "h:mm a")}
                   </span>
                 </div>
                 <div className={`p-3 max-w-[85%] rounded-2xl text-sm ${
                   msg.sender === 'staff' 
                    ? 'bg-orange-500 text-white rounded-tr-sm' 
                    : 'bg-white border border-gray-200 text-gray-800 rounded-tl-sm'
                 }`}>
                   {msg.text}
                 </div>
              </div>
            ))}
          </div>

          {/* Reply Box */}
          <div className="p-4 border-t border-gray-200 bg-white">
            {selectedTicket.status === "Resolved" ? (
              <div className="text-center py-4 bg-gray-50 rounded-xl border border-gray-200">
                <CheckCircle2 className="mx-auto h-8 w-8 text-green-500 mb-2" />
                <p className="text-sm font-medium text-gray-600">This ticket has been resolved.</p>
                <button 
                  onClick={() => {
                     const updatedTickets = tickets.map(t => t.id === selectedTicket.id ? { ...t, status: "Open" } : t);
                     setTickets(updatedTickets);
                     setSelectedTicket({ ...selectedTicket, status: "Open" });
                  }}
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
