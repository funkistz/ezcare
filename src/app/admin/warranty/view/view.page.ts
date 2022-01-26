import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../../../services/authentication.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Chooser } from '@awesome-cordova-plugins/chooser/ngx';
import { Plugins } from "@capacitor/core";
const { FilePicker, FilePickerResult } = Plugins;
import { HelperService } from '../../../services/helper.service';

@Component({
  selector: 'app-view',
  templateUrl: './view.page.html',
  styleUrls: ['./view.page.scss'],
})
export class ViewPage implements OnInit {

  id;
  warranty: any = {};
  file_link;

  constructor(
    private authService: AuthenticationService,
    private route: ActivatedRoute, private router: Router,
    private chooser: Chooser,
    private helper: HelperService,
  ) { }

  ngOnInit() {

    this.route.queryParams.subscribe(params => {
      if (params && params.id) {
        this.id = params.id;

        this.getWarranty(this.id);
      }
    });
  }

  getWarranty(id) {

    this.authService.getWarrantyPlan(id).subscribe(
      (data: any) => {

        if (data && data.data) {
          // console.log(data);
          this.warranty = data.data;
        }

        console.log(data);
      }, error => {
        console.log(error);
      });
  }

  getFile() {

    this.chooser.getFile()
      .then(file => {
        console.log(file ? file.name : 'canceled')
      })
      .catch((error: any) => console.error(error));

  }



  getFileCap() {

    // FilePicker.showFilePicker({
    //   fileTypes: ["image/*", "application/pdf"],
    // }).then(
    //   (fileResult: FilePickerResult) => {
    //     const fileUri = fileResult.uri;
    //     const fileName = fileResult.name;
    //     const fileMimeType = fileResult.mimeType;
    //     const fileExtension = fileResult.extension;
    //   },
    //   (error) => {
    //     console.log(error);
    //   }
    // );

  }

  update() {

    console.log(this.file_link);

    let data: any = {
      file_link: this.file_link
    };

    this.helper.presentLoading();

    this.authService.updateWarrantyPlan(this.id, data).subscribe(
      (data: any) => {

        if (data && data.data) {
          // console.log(data);
          this.warranty = data.data;
        }

        console.log(data);
        this.helper.dissmissLoading();
      }, error => {
        console.log(error);
        this.helper.dissmissLoading();

      });

  }

}
