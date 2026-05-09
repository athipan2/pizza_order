let notificationAudio = null;

const SOUND_URL = 'https://assets.mixkit.co/active_storage/sfx/582/582-preview.mp3';

export const playNotificationSound = () => {
  const audio = new Audio(SOUND_URL);
  audio.play().catch(error => {
    console.error('Error playing notification sound:', error);
  });
};

export const startNotificationLoop = () => {
  if (notificationAudio) return;

  notificationAudio = new Audio(SOUND_URL);
  notificationAudio.loop = true;
  notificationAudio.play().catch(error => {
    console.error('Error starting notification loop:', error);
    // If blocked, we might need to retry after user interaction
    // but typically the app is already running and the admin has interacted.
  });
};

export const stopNotificationLoop = () => {
  if (notificationAudio) {
    notificationAudio.pause();
    notificationAudio.currentTime = 0;
    notificationAudio = null;
  }
};
