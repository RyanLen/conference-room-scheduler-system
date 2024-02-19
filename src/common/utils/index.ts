import * as dayjs from 'dayjs';

export * from './paginate.dto';
export * from './payload';

export function isEmpty(obj) {
  return Object.keys(obj).length === 0;
}

export function formatCharData() {
  const thisWeekArr = Array.from({ length: 7 }, (_, i) => dayjs().startOf('week').add(i, 'day').format('YYYY-MM-DD'))
  const lastWeekArr = Array.from({ length: 7 }, (_, i) => dayjs().subtract(7, 'day').startOf('week').add(i, 'day').format('YYYY-MM-DD'))
}

export function formatTime(time) {
  if (!time) return null
  return dayjs(time).format('YYYY-MM-DD HH:mm')
}
