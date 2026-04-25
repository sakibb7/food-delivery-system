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

const TICKET_TYPES = [
  { label: "Order Issue", value: "order_issue" },
  { label: "Payment Issue", value: "payment_issue" },
  { label: "Account Management", value: "account_management" },
  { label: "Report a Bug", value: "bug_report" },
  { label: "General Inquiry", value: "general_inquiry" },
];

const formatStatus = (status: string) => {
  switch (status) {
    case "open":
      return "Open";
    case "in_progress":
      return "In Progress";
    case "resolved":
      return "Resolved";
    default:
      return status;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "open":
      return { bg: "bg-orange-100", text: "text-orange-700", dot: "bg-orange-500" };
    case "in_progress":
      return { bg: "bg-blue-100", text: "text-blue-700", dot: "bg-blue-500" };
    case "resolved":
      return { bg: "bg-emerald-100", text: "text-emerald-700", dot: "bg-emerald-500" };
    default:
      return { bg: "bg-gray-100", text: "text-gray-700", dot: "bg-gray-500" };
  }
};

const formatType = (type: string) => {
  return type
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
};

export default function SupportScreen() {
  const router = useRouter();
  const { user } = useAuthStore();

  const [showForm, setShowForm] = useState(false);
  const [selectedType, setSelectedType] = useState("");
  const [message, setMessage] = useState("");
  const [showTypePicker, setShowTypePicker] = useState(false);

  // Fetch tickets
  const {
    data: ticketsData,
    isLoading,
    refetch,
    isFetching,
  } = useGetQuery<any>({
    url: "/support",
    queryKey: "rider-support-tickets",
  });

  const tickets = ticketsData?.tickets || [];

  // Create ticket mutation
  const { mutate: createTicket, isLoading: isSubmitting } = useQueryMutation({
    url: "/support",
  });

  const handleSubmit = () => {
    if (!selectedType) {
      showToast({ text: "Please select a topic", type: "error" });
      return;
    }
    if (!message || message.length < 10) {
      showToast({ text: "Message must be at least 10 characters", type: "error" });
      return;
    }

    createTicket(
      { type: selectedType, message },
      {
        onSuccess: () => {
          showToast({ text: "Ticket submitted successfully!", type: "success" });
          setSelectedType("");
          setMessage("");
          setShowForm(false);
          refetch();
        },
        onError: (err: any) => {
          const errorMsg = err?.response?.data?.message || "Failed to submit ticket";
          showToast({ text: errorMsg, type: "error" });
        },
      }
    );
  };

  const onRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      {/* Header */}
      <View className="px-6 py-4 bg-white border-b border-gray-100 flex-row justify-between items-center">
        <TouchableOpacity onPress={() => router.back()} className="p-1">
          <Ionicons name="chevron-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900">Help & Support</Text>
        <TouchableOpacity onPress={() => setShowForm(!showForm)}>
          <Ionicons
            name={showForm ? "close" : "add-circle-outline"}
            size={28}
            color={showForm ? "#ef4444" : "#10b981"}
          />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          className="flex-1"
          refreshControl={
            <RefreshControl refreshing={isFetching && !isLoading} onRefresh={onRefresh} />
          }
        >
          {/* New Ticket Form */}
          {showForm && (
            <View className="m-4 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <View className="p-4 border-b border-gray-50 bg-emerald-50/50">
                <Text className="text-lg font-bold text-gray-900">New Ticket</Text>
                <Text className="text-sm text-gray-500 mt-1">
                  Describe your issue and we{"'"}ll get back to you.
                </Text>
              </View>

              <View className="p-4 space-y-4">
                {/* Type Picker */}
                <View>
                  <Text className="text-sm font-semibold text-gray-700 mb-2">
                    Topic <Text className="text-red-500">*</Text>
                  </Text>
                  <TouchableOpacity
                    className="flex-row items-center justify-between px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl"
                    onPress={() => setShowTypePicker(!showTypePicker)}
                  >
                    <Text
                      className={`text-base ${selectedType ? "text-gray-900 font-medium" : "text-gray-400"}`}
                    >
                      {selectedType
                        ? TICKET_TYPES.find((t) => t.value === selectedType)?.label
                        : "Select a topic"}
                    </Text>
                    <Ionicons
                      name={showTypePicker ? "chevron-up" : "chevron-down"}
                      size={20}
                      color="#9ca3af"
                    />
                  </TouchableOpacity>

                  {showTypePicker && (
                    <View className="mt-2 bg-white border border-gray-200 rounded-xl overflow-hidden">
                      {TICKET_TYPES.map((type) => (
                        <TouchableOpacity
                          key={type.value}
                          className={`px-4 py-3 border-b border-gray-50 flex-row items-center justify-between ${
                            selectedType === type.value ? "bg-emerald-50" : ""
                          }`}
                          onPress={() => {
                            setSelectedType(type.value);
                            setShowTypePicker(false);
                          }}
                        >
                          <Text
                            className={`text-base ${
                              selectedType === type.value
                                ? "text-emerald-700 font-bold"
                                : "text-gray-700"
                            }`}
                          >
                            {type.label}
                          </Text>
                          {selectedType === type.value && (
                            <Ionicons name="checkmark-circle" size={20} color="#059669" />
                          )}
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>

                {/* Message Input */}
                <View className="mt-4">
                  <Text className="text-sm font-semibold text-gray-700 mb-2">
                    Message <Text className="text-red-500">*</Text>
                  </Text>
                  <TextInput
                    className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-base text-gray-900 min-h-[120px]"
                    multiline
                    numberOfLines={5}
                    textAlignVertical="top"
                    placeholder="Describe your issue in detail..."
                    placeholderTextColor="#9ca3af"
                    value={message}
                    onChangeText={setMessage}
                  />
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                  className={`mt-4 flex-row items-center justify-center py-4 rounded-xl ${
                    isSubmitting ? "bg-emerald-400" : "bg-emerald-600"
                  }`}
                  onPress={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <>
                      <Ionicons name="send" size={18} color="white" />
                      <Text className="text-white font-bold text-base ml-2">
                        Submit Ticket
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Tickets List */}
          <View className="px-4 pt-4 pb-2">
            <Text className="text-lg font-bold text-gray-900">
              Your Tickets
            </Text>
            <Text className="text-sm text-gray-500 mt-0.5">
              {tickets.length} ticket{tickets.length !== 1 ? "s" : ""}
            </Text>
          </View>

          {isLoading ? (
            <View className="flex-1 items-center justify-center py-20">
              <ActivityIndicator size="large" color="#10b981" />
            </View>
          ) : tickets.length === 0 ? (
            <View className="flex-1 items-center justify-center py-20 px-8">
              <Ionicons name="help-buoy-outline" size={64} color="#d1d5db" />
              <Text className="text-lg font-bold text-gray-900 mt-4 mb-2">
                No tickets yet
              </Text>
              <Text className="text-gray-500 text-center">
                Tap the + button above to create a new support ticket.
              </Text>
            </View>
          ) : (
            <View className="px-4 pb-8 space-y-3">
              {tickets.map((ticket: any) => {
                const statusColors = getStatusColor(ticket.status);
                return (
                  <View
                    key={ticket.id}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4"
                  >
                    <View className="flex-row justify-between items-start mb-2">
                      <Text className="text-xs font-bold text-gray-400">
                        {ticket.ticketNumber}
                      </Text>
                      <View
                        className={`flex-row items-center px-2.5 py-1 rounded-full ${statusColors.bg}`}
                      >
                        <View className={`w-1.5 h-1.5 rounded-full mr-1.5 ${statusColors.dot}`} />
                        <Text className={`text-xs font-bold ${statusColors.text}`}>
                          {formatStatus(ticket.status)}
                        </Text>
                      </View>
                    </View>

                    <Text className="text-base font-bold text-gray-900 mb-1" numberOfLines={2}>
                      {ticket.subject}
                    </Text>

                    <View className="flex-row items-center justify-between mt-3">
                      <View className="bg-gray-100 px-2.5 py-1 rounded-md">
                        <Text className="text-xs font-medium text-gray-600">
                          {formatType(ticket.type)}
                        </Text>
                      </View>
                      <Text className="text-xs text-gray-400 font-medium">
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
