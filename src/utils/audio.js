export const playNotificationSound = () => {
  // ใช้เสียงกระดิ่งที่ยาวขึ้น (ประมาณ 13 วินาที) ตามคำขอของผู้ใช้
  const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/582/582-preview.mp3');
  audio.play().catch(error => {
    console.error('Error playing notification sound:', error);
  });
};
