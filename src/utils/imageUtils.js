/**
 * แปลง Google Drive URL ให้เป็น URL ที่สามารถแสดงผลใน <img> tag ได้โดยตรง
 */
export const formatDriveUrl = (url) => {
  if (!url) return url;

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
      // ใช้ thumbnail API ของ Google Drive (รองรับทั้งรูปภาพและวิดีโอ มีประสิทธิภาพสูง)
      return `https://drive.google.com/thumbnail?sz=w800&id=${fileId}`;
    }
  }

  return url;
};
