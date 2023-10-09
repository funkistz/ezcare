/* eslint-disable @typescript-eslint/member-ordering */
import { Injectable } from '@angular/core';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { Camera, CameraResultType, Photo, CameraSource } from '@capacitor/camera';
import { Platform } from '@ionic/angular';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import * as moment from 'moment';
import { AngularFireStorage, AngularFireUploadTask } from '@angular/fire/compat/storage';
import { finalize, tap } from 'rxjs/operators';
import { PhotoViewer } from '@awesome-cordova-plugins/photo-viewer/ngx';
import { InAppBrowser } from '@awesome-cordova-plugins/in-app-browser/ngx';
import { Browser } from '@capacitor/browser';
import { Preferences } from '@capacitor/preferences';
import { AuthenticationService } from '../services/authentication.service';
import { Capacitor } from '@capacitor/core';
import { PreviewAnyFile } from '@awesome-cordova-plugins/preview-any-file/ngx';
import { Chooser } from '@awesome-cordova-plugins/chooser/ngx';

const IMAGE_DIR = 'stored-images';

@Injectable({
  providedIn: 'root'
})
export class HelperService {

  loading;
  images = [];
  user;
  staff;
  staffs;
  staffsReal;
  warrantyPlans;
  promos;
  periods;
  inspection_types;
  dealers = [];
  sponsorshipDealer;
  branches = [];

  constructor(
    private alertController: AlertController,
    private loadingController: LoadingController,
    private toastController: ToastController,
    public platform: Platform,
    private afStorage: AngularFireStorage,
    private photoViewer: PhotoViewer,
    private iab: InAppBrowser,
    private authService: AuthenticationService,
    private previewAnyFile: PreviewAnyFile,
    private chooser: Chooser
  ) { }

  async getStaffs() {

    const staffs: any = await Preferences.get({ key: 'staffs' });

    if (staffs.value) {
      this.staffs = JSON.parse(staffs.value);
    }

    console.log('staff', staffs);

    const warrantyPlans: any = await Preferences.get({ key: 'warrantyPlans' });

    if (warrantyPlans.value) {
      this.warrantyPlans = JSON.parse(warrantyPlans.value);
    }

    const periods: any = await Preferences.get({ key: 'periods' });

    if (periods.value) {
      this.periods = JSON.parse(periods.value);
    }

    const promos: any = await Preferences.get({ key: 'promos' });

    if (promos.value) {
      this.promos = JSON.parse(promos.value);
    }

    const inspection_types: any = await Preferences.get({ key: 'inspection_types' });

    if (inspection_types.value) {
      this.inspection_types = JSON.parse(inspection_types.value);
    }

    let dealers: any = await Preferences.get({ key: 'dealers' });

    if (dealers.value) {
      dealers = JSON.parse(dealers.value);

      this.dealers = [];
      dealers.forEach(dealer => {

        this.dealers.push({
          id: dealer.id,
          name: dealer.name,
        });

      });

      this.sponsorshipDealer = this.dealers[0];
    }

    const branches: any = await Preferences.get({ key: 'branches' });

    if (branches.value) {
      this.branches = JSON.parse(branches.value);
    }

    this.authService.getStaffs().subscribe(
      (data: any) => {
        if (data && data.data) {

          this.staffs = [];
          this.staffsReal = [];

          data.data.forEach(staff => {

            this.staffs.push({
              id: staff.id,
              name: staff.name,
            });

            this.staffsReal.push(staff);

          });

          Preferences.set({
            key: 'staffs',
            value: JSON.stringify(this.staffs)
          });
          // console.log('this.staffsReal', this.staffsReal);

          this.warrantyPlans = data.warranty_plan;

          Preferences.set({
            key: 'warrantyPlans',
            value: JSON.stringify(this.warrantyPlans)
          });

          this.periods = data.periods;

          Preferences.set({
            key: 'periods',
            value: JSON.stringify(this.periods)
          });

          this.promos = data.promos;

          Preferences.set({
            key: 'promos',
            value: JSON.stringify(this.promos)
          });

          this.inspection_types = data.inspection_types;

          Preferences.set({
            key: 'inspection_types',
            value: JSON.stringify(this.inspection_types)
          });
          // console.log('this.warrantyPlans', this.warrantyPlans);

          this.branches = data.branches;

          Preferences.set({
            key: 'branches',
            value: JSON.stringify(this.branches)
          });

          this.dealers = [];
          data.dealers.forEach(dealer => {

            this.dealers.push({
              id: dealer.id,
              name: dealer.name,
            });

          });

          // console.log('this.dealers', this.dealers);
          this.sponsorshipDealer = this.dealers[0];

          Preferences.set({
            key: 'dealers',
            value: JSON.stringify(this.inspection_types)
          });
        }
      }, error => {
        this.presentAlertDetails('Error', 'No staff found.');
        console.log(error);
      });
  }

  changeSponsorshipDealer(id) {

    // console.log('changeSponsorshipDealer', id);

    let dealer = this.dealers.filter(function (dealer) {
      return dealer.id == id;
    });

    if (dealer) {
      dealer = dealer[0];
    }

    this.sponsorshipDealer = dealer;

  }

  async presentToast(message) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      position: 'top',
      translucent: true,
      mode: 'ios'
    });
    toast.present();
  }

  async presentLoading(message = 'Please wait...') {
    this.loading = await this.loadingController.create({
      message: message,
      mode: 'ios',
    });
    await this.loading.present();
  }

  updateLoading(message) {
    this.loading.setContent(message);
  }

  dissmissLoading() {

    setTimeout(() => {
      if (this.loading) {
        this.loading.dismiss();
      }
    }, 500);

  }

  async presentAlertDetails(header, message) {
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: header,
      message: message,
      mode: 'ios',
      buttons: [{
        text: 'Okay',
        handler: () => {
          console.log('Confirm Okay');
        }
      }
      ]
    });

    await alert.present();
  }

  async imagePicker() {

    // Camera.pickImages(options: GalleryImageOptions) => 

    let photos = [];
    const images = await Camera.pickImages({
      quality: 60,
      height: 1080,
      correctOrientation: true,
      limit: 20
    });

    console.log('images', images);

    for (const image of images.photos) {
      if (image) {
        await photos.push({
          file: await this.saveImage(image),
          format: image.format,
          webPath: image.webPath,
        });
      }
    }

    return photos;

  }

  async camera() {
    const image = await Camera.getPhoto({
      quality: 60,
      height: 1080,
      allowEditing: false,
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera
      // source: CameraSource.Photos
    });

    return {
      file: await this.saveImage(image),
      format: image.format,
      webPath: image.webPath,
    }
  }

  // Create a new file from a capture image
  async saveImage(photo) {

    const base64Data = await this.readAsBase64(photo);
    // console.log('photo', photo);
    // console.log('base64Data', base64Data);

    // const savedFile = await Filesystem.writeFile({
    //   path: `${IMAGE_DIR}/${fileName}`,
    //   data: base64Data,
    //   directory: Directory.Data
    // });

    // const blob = new Blob([new Uint8Array(decode(base64Data))], {
    //   type: `image/${photo.format}`,
    // });
    const blob = this.b64toBlob(base64Data, 'image/' + photo.format);
    let filename: string = "original_" + moment().unix();

    // const file = new File([blob], filename, {
    //   lastModified: moment().unix(),
    //   type: blob.type,
    // });
    const file = this.blobToFile(blob, filename);
    console.log('blob.type', blob);

    let finalFile = {
      original: file,
      thumbnail: null
    }

    await this.compressImage("data:image/" + photo.format + ";base64, " + base64Data).then((compressed: any) => {
      // console.log('compressed', compressed);
      // this.resizedBase64 = compressed;
      compressed = compressed.split(',')[1];

      const blob2 = this.b64toBlob(compressed, 'image/' + photo.format);
      let filename: string = "thumbnail_" + moment().unix();

      // const file2 = new File([blob2], filename, {
      //   lastModified: moment().unix(),
      //   type: 'image/jpeg',
      // });
      const file2 = this.blobToFile(blob2, filename);

      finalFile.thumbnail = file2;

    }, error => {
      console.log('error', error);
    });

    return finalFile;

    // console.log('savedFile', savedFile);

    // Reload the file list
    // Improve by only loading for the new image and unshifting array!
    // this.loadFiles();
  }

  private async readAsBase64(photo: Photo) {

    console.log('checking photos', photo);

    if (this.platform.is('hybrid')) {
      const file = await Filesystem.readFile({
        path: photo.path
      });
      // console.log(file);
      return file.data;
    }
    else {
      // Fetch the photo, read as a blob, then convert to base64 format
      const response = await fetch(photo.webPath);
      const blob = await response.blob();

      return (await this.convertBlobToBase64(blob) as string).split(',')[1];
    }
  }

  async saveFile(document) {

    const base64Data = document.dataURI.split(',')[1];

    const blob = this.b64toBlob(base64Data, document.mediaType);
    let filename: string = "original_" + moment().unix() + "_" + document.name;

    const file = this.blobToFile(blob, filename);

    return file;

  }

  async filePicker() {

    let fileX;

    await this.chooser.getFile()
      .then(async file => {

        fileX = {
          name: file.name,
          file: await this.saveFile(file),
          format: file.mediaType.split(',')[1],
          webPath: file.uri,
        }

      })
      .catch((error: any) => {
        console.error(error);
      });


    return fileX;

  }


  // Helper function
  convertBlobToBase64 = (blob: Blob) => new Promise((resolve, reject) => {
    const reader = new FileReader;
    reader.onerror = reject;
    reader.onload = () => {
      resolve(reader.result);
    };
    reader.readAsDataURL(blob);
  });

  b64toBlob(b64Data, contentType) {
    contentType = contentType || '';
    var sliceSize = 512;
    var byteCharacters = atob(b64Data);
    var byteArrays = [];

    for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      var slice = byteCharacters.slice(offset, offset + sliceSize);

      var byteNumbers = new Array(slice.length);
      for (var i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      var byteArray = new Uint8Array(byteNumbers);

      byteArrays.push(byteArray);
    }

    var blob = new Blob(byteArrays, { type: contentType });
    return blob;
  }
  async loadFiles() {
    this.images = [];

    const loading = await this.loadingController.create({
      message: 'Loading data...',
    });
    await loading.present();

    Filesystem.readdir({
      path: IMAGE_DIR,
      directory: Directory.Data,
    }).then(result => {
      this.loadFileData(result.files);
    },
      async (err) => {
        // Folder does not yet exists!
        await Filesystem.mkdir({
          path: IMAGE_DIR,
          directory: Directory.Data,
        });
      }
    ).then(_ => {
      loading.dismiss();
    });
  }

  // Get the actual base64 data of an image
  // base on the name of the file
  async loadFileData(fileNames: any[]) {
    for (let f of fileNames) {
      const filePath = `${IMAGE_DIR}/${f}`;

      const readFile = await Filesystem.readFile({
        path: filePath,
        directory: Directory.Data,
      });

      this.images.push({
        name: f,
        path: filePath,
        data: `data:image/jpeg;base64,${readFile.data}`,
      });
    }
  }

  thumbImage(base64String, format) {

  }

  compressImage(src) {
    return new Promise((res, rej) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {

        let formula;
        let width = img.width;
        let height = img.height;
        if (img.width < img.height) {
          formula = img.width / img.height;

          height = 250;
          width = 250 * formula;
        } else {
          formula = img.height / img.width;

          width = 250;
          height = 250 * formula;
        }

        const elem = document.createElement('canvas');
        elem.width = width;
        elem.height = height;
        const ctx = elem.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const data = ctx.canvas.toDataURL();
        res(data);
      }
      img.onerror = error => rej(error);
    })
  }

  public blobToFile = (theBlob: Blob, fileName: string): File => {
    var b: any = theBlob;
    //A Blob() is almost a File() - it's just missing the two properties below which we will add
    b.lastModifiedDate = new Date();
    b.name = fileName;

    //Cast to a File() type
    return <File>theBlob;
  }

  async uploadToFirebase(file, reg_no): Promise<any> {

    return new Promise(async (resolve, reject) => {

      console.log('uploading...');

      const filename = file.name;

      // Storage path
      const fileStoragePath = `inspections/${new Date().getTime()}_${filename}`;

      // Image reference
      const imageRef = this.afStorage.ref(fileStoragePath);

      // File upload task
      let fileUploadTask = this.afStorage.upload(fileStoragePath, file);
      // Show uploading progress
      let percentageVal = fileUploadTask.percentageChanges();

      await fileUploadTask.snapshotChanges().pipe(
        finalize(async () => {
          console.log('finish fileUploadTask');

          await imageRef.getDownloadURL().subscribe(downloadURL => {

            resolve({
              name: filename,
              url: downloadURL,
            });

          });
        })
      ).toPromise();
    });

  }

  async uploadFileToFirebase(file, reg_no): Promise<any> {

    return new Promise(async (resolve, reject) => {

      console.log('uploading...');

      const filename = file.name;

      // Storage path
      const fileStoragePath = 'inspections/' + filename;

      // Image reference
      const imageRef = this.afStorage.ref(fileStoragePath);

      // File upload task
      let fileUploadTask = this.afStorage.upload(fileStoragePath, file);
      // Show uploading progress
      let percentageVal = fileUploadTask.percentageChanges();

      await fileUploadTask.snapshotChanges().pipe(
        finalize(async () => {
          console.log('finish fileUploadTask');

          await imageRef.getDownloadURL().subscribe(downloadURL => {

            resolve({
              name: filename,
              url: downloadURL,
            });

          });
        })
      ).toPromise();
    });

  }

  imagePreview(src, isBrowser = true) {

    if (isBrowser) {
      Browser.open({
        url: src,
        toolbarColor: '#29135f',
        presentationStyle: 'popover'
      });
    } else {

      var options = {
        share: true, // default is false
        closeButton: true, // default is true
        copyToReference: false, // default is false
        headers: '',  // If this is not provided, an exception will be triggered
        piccasoOptions: {} // If this is not provided, an exception will be triggered
      };

      // console.log('decodeURIComponent(src)', (this.file.applicationDirectory + src));
      this.photoViewer.show((src), 'Inspection', options);

    }

  }

  async downloadPDF(url) {

    console.log(Capacitor.getPlatform(), url);

    if (Capacitor.getPlatform() === 'web') {
      window.open(url);
    } else {

      this.previewAnyFile.previewPath(url).subscribe(
        doc => {

        }, error => {
          console.log(error);
        }
      )

    }

  }

  async checkStaff(event = null, policy_id = null) {

    let { value }: any = await Preferences.get({ key: 'staff' });
    let staff = value;

    return JSON.parse(staff);
  }

  getAllUserIDByBranch(branch) {

    let ids = [];
    this.staffsReal.forEach(staff => {

      if (branch == 8) {
        ids.push(staff.id);
      } else {

        if (staff.user && staff.user.user_branch && staff.user.user_branch == branch) {
          ids.push(staff.user.user_id);
        }

      }

    });

    return ids;
  }

  filterAllStaffIDByBranch(branch) {

    return this.staffs.filter(
      staff => {

        if (branch == 8) {
          return true;
        }

        if (!staff.user) {
          return false;
        }

        if (staff.user.user_branch && staff.user.user_branch == branch) {
          return true;
        } else {
          return false;
        }

      });

  }

  filterStaffByBranch(staffs, branch) {

    return staffs.filter(staff => {

    })
  }

}
