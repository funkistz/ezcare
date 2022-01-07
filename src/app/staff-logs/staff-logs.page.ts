import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../services/authentication.service';
import { Router, NavigationExtras } from '@angular/router';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { HelperService } from '../services/helper.service';
import { PhotoViewer } from '@awesome-cordova-plugins/photo-viewer/ngx';

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

  inspections;

  constructor(
    private authService: AuthenticationService,
    private router: Router,
    private firestore: AngularFirestore,
    private helper: HelperService,
    private photoViewer: PhotoViewer,
  ) {

  }

  ngOnInit() {

    this.getTasks();

  }

  getTasks() {

    this.helper.presentLoading();

    return this.firestore.collection('inspections').snapshotChanges().subscribe((res) => {
      this.inspections = res.map((t) => {

        this.helper.dissmissLoading();

        return {
          id: t.payload.doc.id,
          ...t.payload.doc.data() as TODO
        };
      })
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
