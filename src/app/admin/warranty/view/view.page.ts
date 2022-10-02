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
  file_name;
  file_link;
  file;

  constructor(
    private authService: AuthenticationService,
    private route: ActivatedRoute, private router: Router,
    private chooser: Chooser,
    public helper: HelperService,
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

  async update() {

    this.helper.presentLoading();

    let upload = await this.helper.uploadToFirebase(this.file.file, this.file.name);
    console.log('finish... report', upload.url);

    let data: any = {
      file_link: upload.url
    };

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

  async filePicker() {

    let file = await this.helper.filePicker();

    if (file) {
      let data = {
        id: Date.now(),
        file: file.file,
        type: 'file',
        name: file.name
      }

      this.file = data;
      this.file_name = data.name;

    }

    return;
  }

}
