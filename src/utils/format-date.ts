import { formatInTimeZone } from 'date-fns-tz';
import { ptBR } from 'date-fns/locale';

export function formatTimeInZone(iso: string, timeZone: string): string {
  return formatInTimeZone(iso, timeZone, 'HH:mm', { locale: ptBR });
}

export function formatWeekdayInZone(iso: string, timeZone: string): string {
  return formatInTimeZone(iso, timeZone, 'EEE', { locale: ptBR });
}
