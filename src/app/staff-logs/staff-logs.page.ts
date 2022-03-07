import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../services/authentication.service';
import { Router, NavigationExtras } from '@angular/router';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { HelperService } from '../services/helper.service';
import { PhotoViewer } from '@awesome-cordova-plugins/photo-viewer/ngx';
import { Storage } from '@capacitor/storage';

export class TODO {
  $key: string;
  chassis: string;
  date: string;
  dealer: string;
  images: Array<any>;
  marketing_officer: string;
  mileage: string;
  remarks: string;
  vehicle: string;
}

@Component({
  selector: 'app-staff-logs',
  templateUrl: './staff-logs.page.html',
  styleUrls: ['./staff-logs.page.scss'],
})
export class StaffLogsPage implements OnInit {

  segment = 'mine';
  inspectionsTemp;
  inspections;
  user;
  staff;
  loaded;
  search;

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

      if (this.segment == 'mine') {

        if (this.staff.staff_id == inspection.marketing_officer.id) {
          return true;
        } else {
          return false
        }

      } else {
        return true;
      }

    });

    this.inspections = this.inspections.filter((inspection: any) => {

      if (this.search) {

        if (inspection.dealer) {
          return inspection.dealer.toLowerCase().includes(this.search) ||
            inspection.marketing_officer.name.toLowerCase().includes(this.search) ||
            inspection.dealer.toLowerCase().includes(this.search);
        } else {
          return false;
        }


      } else {
        return true;
      }

    });

  }

  getTasks() {

    this.helper.presentLoading();

    return this.firestore.collection('inspections').snapshotChanges().subscribe((res) => {

      this.helper.dissmissLoading();
      this.loaded = true;

      this.inspectionsTemp = res.map((t) => {

        return {
          id: t.payload.doc.id,
          ...t.payload.doc.data() as TODO
        };
      });

      console.log('inspections', this.inspectionsTemp);

      this.filterData();
    });
  }

  addLog() {
    this.router.navigate(['/staff-tabs/staff-logs/add-logs']);
  }

  viewLog(inspection_id) {
    let navigationExtras: NavigationExtras = {
      queryParams: {
        inspection_id: inspection_id
      }
    };
    this.router.navigate(['/staff-tabs/staff-logs/add-logs'], navigationExtras);
  }

  imagePreview(src) {

    this.photoViewer.show(src);

  }

}
