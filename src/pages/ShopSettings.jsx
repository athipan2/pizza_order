import { useState, useEffect } from 'react';
import { ArrowLeft, Save, Upload, Image as ImageIcon, X, Landmark, CreditCard, User, MessageCircle, Link, Key } from 'lucide-react';

function ShopSettings({ settings, onSave, onBack, isUpdating }) {
  const [formData, setFormData] = useState({
    bankName: '',
    accountNumber: '',
    accountHolder: '',
    qrCode: '',
    lineChannelAccessToken: '',
    lineOaId: '',
    liffId: ''
  });
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    if (settings) {
      setFormData({
        bankName: settings.bankName || '',
        accountNumber: settings.accountNumber || '',
        accountHolder: settings.accountHolder || '',
        qrCode: settings.qrCode || '',
        lineChannelAccessToken: settings.lineChannelAccessToken || '',
        lineOaId: settings.lineOaId || '',
        liffId: settings.liffId || ''
      });
      setPreviewImage(settings.qrCode || null);
    }
  }, [settings]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
        setFormData(prev => ({ ...prev, qrCode: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 p-4 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft size={24} className="text-gray-600" />
            </button>
            <h1 className="text-xl font-bold text-gray-900">⚙️ ตั้งค่าร้านค้า</h1>
          </div>
          <button
            form="settings-form"
            type="submit"
            disabled={isUpdating}
            className="flex items-center gap-2 px-6 py-2 bg-primary-500 text-white rounded-xl font-bold hover:bg-primary-600 transition-all disabled:opacity-50"
          >
            {isUpdating ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Save size={20} />
            )}
            บันทึก
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-6">
        <form id="settings-form" onSubmit={handleSubmit} className="space-y-6">
          {/* ข้อมูลธนาคาร */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-2">
              <Landmark className="text-primary-500" size={20} />
              ข้อมูลบัญชีธนาคาร
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                  <Landmark size={16} className="text-gray-400" />
                  ชื่อธนาคาร
                </label>
                <input
                  type="text"
                  value={formData.bankName}
                  onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                  placeholder="เช่น กสิกรไทย, ไทยพาณิชย์"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-400 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                  <CreditCard size={16} className="text-gray-400" />
                  เลขที่บัญชี
                </label>
                <input
                  type="text"
                  value={formData.accountNumber}
                  onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                  placeholder="000-0-00000-0"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-400 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                  <User size={16} className="text-gray-400" />
                  ชื่อเจ้าของบัญชี
                </label>
                <input
                  type="text"
                  value={formData.accountHolder}
                  onChange={(e) => setFormData({ ...formData, accountHolder: e.target.value })}
                  placeholder="นายสมชาย ใจดี"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-400 focus:border-transparent outline-none"
                />
              </div>
            </div>
          </div>

          {/* QR Code */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-2">
              <ImageIcon className="text-primary-500" size={20} />
              QR Code ของร้านค้า
            </h2>

            <div className="space-y-4">
              {previewImage ? (
                <div className="relative w-full max-w-[300px] mx-auto aspect-square">
                  <img
                    src={previewImage}
                    alt="Shop QR Code"
                    className="w-full h-full object-contain rounded-xl border border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewImage(null);
                      setFormData(prev => ({ ...prev, qrCode: '' }));
                    }}
                    className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-md"
                  >
                    <X size={18} />
                  </button>
                </div>
              ) : (
                <div className="w-full max-w-[300px] mx-auto aspect-square bg-gray-50 rounded-2xl flex flex-col items-center justify-center border-2 border-dashed border-gray-300">
                  <ImageIcon size={48} className="text-gray-300 mb-2" />
                  <p className="text-gray-500 text-sm">ยังไม่ได้อัปโหลด QR Code</p>
                </div>
              )}

              <div className="flex justify-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="qr-upload"
                />
                <label
                  htmlFor="qr-upload"
                  className="flex items-center gap-2 px-6 py-3 bg-primary-50 text-primary-600 rounded-xl cursor-pointer hover:bg-primary-100 transition-all font-bold border border-primary-100"
                >
                  <Upload size={20} />
                  อัปโหลดรูป QR Code
                </label>
              </div>
              <p className="text-center text-xs text-gray-400">
                แนะนำให้ใช้รูปจัตุรัสเพื่อให้แสดงผลได้สวยงามที่สุด
              </p>
            </div>
          </div>

          {/* ตั้งค่า LINE Messaging API */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-2">
              <MessageCircle className="text-[#00B900]" size={20} />
              ตั้งค่า LINE Messaging API
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                  <Key size={16} className="text-gray-400" />
                  Channel Access Token
                </label>
                <textarea
                  value={formData.lineChannelAccessToken}
                  onChange={(e) => setFormData({ ...formData, lineChannelAccessToken: e.target.value })}
                  placeholder="ใส่ Channel Access Token (Long-lived)"
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#00B900] focus:border-transparent outline-none font-mono text-sm"
                />
                <p className="text-[10px] text-gray-400 mt-1">ใช้สำหรับส่งข้อความอัตโนมัติหาลูกค้า</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                  <MessageCircle size={16} className="text-gray-400" />
                  LINE Official Account ID / Link
                </label>
                <input
                  type="text"
                  value={formData.lineOaId}
                  onChange={(e) => setFormData({ ...formData, lineOaId: e.target.value })}
                  placeholder="เช่น @yourshop หรือ https://line.me/R/ti/p/@yourshop"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#00B900] focus:border-transparent outline-none"
                />
                <p className="text-[10px] text-gray-400 mt-1">ลิงก์สำหรับให้ลูกค้ากดเพิ่มเพื่อน</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                  <Link size={16} className="text-gray-400" />
                  LIFF ID
                </label>
                <input
                  type="text"
                  value={formData.liffId}
                  onChange={(e) => setFormData({ ...formData, liffId: e.target.value })}
                  placeholder="เช่น 1234567890-XXXXXXXX"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#00B900] focus:border-transparent outline-none"
                />
                <p className="text-[10px] text-gray-400 mt-1">ใช้สำหรับดึง User ID ลูกค้าในหน้าติดตามออเดอร์</p>
              </div>
            </div>
          </div>
        </form>

        <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
          <h3 className="text-blue-800 font-bold mb-1 flex items-center gap-2">
            💡 คำแนะนำ
          </h3>
          <p className="text-blue-700 text-sm">
            ข้อมูลที่ตั้งค่าในหน้านี้จะแสดงให้ลูกค้าเห็นในหน้ายืนยันการสั่งซื้อ เมื่อเลือกชำระเงินผ่าน PromptPay หรือการโอนเงิน
          </p>
        </div>
      </main>
    </div>
  );
}

export default ShopSettings;
