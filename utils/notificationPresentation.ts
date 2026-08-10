export const notificationTitle = (notification: any): string => {
  if (notification?.title) return notification.title;
  const labels: Record<string, string> = {
    announcement: "Announcement",
    event: "Event update",
    event_reminder: "Event reminder",
    payment_reminder: "Payment reminder",
    payment: "Payment update",
    order: "Order update",
    subscription: "Membership update",
    donation: "Donation update",
    volunteer: "Volunteer update",
    training: "Training update",
    message: "New message",
    reply: "New reply",
    custom: "CMDA update",
  };
  return labels[notification?.type] || "CMDA update";
};

export const notificationDestination = (notification: any) => {
  const data = notification?.data || {};
  if ((data.slug || data.eventSlug) && ["event", "event_reminder"].includes(notification?.type)) {
    return { tab: "events", screen: "events-single", params: { slug: data.slug || data.eventSlug }, label: "View event" };
  }
  if (data.orderId) {
    return { tab: "more", screen: "more-store-orders-single", params: { id: data.orderId }, label: "View order" };
  }
  if (["payment", "payment_reminder", "subscription", "donation"].includes(notification?.type)) {
    return { tab: "payment", screen: "pay-index", label: "View payments" };
  }
  if (notification?.type === "volunteer") {
    return { tab: "home", screen: "home-volunteer-applications", label: "View volunteering" };
  }
  if (["message", "reply", "message_received"].includes(notification?.type)) {
    return { tab: "home", screen: "home-messages", label: "Open messages" };
  }
  return null;
};
