import { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/stores/useAuthStore";
import { useGetQuery } from "@/hooks/mutate/useGetQuery";
import { useQueryMutation } from "@/hooks/mutate/useQueryMutation";
import { showToast } from "@/utils/toast";
import { useCurrency } from "@/hooks/useCurrency";

// ── Support ticket constants ─────────────────────────────────────────────────

const TICKET_TYPES = [
  { label: "Order Issue", value: "order_issue" },
  { label: "Payment Issue", value: "payment_issue" },
  { label: "Account Management", value: "account_management" },
  { label: "Report a Bug", value: "bug_report" },
  { label: "General Inquiry", value: "general_inquiry" },
];

const formatStatus = (status: string) => {
  switch (status) {
    case "open": return "Open";
    case "in_progress": return "In Progress";
    case "resolved": return "Resolved";
    case "pending": return "Pending";
    case "approved": return "Approved";
    case "rejected": return "Rejected";
    case "paid": return "Paid";
    default: return status;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "open": return { bg: "bg-orange-100", text: "text-orange-700", dot: "bg-orange-500" };
    case "in_progress": return { bg: "bg-blue-100", text: "text-blue-700", dot: "bg-blue-500" };
    case "resolved": return { bg: "bg-emerald-100", text: "text-emerald-700", dot: "bg-emerald-500" };
    case "pending": return { bg: "bg-amber-100", text: "text-amber-700", dot: "bg-amber-500" };
    case "approved": return { bg: "bg-blue-100", text: "text-blue-700", dot: "bg-blue-500" };
    case "rejected": return { bg: "bg-red-100", text: "text-red-700", dot: "bg-red-500" };
    case "paid": return { bg: "bg-emerald-100", text: "text-emerald-700", dot: "bg-emerald-500" };
    default: return { bg: "bg-gray-100", text: "text-gray-700", dot: "bg-gray-500" };
  }
};

const formatType = (type: string) => {
  return type.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
};

// ── Main component ───────────────────────────────────────────────────────────

export default function SupportScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { currencySymbol } = useCurrency();

  // Tab state: "support" | "withdraw"
  const [activeTab, setActiveTab] = useState<"support" | "withdraw">("support");

  // ── Support state ──────────────────────────────────────────────────────────
  const [showForm, setShowForm] = useState(false);
  const [selectedType, setSelectedType] = useState("");
  const [message, setMessage] = useState("");
  const [showTypePicker, setShowTypePicker] = useState(false);

  const { data: ticketsData, isLoading: ticketsLoading, refetch: refetchTickets, isFetching: ticketsFetching } = useGetQuery<any>({
    url: "/support",
    queryKey: "rider-support-tickets",
  });
  const tickets = ticketsData?.tickets || [];

  const { mutate: createTicket, isLoading: isSubmitting } = useQueryMutation({ url: "/support" });

  const handleSubmitTicket = () => {
    if (!selectedType) { showToast({ text: "Please select a topic", type: "error" }); return; }
    if (!message || message.length < 10) { showToast({ text: "Message must be at least 10 characters", type: "error" }); return; }
    createTicket(
      { type: selectedType, message },
      {
        onSuccess: () => {
          showToast({ text: "Ticket submitted successfully!", type: "success" });
          setSelectedType(""); setMessage(""); setShowForm(false);
          refetchTickets();
        },
        onError: (err: any) => {
          showToast({ text: err?.response?.data?.message || "Failed to submit ticket", type: "error" });
        },
      }
    );
  };

  // ── Withdrawal state ───────────────────────────────────────────────────────
  const [showWithdrawForm, setShowWithdrawForm] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountHolderName, setAccountHolderName] = useState("");
  const [branchName, setBranchName] = useState("");
  const [withdrawNotes, setWithdrawNotes] = useState("");

  const { data: balanceData, refetch: refetchBalance } = useGetQuery<any>({
    url: "/rider/withdrawals/balance",
    queryKey: "rider-available-balance",
  });
  const availableBalance = balanceData?.availableBalance ?? 0;

  const { data: withdrawalsData, isLoading: withdrawalsLoading, refetch: refetchWithdrawals, isFetching: withdrawalsFetching } = useGetQuery<any[]>({
    url: "/rider/withdrawals",
    queryKey: "rider-withdrawals",
  });
  const withdrawals = withdrawalsData || [];

  const { mutate: submitWithdrawal, isLoading: isWithdrawing } = useQueryMutation({ url: "/rider/withdrawals" });

  const handleSubmitWithdrawal = () => {
    const amt = parseFloat(withdrawAmount);
    if (!amt || amt <= 0) { showToast({ text: "Enter a valid amount", type: "error" }); return; }
    if (amt > availableBalance) { showToast({ text: "Amount exceeds available balance", type: "error" }); return; }
    if (!bankName.trim()) { showToast({ text: "Bank name is required", type: "error" }); return; }
    if (!accountNumber.trim()) { showToast({ text: "Account number is required", type: "error" }); return; }
    if (!accountHolderName.trim()) { showToast({ text: "Account holder name is required", type: "error" }); return; }

    submitWithdrawal(
      { amount: amt, bankName: bankName.trim(), accountNumber: accountNumber.trim(), accountHolderName: accountHolderName.trim(), branchName: branchName.trim() || undefined, riderNotes: withdrawNotes.trim() || undefined },
      {
        onSuccess: () => {
          showToast({ text: "Withdrawal request submitted!", type: "success" });
          setWithdrawAmount(""); setBankName(""); setAccountNumber(""); setAccountHolderName(""); setBranchName(""); setWithdrawNotes("");
          setShowWithdrawForm(false);
          refetchWithdrawals(); refetchBalance();
        },
        onError: (err: any) => {
          showToast({ text: err?.response?.data?.message || "Failed to submit request", type: "error" });
        },
      }
    );
  };

  const onRefresh = useCallback(() => {
    if (activeTab === "support") refetchTickets();
    else { refetchWithdrawals(); refetchBalance(); }
  }, [activeTab]);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      {/* Header */}
      <View className="px-6 py-4 bg-white border-b border-gray-100 flex-row justify-between items-center">
        <TouchableOpacity onPress={() => router.back()} className="p-1">
          <Ionicons name="chevron-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900">Help & Support</Text>
        <TouchableOpacity
          onPress={() => activeTab === "support" ? setShowForm(!showForm) : setShowWithdrawForm(!showWithdrawForm)}
        >
          <Ionicons
            name={(activeTab === "support" ? showForm : showWithdrawForm) ? "close" : "add-circle-outline"}
            size={28}
            color={(activeTab === "support" ? showForm : showWithdrawForm) ? "#ef4444" : "#10b981"}
          />
        </TouchableOpacity>
      </View>

      {/* Tab Bar */}
      <View className="flex-row bg-white border-b border-gray-100 px-4">
        <TouchableOpacity
          className={`flex-1 py-3 items-center border-b-2 ${activeTab === "support" ? "border-emerald-500" : "border-transparent"}`}
          onPress={() => setActiveTab("support")}
        >
          <View className="flex-row items-center">
            <Ionicons name="chatbubbles-outline" size={18} color={activeTab === "support" ? "#10b981" : "#9ca3af"} />
            <Text className={`ml-2 font-bold ${activeTab === "support" ? "text-emerald-600" : "text-gray-400"}`}>Support</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          className={`flex-1 py-3 items-center border-b-2 ${activeTab === "withdraw" ? "border-emerald-500" : "border-transparent"}`}
          onPress={() => setActiveTab("withdraw")}
        >
          <View className="flex-row items-center">
            <Ionicons name="wallet-outline" size={18} color={activeTab === "withdraw" ? "#10b981" : "#9ca3af"} />
            <Text className={`ml-2 font-bold ${activeTab === "withdraw" ? "text-emerald-600" : "text-gray-400"}`}>Withdraw</Text>
          </View>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView
          className="flex-1"
          refreshControl={<RefreshControl refreshing={(activeTab === "support" ? ticketsFetching : withdrawalsFetching) && !(activeTab === "support" ? ticketsLoading : withdrawalsLoading)} onRefresh={onRefresh} />}
        >
          {activeTab === "support" ? renderSupportTab() : renderWithdrawTab()}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );

  // ── Support Tab ────────────────────────────────────────────────────────────

  function renderSupportTab() {
    return (
      <>
        {showForm && (
          <View className="m-4 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <View className="p-4 border-b border-gray-50 bg-emerald-50/50">
              <Text className="text-lg font-bold text-gray-900">New Ticket</Text>
              <Text className="text-sm text-gray-500 mt-1">Describe your issue and we{"'"}ll get back to you.</Text>
            </View>
            <View className="p-4 space-y-4">
              {/* Type Picker */}
              <View>
                <Text className="text-sm font-semibold text-gray-700 mb-2">Topic <Text className="text-red-500">*</Text></Text>
                <TouchableOpacity
                  className="flex-row items-center justify-between px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl"
                  onPress={() => setShowTypePicker(!showTypePicker)}
                >
                  <Text className={`text-base ${selectedType ? "text-gray-900 font-medium" : "text-gray-400"}`}>
                    {selectedType ? TICKET_TYPES.find((t) => t.value === selectedType)?.label : "Select a topic"}
                  </Text>
                  <Ionicons name={showTypePicker ? "chevron-up" : "chevron-down"} size={20} color="#9ca3af" />
                </TouchableOpacity>
                {showTypePicker && (
                  <View className="mt-2 bg-white border border-gray-200 rounded-xl overflow-hidden">
                    {TICKET_TYPES.map((type) => (
                      <TouchableOpacity
                        key={type.value}
                        className={`px-4 py-3 border-b border-gray-50 flex-row items-center justify-between ${selectedType === type.value ? "bg-emerald-50" : ""}`}
                        onPress={() => { setSelectedType(type.value); setShowTypePicker(false); }}
                      >
                        <Text className={`text-base ${selectedType === type.value ? "text-emerald-700 font-bold" : "text-gray-700"}`}>{type.label}</Text>
                        {selectedType === type.value && <Ionicons name="checkmark-circle" size={20} color="#059669" />}
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
              {/* Message */}
              <View className="mt-4">
                <Text className="text-sm font-semibold text-gray-700 mb-2">Message <Text className="text-red-500">*</Text></Text>
                <TextInput
                  className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-base text-gray-900 min-h-[120px]"
                  multiline numberOfLines={5} textAlignVertical="top"
                  placeholder="Describe your issue in detail..." placeholderTextColor="#9ca3af"
                  value={message} onChangeText={setMessage}
                />
              </View>
              {/* Submit */}
              <TouchableOpacity
                className={`mt-4 flex-row items-center justify-center py-4 rounded-xl ${isSubmitting ? "bg-emerald-400" : "bg-emerald-600"}`}
                onPress={handleSubmitTicket} disabled={isSubmitting}
              >
                {isSubmitting ? <ActivityIndicator color="white" size="small" /> : (
                  <><Ionicons name="send" size={18} color="white" /><Text className="text-white font-bold text-base ml-2">Submit Ticket</Text></>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Tickets List */}
        <View className="px-4 pt-4 pb-2">
          <Text className="text-lg font-bold text-gray-900">Your Tickets</Text>
          <Text className="text-sm text-gray-500 mt-0.5">{tickets.length} ticket{tickets.length !== 1 ? "s" : ""}</Text>
        </View>

        {ticketsLoading ? (
          <View className="flex-1 items-center justify-center py-20"><ActivityIndicator size="large" color="#10b981" /></View>
        ) : tickets.length === 0 ? (
          <View className="flex-1 items-center justify-center py-20 px-8">
            <Ionicons name="help-buoy-outline" size={64} color="#d1d5db" />
            <Text className="text-lg font-bold text-gray-900 mt-4 mb-2">No tickets yet</Text>
            <Text className="text-gray-500 text-center">Tap the + button above to create a new support ticket.</Text>
          </View>
        ) : (
          <View className="px-4 pb-8 space-y-3">
            {tickets.map((ticket: any) => {
              const sc = getStatusColor(ticket.status);
              return (
                <View key={ticket.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                  <View className="flex-row justify-between items-start mb-2">
                    <Text className="text-xs font-bold text-gray-400">{ticket.ticketNumber}</Text>
                    <View className={`flex-row items-center px-2.5 py-1 rounded-full ${sc.bg}`}>
                      <View className={`w-1.5 h-1.5 rounded-full mr-1.5 ${sc.dot}`} />
                      <Text className={`text-xs font-bold ${sc.text}`}>{formatStatus(ticket.status)}</Text>
                    </View>
                  </View>
                  <Text className="text-base font-bold text-gray-900 mb-1" numberOfLines={2}>{ticket.subject}</Text>
                  <View className="flex-row items-center justify-between mt-3">
                    <View className="bg-gray-100 px-2.5 py-1 rounded-md">
                      <Text className="text-xs font-medium text-gray-600">{formatType(ticket.type)}</Text>
                    </View>
                    <Text className="text-xs text-gray-400 font-medium">{new Date(ticket.createdAt).toLocaleDateString()}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </>
    );
  }

  // ── Withdraw Tab ───────────────────────────────────────────────────────────

  function renderWithdrawTab() {
    return (
      <>
        {/* Balance Card */}
        <View className="m-4 bg-emerald-500 rounded-2xl p-5 shadow-sm">
          <Text className="text-emerald-50 text-sm mb-1">Available Balance</Text>
          <Text className="text-white text-3xl font-bold">{currencySymbol}{Number(availableBalance).toFixed(2)}</Text>
          {!showWithdrawForm && availableBalance > 0 && (
            <TouchableOpacity
              className="bg-white mt-4 py-3 rounded-xl items-center"
              onPress={() => setShowWithdrawForm(true)}
            >
              <Text className="text-emerald-600 font-bold">Request Withdrawal</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Withdrawal Form */}
        {showWithdrawForm && (
          <View className="mx-4 mb-4 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <View className="p-4 border-b border-gray-50 bg-emerald-50/50">
              <Text className="text-lg font-bold text-gray-900">Withdrawal Request</Text>
              <Text className="text-sm text-gray-500 mt-1">Enter your bank details to receive payment.</Text>
            </View>
            <View className="p-4">
              {/* Amount */}
              <View className="mb-4">
                <Text className="text-sm font-semibold text-gray-700 mb-2">Amount ({currencySymbol}) <Text className="text-red-500">*</Text></Text>
                <TextInput
                  className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-base text-gray-900"
                  keyboardType="decimal-pad" placeholder="0.00" placeholderTextColor="#9ca3af"
                  value={withdrawAmount} onChangeText={setWithdrawAmount}
                />
                <Text className="text-xs text-gray-400 mt-1">Max: {currencySymbol}{Number(availableBalance).toFixed(2)}</Text>
              </View>
              {/* Bank Name */}
              <View className="mb-4">
                <Text className="text-sm font-semibold text-gray-700 mb-2">Bank Name <Text className="text-red-500">*</Text></Text>
                <TextInput
                  className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-base text-gray-900"
                  placeholder="e.g. Dutch Bangla Bank" placeholderTextColor="#9ca3af"
                  value={bankName} onChangeText={setBankName}
                />
              </View>
              {/* Account Number */}
              <View className="mb-4">
                <Text className="text-sm font-semibold text-gray-700 mb-2">Account Number <Text className="text-red-500">*</Text></Text>
                <TextInput
                  className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-base text-gray-900"
                  placeholder="Your account number" placeholderTextColor="#9ca3af"
                  value={accountNumber} onChangeText={setAccountNumber} keyboardType="number-pad"
                />
              </View>
              {/* Account Holder */}
              <View className="mb-4">
                <Text className="text-sm font-semibold text-gray-700 mb-2">Account Holder Name <Text className="text-red-500">*</Text></Text>
                <TextInput
                  className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-base text-gray-900"
                  placeholder="Name on the bank account" placeholderTextColor="#9ca3af"
                  value={accountHolderName} onChangeText={setAccountHolderName}
                />
              </View>
              {/* Branch (optional) */}
              <View className="mb-4">
                <Text className="text-sm font-semibold text-gray-700 mb-2">Branch Name</Text>
                <TextInput
                  className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-base text-gray-900"
                  placeholder="Optional" placeholderTextColor="#9ca3af"
                  value={branchName} onChangeText={setBranchName}
                />
              </View>
              {/* Notes (optional) */}
              <View className="mb-4">
                <Text className="text-sm font-semibold text-gray-700 mb-2">Notes</Text>
                <TextInput
                  className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-base text-gray-900 min-h-[80px]"
                  multiline textAlignVertical="top" placeholder="Any additional info..." placeholderTextColor="#9ca3af"
                  value={withdrawNotes} onChangeText={setWithdrawNotes}
                />
              </View>
              {/* Submit */}
              <TouchableOpacity
                className={`flex-row items-center justify-center py-4 rounded-xl ${isWithdrawing ? "bg-emerald-400" : "bg-emerald-600"}`}
                onPress={handleSubmitWithdrawal} disabled={isWithdrawing}
              >
                {isWithdrawing ? <ActivityIndicator color="white" size="small" /> : (
                  <><Ionicons name="arrow-up-circle" size={20} color="white" /><Text className="text-white font-bold text-base ml-2">Submit Request</Text></>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Withdrawal History */}
        <View className="px-4 pt-2 pb-2">
          <Text className="text-lg font-bold text-gray-900">Withdrawal History</Text>
          <Text className="text-sm text-gray-500 mt-0.5">{withdrawals.length} request{withdrawals.length !== 1 ? "s" : ""}</Text>
        </View>

        {withdrawalsLoading ? (
          <View className="items-center py-20"><ActivityIndicator size="large" color="#10b981" /></View>
        ) : withdrawals.length === 0 ? (
          <View className="items-center justify-center py-20 px-8">
            <Ionicons name="wallet-outline" size={64} color="#d1d5db" />
            <Text className="text-lg font-bold text-gray-900 mt-4 mb-2">No withdrawals yet</Text>
            <Text className="text-gray-500 text-center">Your withdrawal requests will appear here.</Text>
          </View>
        ) : (
          <View className="px-4 pb-8 space-y-3">
            {withdrawals.map((w: any) => {
              const sc = getStatusColor(w.status);
              return (
                <View key={w.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                  <View className="flex-row justify-between items-start mb-2">
                    <Text className="text-2xl font-bold text-gray-900">{currencySymbol}{Number(w.amount).toFixed(2)}</Text>
                    <View className={`flex-row items-center px-2.5 py-1 rounded-full ${sc.bg}`}>
                      <View className={`w-1.5 h-1.5 rounded-full mr-1.5 ${sc.dot}`} />
                      <Text className={`text-xs font-bold ${sc.text}`}>{formatStatus(w.status)}</Text>
                    </View>
                  </View>
                  <View className="flex-row items-center mt-1 mb-2">
                    <Ionicons name="business-outline" size={14} color="#6b7280" />
                    <Text className="text-gray-600 text-sm ml-1.5">{w.bankName} • {w.accountNumber}</Text>
                  </View>
                  <View className="flex-row items-center justify-between mt-2 pt-2 border-t border-gray-50">
                    <Text className="text-xs text-gray-400">{w.accountHolderName}</Text>
                    <Text className="text-xs text-gray-400 font-medium">{new Date(w.createdAt).toLocaleDateString()}</Text>
                  </View>
                  {w.adminNotes && (
                    <View className="mt-2 bg-blue-50 p-2.5 rounded-lg">
                      <Text className="text-xs text-blue-700"><Text className="font-bold">Admin: </Text>{w.adminNotes}</Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}
      </>
    );
  }
}
