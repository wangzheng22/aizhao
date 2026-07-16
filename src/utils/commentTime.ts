function pad(value: number) {
  return String(value).padStart(2, '0');
}

export function formatCommentTime(date = new Date()) {
  return `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}
