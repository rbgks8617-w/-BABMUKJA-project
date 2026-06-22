export function createDummyPayment(orderItems, paymentMethod) {
  const totalPrice = orderItems.reduce((sum, item) => sum + item.totalPrice, 0);
  const orderNumber = `BMJ-${Date.now().toString().slice(-6)}`;

  return {
    orderNumber,
    orderItems,
    paymentMethod,
    totalPrice,
    estimatedMinutes: 15,
    paidAt: new Date().toISOString(),
  };
}
