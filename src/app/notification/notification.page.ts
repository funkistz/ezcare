/* eslint-disable max-len */
import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Preferences } from '@capacitor/preferences';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.page.html',
  styleUrls: ['./notification.page.scss'],
})
export class NotificationPage implements OnInit {

  notifications;
  user;
  staff;
  reminder;

  notificationFire;

  constructor(
    private firestore: AngularFirestore,
    public alertController: AlertController
  ) { }

  ngOnInit() {
    this.checkUser();
  }

  async checkUser() {

    let { value }: any = await Preferences.get({ key: 'user' });
    this.user = JSON.parse(value);
    // console.log('enter user', this.user);

    if (!this.user) {
      let { value }: any = await Preferences.get({ key: 'staff' });
      this.staff = JSON.parse(value);
      // console.log('enter staff', this.staff);
    }

    this.getSettings();

  }

  async getSettings() {

    if (this.user) {

      let { value }: any = await Preferences.get({ key: 'reminder_notification' });
      this.reminder = JSON.parse(value);

      let ic = this.user.cust_ic.replace(/[^0-9]/g, '');

      this.notificationFire = this.firestore.collection('customer_notifications', ref => ref.where('user_id', '==', ic)).snapshotChanges().subscribe((res) => {

        this.notifications = res.map((t: any) => {

          return {
            id: t.payload.doc.id,
            date: t.payload.doc.data().date_add ? t.payload.doc.data().date_add : 0,
            ...t.payload.doc.data() as any
          };
        });
        this.notifications.sort((a, b) => a.date_add.toDate() - b.date_add.toDate());

        this.notifications.sort((a, b) => b.date - a.date);

        // console.log('res', this.notifications);

        this.notificationFire.unsubscribe();
      });

    } else {

      let ic = 'staff_' + this.staff.staff_id

      this.notificationFire = this.firestore.collection('notifications', ref => ref.where('user_id', '==', ic)).snapshotChanges().subscribe((res) => {

        this.notifications = res.map((t: any) => {

          // console.log('t.payload.doc.data()', t.payload.doc.data().date_add);

          return {
            id: t.payload.doc.id,
            date: t.payload.doc.data().date_add ? t.payload.doc.data().date_add : 0,
            ...t.payload.doc.data() as any
          };
        });

        this.notifications.sort((a, b) => b.date - a.date);

        // console.log('res', this.notifications);

        this.notificationFire.unsubscribe();

      });

    }

  }

  async alertNotification(title, text) {

    const alert = await this.alertController.create({
      header: title,
      message: text,
      buttons: ['Dismiss']
    });

    await alert.present();

  }
}
