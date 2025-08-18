import { options } from '@helpers/state-options';
import { isCatchingUp, isPageVisible } from '@helpers/ui';
import type { NotificationCategory, ToggleableCategory } from '@interfaces';
import { Subject } from 'rxjs';

const notification = new Subject<{
  message: string;
  type: 'info' | 'error' | 'success' | 'warning';
  category: NotificationCategory;
}>();
export const notification$ = notification.asObservable();

export function notify(category: NotificationCategory, message: string): void {
  if (
    !isPageVisible() ||
    isCatchingUp() ||
    !options()['canSendNotifications'] ||
    !options()['enabledNotificationCategories'].includes(
      category as ToggleableCategory,
    )
  )
    return;

  notification.next({ message, type: 'info', category });
}

export function notifyError(message: string): void {
  if (!isPageVisible() || isCatchingUp()) return;
  notification.next({ message, type: 'error', category: 'Error' });
}

export function notifySuccess(message: string): void {
  if (!isPageVisible() || isCatchingUp()) return;
  notification.next({ message, type: 'success', category: 'Success' });
}
