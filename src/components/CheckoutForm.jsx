import { useState } from 'react';
import { Upload, CreditCard, QrCode, Banknote, ArrowLeft } from 'lucide-react';
import { PaymentMethod, DeliveryMethod } from '../types';

function CheckoutForm({ cartItems, total, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    deliveryMethod: DeliveryMethod.DELIVERY,
    paymentMethod: PaymentMethod.PROMPTPAY
  });
  const [slipFile, setSlipFile] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      slipFile,
      cartItems,
      total
    });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSlipFile(e.target.files[0]);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-primary-200 overflow-hidden">
      <button
        type="button"
        onClick={onCancel}
        className="flex items-center gap-2 text-gray-600 hover:text-primary-600 font-medium transition-colors px-4 pt-4 pb-2"
      >
        <ArrowLeft size={20} />
        กลับไปหน้าตะกร้า / เมนูอาหาร
      </button>
      <div className="px-4 pb-4 bg-white">
        <h2 className="font-bold text-lg text-gray-900">ยืนยันการสั่งซื้อ</h2>
        <p className="text-sm text-gray-500">กรอกข้อมูลเพื่อดำเนินการสั่งซื้อ</p>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-4 sm:space-y-4">
        {/* ข้อมูลลูกค้า */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ชื่อ-นามสกุล <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-3.5 sm:py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-400 focus:border-transparent outline-none text-base"
            placeholder="กรอกชื่อ-นามสกุล"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            เบอร์โทรศัพท์ <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            required
            pattern="[0-9]{10}"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-4 py-3.5 sm:py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-400 focus:border-transparent outline-none text-base"
            placeholder="กรอกเบอร์โทรศัพท์ 10 หลัก"
            inputMode="numeric"
          />
        </div>

        {/* วิธีรับสินค้า */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            วิธีรับสินค้า <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, deliveryMethod: DeliveryMethod.DELIVERY })}
              className={`p-4 sm:p-3 rounded-xl border-2 text-center transition-colors text-sm sm:text-base ${
                formData.deliveryMethod === DeliveryMethod.DELIVERY
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-gray-200 text-gray-600 active:border-primary-300'
              }`}
            >
              🚚 เดลิเวอรี่
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, deliveryMethod: DeliveryMethod.PICKUP })}
              className={`p-4 sm:p-3 rounded-xl border-2 text-center transition-colors text-sm sm:text-base ${
                formData.deliveryMethod === DeliveryMethod.PICKUP
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-gray-200 text-gray-600 active:border-primary-300'
              }`}
            >
              🏪 รับหน้าร้าน
            </button>
          </div>
        </div>

        {/* ที่อยู่ - แสดงเฉพาะเมื่อเลือกเดลิเวอรี่ */}
        {formData.deliveryMethod === DeliveryMethod.DELIVERY ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ที่อยู่จัดส่ง <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-400 focus:border-transparent outline-none resize-none"
              placeholder="กรอกที่อยู่จัดส่ง"
            />
          </div>
        ) : (
          /* รับหน้าร้าน - แสดงข้อความแจ้งเตือน */
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
            <p className="text-sm text-blue-700 flex items-center gap-2">
              <span>🏪</span>
              <span>ลูกค้าสามารถมารับสินค้าที่ร้านได้เลยหลังออเดอร์เสร็จ</span>
            </p>
          </div>
        )}

        {/* วิธีชำระเงิน */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            วิธีชำระเงิน <span className="text-red-500">*</span>
          </label>
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, paymentMethod: PaymentMethod.PROMPTPAY })}
              className={`w-full p-3 rounded-xl border-2 flex items-center gap-3 transition-colors ${
                formData.paymentMethod === PaymentMethod.PROMPTPAY
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-primary-300'
              }`}
            >
              <QrCode className="text-primary-500" size={24} />
              <span className="flex-1 text-left font-medium">{PaymentMethod.PROMPTPAY}</span>
              {formData.paymentMethod === PaymentMethod.PROMPTPAY && (
                <span className="text-primary-500">✓</span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setFormData({ ...formData, paymentMethod: PaymentMethod.BANK_TRANSFER })}
              className={`w-full p-3 rounded-xl border-2 flex items-center gap-3 transition-colors ${
                formData.paymentMethod === PaymentMethod.BANK_TRANSFER
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-primary-300'
              }`}
            >
              <CreditCard className="text-primary-500" size={24} />
              <span className="flex-1 text-left font-medium">{PaymentMethod.BANK_TRANSFER}</span>
              {formData.paymentMethod === PaymentMethod.BANK_TRANSFER && (
                <span className="text-primary-500">✓</span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setFormData({ ...formData, paymentMethod: PaymentMethod.COD })}
              className={`w-full p-3 rounded-xl border-2 flex items-center gap-3 transition-colors ${
                formData.paymentMethod === PaymentMethod.COD
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-primary-300'
              }`}
            >
              <Banknote className="text-primary-500" size={24} />
              <span className="flex-1 text-left font-medium">{PaymentMethod.COD}</span>
              {formData.paymentMethod === PaymentMethod.COD && (
                <span className="text-primary-500">✓</span>
              )}
            </button>
          </div>
        </div>

        {/* อัปโหลดสลิป (ถ้าเลือกโอนบัญชี) */}
        {formData.paymentMethod === PaymentMethod.BANK_TRANSFER && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              อัปโหลดสลิปโอนเงิน <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                required
                onChange={handleFileChange}
                className="hidden"
                id="slip-upload"
              />
              <label
                htmlFor="slip-upload"
                className="flex items-center justify-center gap-2 w-full p-4 border-2 border-dashed border-primary-300 rounded-xl bg-primary-50 cursor-pointer hover:bg-primary-100 transition-colors"
              >
                <Upload className="text-primary-500" size={20} />
                <span className="text-primary-700 font-medium">
                  {slipFile ? slipFile.name : 'คลิกเพื่ออัปโหลดสลิป'}
                </span>
              </label>
            </div>
          </div>
        )}

        {/* สรุปยอด */}
        <div className="bg-primary-50 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-gray-700">ยอดชำระทั้งหมด</span>
            <span className="text-2xl font-bold text-primary-700">฿{total}</span>
          </div>
        </div>

        {/* ปุ่ม */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-4 sm:py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-medium active:bg-gray-50 transition-colors text-base"
          >
            ยกเลิก
          </button>
          <button
            type="submit"
            className="flex-1 py-4 sm:py-3 rounded-xl bg-primary-500 text-white font-medium active:bg-primary-600 transition-colors text-base"
          >
            ยืนยันการสั่งซื้อ
          </button>
        </div>
      </form>
    </div>
  );
}

export default CheckoutForm;
