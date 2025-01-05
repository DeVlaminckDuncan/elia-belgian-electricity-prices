export const getMinutesUntilNextHour = (): number => {
  const now = new Date();
  return 60 - now.getMinutes();
};