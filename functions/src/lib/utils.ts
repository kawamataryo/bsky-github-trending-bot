import dayjs from "dayjs";

export const isUpdateTime = (): boolean => {
  const datetime = dayjs();
  return datetime.hour() % 2 === 0;
};

export const shuffle = <T>(array: T[]): T[] => {
  const out = Array.from(array);
  for (let i = out.length - 1; i > 0; i--) {
    const r = Math.floor(Math.random() * (i + 1));
    const tmp = out[i];
    out[i] = out[r];
    out[r] = tmp;
  }
  return out;
};

export const truncateText = (text: string, maxLength: number) => {
  return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
};
