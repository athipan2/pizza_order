export const playNotificationSound = () => {
  // ใช้เสียงกระดิ่งที่ยาวขึ้น (ประมาณ 3 วินาที)
  const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/933/933-preview.mp3');
  audio.play().catch(error => {
    console.error('Error playing notification sound:', error);
  });
};
