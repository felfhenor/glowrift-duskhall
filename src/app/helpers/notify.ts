import { Subject } from 'rxjs';
import { options } from './state-options';
import { NotificationCategory, ToggleableCategory } from '../interfaces';

function isPageVisible(): boolean {
  return !document.hidden;
}

// export const enabledCategories = localStorageSignal<ToggleableCategory[]>(
//   'enabledNotificationCategories',
//   [
//     'Travel', 
//     'LocationClaim'
//   ]
// );

const notification = new Subject<{
  message: string;
  type: 'show' | 'error' | 'success' | 'warning';
  category: NotificationCategory;
}>();
export const notification$ = notification.asObservable();

export function notify(message: string, category: NotificationCategory): void {
  if (
    !isPageVisible() || 
    !options()['canSendNotifications'] || 
    !options()['enabledNotificationCategories'].includes(category as ToggleableCategory)
  ) return;

  notification.next({ message, type: 'show', category });
}

export function notifyError(message: string): void {
  if (!isPageVisible()) return;
  notification.next({ message, type: 'error', category: 'Error' });
}

export function notifySuccess(message: string): void {
  if (!isPageVisible()) return;
  notification.next({ message, type: 'success', category: 'Success' });
}
