/**
 * แปลง Google Drive URL ให้เป็น URL ที่สามารถแสดงผลใน <img> tag ได้โดยตรง
 */
export const formatDriveUrl = (url, size = 'w800') => {
  if (!url) return url;

  // If it's a data URL (Base64), return as is
  if (url.startsWith('data:')) return url;

  // ตรวจสอบว่าเป็น Google Drive URL หรือไม่
  if (url.includes('drive.google.com')) {
    let fileId = '';

    // กรณี format: drive.google.com/file/d/FILE_ID/view
    if (url.includes('/file/d/')) {
      fileId = url.split('/file/d/')[1].split('/')[0];
    }
    // กรณี format: drive.google.com/open?id=FILE_ID หรือ uc?id=FILE_ID
    else if (url.includes('id=')) {
      fileId = url.split('id=')[1].split('&')[0];
    }

    if (fileId) {
      // ถ้าขอขนาดต้นฉบับ (full) ให้ใช้ uc?id เพื่อดึงไฟล์ตรง
      if (size === 'full') {
        return `https://drive.google.com/uc?export=view&id=${fileId}`;
      }
      // ใช้ thumbnail API ของ Google Drive (รองรับทั้งรูปภาพและวิดีโอ มีประสิทธิภาพสูง)
      // สามารถระบุขนาดได้ผ่านพารามิเตอร์ size (เช่น w400, w800, w1600)
      return `https://drive.google.com/thumbnail?sz=${size}&id=${fileId}`;
    }
  }

  return url;
};
