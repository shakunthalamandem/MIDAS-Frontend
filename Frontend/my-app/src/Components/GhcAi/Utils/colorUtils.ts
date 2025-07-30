const colors = [
  "#e3f2fd", "#fce4ec", "#e8f5e9", "#fff3e0", "#ede7f6", "#f3e5f5", "#f1f8e9", "#f9fbe7"
];

export const getRandomBgColor = () => {
  const index = Math.floor(Math.random() * colors.length);
  return colors[index];
};
