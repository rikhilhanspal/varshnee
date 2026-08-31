let currentAudio: HTMLAudioElement | null = null;

export function playAudio(path: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio = null;
    }
    const audio = new Audio(`/audio/${path}`);
    currentAudio = audio;
    audio.onended = () => {
      currentAudio = null;
      resolve();
    };
    audio.onerror = () => {
      currentAudio = null;
      reject(new Error(`Failed to play audio: ${path}`));
    };
    audio.play().catch(reject);
  });
}

export function stopAudio() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
}

export function speakText(text: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!('speechSynthesis' in window)) { reject(new Error('No TTS')); return; }
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 0.85;
    utter.onend = () => resolve();
    utter.onerror = () => reject(new Error('TTS failed'));
    window.speechSynthesis.speak(utter);
  });
}
