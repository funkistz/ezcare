import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../services/authentication.service';
import { Router, NavigationExtras } from '@angular/router';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { HelperService } from '../services/helper.service';
import { PhotoViewer } from '@awesome-cordova-plugins/photo-viewer/ngx';
import { Storage } from '@capacitor/storage';
import * as moment from 'moment';

@Component({
  selector: 'app-endorsement',
  templateUrl: './endorsement.page.html',
  styleUrls: ['./endorsement.page.scss'],
})
export class EndorsementPage implements OnInit {

  segment = 'mine';
  inspectionsTemp;
  inspections;
  user;
  staff;
  loaded;
  search;
  groupInspections;

  constructor(
    private authService: AuthenticationService,
    private router: Router,
    private firestore: AngularFirestore,
    private helper: HelperService,
    private photoViewer: PhotoViewer,
  ) {

  }

  ngOnInit() {

    this.checkUser();

  }

  async checkUser(event = null, policy_id = null) {

    this.user = null;
    this.staff = null;

    let { value }: any = await Storage.get({ key: 'staff' });
    let staff = value;

    if (staff) {
      this.staff = JSON.parse(staff);
      console.log('staff', this.staff);
      this.getTasks();
    }
  }

  segmentChanged(ev: any) {

    this.segment = ev.detail.value;
    this.filterData();
  }

  searching(event) {
    this.search = event.target.value.toLowerCase();
    this.filterData();
  }

  filterData() {

    this.inspections = this.inspectionsTemp.filter((inspection: any) => {

      return true;

      // if (this.segment == 'mine') {

      //   if (this.staff.staff_id == inspection.marketing_officer.id) {
      //     return true;
      //   } else {
      //     return false
      //   }

      // } else {
      //   return true;
      // }

    });

    this.inspections = this.inspections.filter((inspection: any) => {

      if (this.search) {

        if (inspection.dealer) {
          return inspection.dealer.toLowerCase().includes(this.search) ||
            inspection.reg_no.toLowerCase().includes(this.search);
        } else {
          return false;
        }


      } else {
        return true;
      }

    });

    this.groupInspections = [];
    let indexGrow = 0;
    this.groupInspections[indexGrow] = {};
    this.groupInspections[indexGrow].data = [];

    let previousDate = null;
    if (this.inspections[0]) {
      previousDate = moment(this.inspections[0].date.toDate()).format('YYYYMM');
      this.groupInspections[indexGrow].name = moment(this.inspections[0].date.toDate()).format('MMM YYYY');
    }

    this.inspections.forEach(inspection => {

      const index = moment(inspection.date.toDate()).format('YYYYMM');

      if (index != previousDate) {
        indexGrow++;
        this.groupInspections[indexGrow] = {};
        this.groupInspections[indexGrow].data = [];
        this.groupInspections[indexGrow].name = moment(inspection.date.toDate()).format('MMM YYYY');
        previousDate = moment(inspection.date.toDate()).format('YYYYMM');
      }

      this.groupInspections[indexGrow].data.push(inspection);

    });

    console.log('groupInspections', this.groupInspections);

  }

  getTasks() {

    this.helper.presentLoading();

    return this.firestore.collection('endorsement', ref => ref.orderBy('date', 'desc')).snapshotChanges().subscribe((res) => {

      this.helper.dissmissLoading();
      this.loaded = true;

      this.inspectionsTemp = res.map((t) => {

        return {
          id: t.payload.doc.id,
          ...t.payload.doc.data() as Object
        };
      });

      console.log('inspections', this.inspectionsTemp);

      this.filterData();
    });
  }

  addEndorsement() {
    this.router.navigate(['/endorsement/add']);
  }

  viewLog(inspection_id) {
    let navigationExtras: NavigationExtras = {
      queryParams: {
        inspection_id: inspection_id
      }
    };
    this.router.navigate(['/endorsement/add'], navigationExtras);
  }

  imagePreview(src) {

    this.photoViewer.show(src);

  }

}
