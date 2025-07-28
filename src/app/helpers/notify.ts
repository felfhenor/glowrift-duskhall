import { options } from '@helpers/state-options';
import { isCatchingUp, isPageVisible } from '@helpers/ui';
import type { NotificationCategory, ToggleableCategory } from '@interfaces';
import { Subject } from 'rxjs';

const notification = new Subject<{
  message: string;
  type: 'show' | 'error' | 'success' | 'warning';
  category: NotificationCategory;
}>();
export const notification$ = notification.asObservable();

export function notify(message: string, category: NotificationCategory): void {
  if (
    !isPageVisible() ||
    isCatchingUp() ||
    !options()['canSendNotifications'] ||
    !options()['enabledNotificationCategories'].includes(
      category as ToggleableCategory,
    )
  )
    return;

  notification.next({ message, type: 'show', category });
}

export function notifyError(message: string): void {
  if (!isPageVisible() || isCatchingUp()) return;
  notification.next({ message, type: 'error', category: 'Error' });
}

export function notifySuccess(message: string): void {
  if (!isPageVisible() || isCatchingUp()) return;
  notification.next({ message, type: 'success', category: 'Success' });
}
