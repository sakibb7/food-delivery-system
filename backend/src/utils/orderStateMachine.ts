export const VALID_ORDER_TRANSITIONS: Record<string, string[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["preparing", "cancelled"],
  preparing: ["ready_for_pickup"],
  ready_for_pickup: ["out_for_delivery"],
  out_for_delivery: ["delivered"],
  delivered: [],
  cancelled: [],
};

export const isValidTransition = (currentStatus: string, newStatus: string): boolean => {
  if (currentStatus === newStatus) return true; // No-op is valid
  const allowedNext = VALID_ORDER_TRANSITIONS[currentStatus];
  if (!allowedNext) return false;
  return allowedNext.includes(newStatus);
};
