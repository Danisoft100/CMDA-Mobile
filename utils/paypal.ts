const PAYPAL_APPROVAL_LINK_RELATIONS = new Set([
  "approve",
  "approval_url",
  "authorization_url",
  "payer-action",
]);

export const getPayPalApprovalUrl = (order: any): string | undefined => {
  if (typeof order?.approvalUrl === "string" && order.approvalUrl) {
    return order.approvalUrl;
  }

  return order?.links?.find((link: any) => PAYPAL_APPROVAL_LINK_RELATIONS.has(link?.rel))?.href;
};
