import { useState } from 'react';
import { Upload, CreditCard, QrCode, Banknote, ArrowLeft, MapPin, AlertCircle, Loader2, CheckCircle } from 'lucide-react';
import { PaymentMethod, DeliveryMethod } from '../types';

function CheckoutForm({ cartItems, total, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    deliveryMethod: DeliveryMethod.DELIVERY,
    paymentMethod: PaymentMethod.PROMPTPAY,
    location: null
  });
  const [slipFile, setSlipFile] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('เบราว์เซอร์ของคุณไม่รองรับการขอตำแหน่งพิกัด');
      return;
    }

    setIsGettingLocation(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setFormData(prev => ({
          ...prev,
          location: `${latitude},${longitude}`
        }));
        setIsGettingLocation(false);
      },
      (error) => {
        console.error('Geolocation error:', error);
        setIsGettingLocation(false);
        if (error.code === error.PERMISSION_DENIED) {
          setLocationError('กรุณาอนุญาตการเข้าถึงตำแหน่งเพื่อให้ทางร้านสามารถจัดส่งสินค้าได้ถูกต้อง');
        } else {
          setLocationError('ไม่สามารถดึงข้อมูลตำแหน่งได้ กรุณาลองใหม่อีกครั้ง');
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let slipData = null;
    if (slipFile) {
      // แปลงไฟล์สลิปเป็น Base64 เพื่อส่งไปยัง Apps Script
      slipData = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(slipFile);
      });
    }

    if (formData.deliveryMethod === DeliveryMethod.DELIVERY && !formData.location) {
      alert(locationError || 'กรุณาอนุญาตการเข้าถึงตำแหน่งก่อนสั่งซื้อ');
      return;
    }

    onSubmit({
      ...formData,
      slipFile: slipData,
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
          <div className="space-y-3">
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

            {/* ส่วนขอพิกัดตำแหน่ง */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                พิกัดที่อยู่จัดส่ง <span className="text-red-500">*</span>
              </label>

              {!formData.location ? (
                <button
                  type="button"
                  onClick={requestLocation}
                  disabled={isGettingLocation}
                  className={`w-full py-4 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all ${
                    locationError
                      ? 'border-red-300 bg-red-50 text-red-600'
                      : 'border-primary-300 bg-primary-50 text-primary-600 hover:bg-primary-100'
                  }`}
                >
                  {isGettingLocation ? (
                    <>
                      <Loader2 size={24} className="animate-spin" />
                      <span className="font-bold">กำลังดึงพิกัดตำแหน่ง...</span>
                    </>
                  ) : (
                    <>
                      <MapPin size={24} />
                      <span className="font-bold text-lg">กดเพื่อยืนยันตำแหน่งลูกค้า</span>
                      <p className="text-xs text-gray-500 px-4 text-center">ทางร้านขออนุญาตเข้าถึงตำแหน่งเพื่อความแม่นยำในการจัดส่ง</p>
                    </>
                  )}
                </button>
              ) : (
                <div className="p-4 rounded-xl border-2 border-green-200 bg-green-50 flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                    <CheckCircle size={24} />
                  </div>
                  <div className="flex-1">
                    <p className="text-green-800 font-bold">บันทึกพิกัดตำแหน่งแล้ว</p>
                    <p className="text-xs text-green-600">พิกัด: {formData.location}</p>
                  </div>
                  <button
                    type="button"
                    onClick={requestLocation}
                    className="text-xs font-bold text-primary-600 underline"
                  >
                    เปลี่ยนตำแหน่ง
                  </button>
                </div>
              )}

              {locationError && (
                <div className="p-3 rounded-lg bg-red-100 text-red-700 text-xs flex items-start gap-2">
                  <AlertCircle size={14} className="mt-0.5 shrink-0" />
                  <p>{locationError}</p>
                </div>
              )}
            </div>
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
