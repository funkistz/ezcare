import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Storage } from '@capacitor/storage';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.page.html',
  styleUrls: ['./notification.page.scss'],
})
export class NotificationPage implements OnInit {

  notifications;
  user;
  staff;

  constructor(
    private firestore: AngularFirestore,
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

    }

    this.getSettings();

  }

  getSettings() {

    if (this.user) {

      let ic = this.user.cust_ic.replace(/[^0-9]/g, '');

      return this.firestore.collection('customer_notifications', ref => ref.where('user_id', '==', ic)).snapshotChanges().subscribe((res) => {

        console.log('res', res);
        this.notifications = res.map((t) => {

          return {
            id: t.payload.doc.id,
            ...t.payload.doc.data() as any
          };
        });

      });

    } else {

      let ic = 'staff_' + this.staff.staff_id

      return this.firestore.collection('notifications', ref => ref.where('user_id', '==', ic)).snapshotChanges().subscribe((res) => {

        console.log('res', res);
        this.notifications = res.map((t) => {

          return {
            id: t.payload.doc.id,
            ...t.payload.doc.data() as any
          };
        });

      });

    }

  }

}
