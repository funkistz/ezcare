import { Injectable } from '@angular/core';
import { LocalNotifications, PendingResult } from '@capacitor/local-notifications';
import { AlertController } from '@ionic/angular';
import { Preferences } from '@capacitor/preferences';

@Injectable({
  providedIn: 'root'
})
export class LocalNotificationService {

  constructor(
    public alertController: AlertController
  ) {

    LocalNotifications.addListener('localNotificationActionPerformed', (notification) => {
      console.log(`Notification ${notification.notification.title} was ${notification.actionId}ed.`);

      console.log(notification);

      if (notification.notification.extra && notification.notification.extra.message) {
        this.alertNotification(notification.notification.title, notification.notification.extra.message);
      } else {
        this.alertNotification(notification.notification.title, notification.notification.body);
      }

    });
  }

  async showLocalNotification(id: number, title: string, text: string, full: string, date: Date) {

    for (let index = 0; index < 30; index++) {

      // console.log('notification setted at', date);

      await LocalNotifications.schedule({
        notifications: [
          {
            title: title,
            body: text,
            extra: { message: full },
            id: id,
            schedule: {
              // at: new Date(Date.now() + 1000 * 60) // in a minute
              at: date
            },
            actionTypeId: 'service_reminder'
          }
        ]
      });

      date = this.addMonths(date, 3);

    }


  }

  addMonths(date, months) {

    let copy = new Date(date.getTime());
    let d = copy.getDate();
    copy.setMonth(copy.getMonth() + +months);
    if (copy.getDate() != d) {
      copy.setDate(0);
    }

    return copy;
  }

  async clearAllNotification() {

    const pendingList: PendingResult = await LocalNotifications.getPending();

    if (!pendingList || !pendingList.notifications || pendingList.notifications.length <= 0) {
      return;
    }

    await LocalNotifications.cancel(pendingList);
  }

  async alertNotification(title, message) {

    let reminder = {
      title: title,
      body: message,
    }

    Preferences.set({
      key: 'reminder_notification',
      value: JSON.stringify(reminder)
    });

    const alert = await this.alertController.create({
      header: title,
      message: message,
      buttons: ['Dismiss']
    });

    await alert.present();

    // const { role } = await alert.onDidDismiss();
    // console.log('onDidDismiss resolved with role', role);

  }
}
