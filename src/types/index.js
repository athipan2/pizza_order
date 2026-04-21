export const OrderStatus = {
  PENDING_PAYMENT: 'รอชำระเงิน',
  PAID: 'ชำระแล้ว',
  PREPARING: 'กำลังทำ',
  DELIVERED: 'ส่งแล้ว',
  COMPLETED: 'เสร็จสิ้น'
};

export const PaymentMethod = {
  PROMPTPAY: 'สแกน QR PromptPay',
  BANK_TRANSFER: 'โอนบัญชี',
  COD: 'เก็บเงินปลายทาง'
};

export const DeliveryMethod = {
  DELIVERY: 'เดลิเวอรี่',
  PICKUP: 'รับหน้าร้าน'
};
