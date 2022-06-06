import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Storage } from '@capacitor/storage';
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

  constructor(
    private firestore: AngularFirestore,
    public alertController: AlertController
  ) { }

  ngOnInit() {
    this.checkUser();
  }

  async checkUser() {

    let { value }: any = await Storage.get({ key: 'user' });
    this.user = JSON.parse(value);
    console.log('enter user', this.user);

    if (!this.user) {
      let { value }: any = await Storage.get({ key: 'staff' });
      this.staff = JSON.parse(value);
      console.log('enter staff', this.staff);
    }

    this.getSettings();

  }

  async getSettings() {

    if (this.user) {

      let { value }: any = await Storage.get({ key: 'reminder_notification' });
      this.reminder = JSON.parse(value);

      let ic = this.user.cust_ic.replace(/[^0-9]/g, '');

      return this.firestore.collection('customer_notifications', ref => ref.where('user_id', '==', ic)).snapshotChanges().subscribe((res) => {

        this.notifications = res.map((t) => {

          return {
            id: t.payload.doc.id,
            ...t.payload.doc.data() as any
          };
        });

        console.log('res', this.notifications);

      });

    } else {

      let ic = 'staff_' + this.staff.staff_id

      return this.firestore.collection('notifications', ref => ref.where('user_id', '==', ic)).snapshotChanges().subscribe((res) => {

        this.notifications = res.map((t) => {

          return {
            id: t.payload.doc.id,
            ...t.payload.doc.data() as any
          };
        });

        console.log('res', this.notifications);


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
