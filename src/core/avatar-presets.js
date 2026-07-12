export const DEFAULT_AVATAR = Object.freeze({
  background: 'green',
  emoji: '🌱',
  photo: null
});

export const AVATAR_BACKGROUNDS = Object.freeze([
  { id: 'none', name: 'None', css: 'var(--bg-tertiary)' },
  { id: 'solid-black', css: '#000000' },
  { id: 'solid-white', css: '#ffffff' },
  { id: 'solid-grey', css: '#8e8e93' },
  { id: 'sunset-1', css: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)' },
  { id: 'sunset-2', css: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)' },
  { id: 'sunset-3', css: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
  { id: 'sunset-4', css: 'linear-gradient(135deg, #ff758c 0%, #ff7eb3 100%)' },
  { id: 'sunset-5', css: 'linear-gradient(135deg, #ff0844 0%, #ffb199 100%)' },
  { id: 'ocean-1', css: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)' },
  { id: 'ocean-2', css: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
  { id: 'ocean-3', css: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { id: 'ocean-4', css: 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)' },
  { id: 'ocean-5', css: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
  { id: 'nature-1', css: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' },
  { id: 'nature-2', css: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' },
  { id: 'nature-3', css: 'linear-gradient(135deg, #96fbc4 0%, #f9f586 100%)' },
  { id: 'nature-4', css: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)' },
  { id: 'nature-5', css: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' },
  { id: 'dark-1', css: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)' },
  { id: 'dark-2', css: 'linear-gradient(135deg, #232526 0%, #414345 100%)' },
  { id: 'dark-3', css: 'linear-gradient(135deg, #000000 0%, #434343 100%)' },
  { id: 'neon-1', css: 'linear-gradient(135deg, #0ba360 0%, #3cba92 100%)' },
  { id: 'neon-2', css: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)' },
  { id: 'pastel-1', css: 'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)' },
  { id: 'pastel-2', css: 'linear-gradient(135deg, #fddb92 0%, #d1fdff 100%)' },
  { id: 'pastel-3', css: 'linear-gradient(135deg, #c1dfc4 0%, #deecdd 100%)' },
  { id: 'pastel-4', css: 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)' },
  { id: 'pastel-5', css: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' },
  { id: 'gold-1', css: 'linear-gradient(135deg, #f5af19 0%, #f12711 100%)' },
  { id: 'gold-2', css: 'linear-gradient(135deg, #e6b980 0%, #eacda3 100%)' },
  { id: 'rowan-mist', css: 'linear-gradient(135deg, #f5f5f5 0%, #d9d9d9 50%, #ffffff 100%)' },
  { id: 'rowan-ink', css: 'linear-gradient(135deg, #1a1a1a 0%, #4a4a4a 50%, #0b0b0b 100%)' },
  { id: 'berry-1', css: 'linear-gradient(135deg, #c62828 0%, #ff6f61 100%)' },
  { id: 'berry-2', css: 'linear-gradient(135deg, #8e24aa 0%, #e040fb 100%)' },
  { id: 'forest-1', css: 'linear-gradient(135deg, #1b5e20 0%, #66bb6a 100%)' },
  { id: 'forest-2', css: 'linear-gradient(135deg, #004d40 0%, #26a69a 100%)' },
  { id: 'sky-1', css: 'linear-gradient(135deg, #e3f2fd 0%, #90caf9 100%)' },
  { id: 'sky-2', css: 'linear-gradient(135deg, #fce4ec 0%, #f8bbd0 100%)' },
  { id: 'mono-1', css: 'linear-gradient(135deg, #ffffff 0%, #e0e0e0 100%)' },
  { id: 'mono-2', css: 'linear-gradient(135deg, #bdbdbd 0%, #757575 100%)' }
]);

export const AVATAR_EMOJIS = Object.freeze([
  '🌱', '🌿', '🍀', '😊', '😋', '😶‍🌫️', '🌴', '🌵', '🌾', '🤪', '🌸', '🌺', '🌷', '🥳', '🍄', '🍉', '🍋', '👻', '🍏', '🍑',
  '🦊', '🐶', '🐼', '🐨', '🐯', '🐵', '🐝', '🐋', '🦉', '🐸', '🦋', '🐞', '🌻', '🪴', '🍒', '🫐', '🥝', '🍇', '🌰', '🪵',
  '⚽', '🎮', '💻', '⌨️', '📷', '🎸', '🧑‍🚀', '🧘', '🧠', '💡', '⏰', '👾', '🚀', '🛸', '🌍', '🧊', '💍', '🎁', '📚', '✍️',
  '✨', '⭐', '🌟', '🌙', '☀️', '🌊', '⚡', '🔥', '💫', '🥇', '🍃', '☮️', '🕊️', '🪶', '❄️', '🌈', '🎯', '🧩', '🎨', '🎧',
  '😎', '🤠', '🧐', '🤓', '😴', '👽', '💀', '👻', '😈', '🤡', '👹', '🫢', '🫶', '🙌', '💪', '🧡', '🤍',
  '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '❤️‍🔥'
]);
