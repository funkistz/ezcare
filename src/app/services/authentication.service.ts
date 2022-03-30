import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { map, tap, switchMap } from 'rxjs/operators';
import { BehaviorSubject, from, Observable, Subject } from 'rxjs';

import { Plugins } from '@capacitor/core';
const { Storage } = Plugins;

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  isAuthenticated: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);
  // url = 'https://funkistz.site/api/';
  // url = 'https://ezcare.local:8890/api/';
  url = 'https://ezcare-warranty.com/ezcare/public/api/';
  // url = 'http://app.ezcare-warranty.com/public/api/';
  header;

  constructor(
    private http: HttpClient
  ) {
    this.header = {
      headers: new HttpHeaders({
        'Authorization': 'Basic ' + btoa("funkistzgm@gmail.com:ug8YVi3t67"),
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'rejectUnauthorized': 'false',
        // 'Access-Control-Allow-Origin': '*',
        // 'Access-Control-Allow-Headers': '*',
      })
    };
  }

  resetHeader() {
    this.header = {
      headers: new HttpHeaders({
        'Authorization': 'Basic ' + btoa("funkistzgm@gmail.com:ug8YVi3t67"),
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'rejectUnauthorized': 'false',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
      })
    };
  }

  login(credentials: { registration_number, policy_number }): Observable<any> {

    this.resetHeader();
    return this.http.post(this.url + 'loginCustomer', credentials, this.header);

    // return this.http.post(this.url, credentials).pipe(
    //   map((data: any) => data.token),
    //   switchMap(token => {
    //     return;
    //     // return from(
    //     //   Storage.set({ key: TOKEN_KEY, value: token })
    //     // );
    //   }),
    //   tap(_ => {
    //     this.isAuthenticated.next(true);
    //   })
    // )
  }

  loginStaff(credentials: { username, password }): Observable<any> {

    this.resetHeader();
    return this.http.post(this.url + 'loginStaff', credentials, this.header);
  }

  getBanners(all = null) {

    this.resetHeader();
    let params = new HttpParams().set('all', all);
    this.header.params = params;

    return this.http.get(this.url + 'banner', this.header);

  }

  getServices(policy_id): Observable<any> {

    this.resetHeader();
    let params = new HttpParams().set('policy_id', policy_id);
    this.header.params = params;

    return this.http.get(this.url + 'service', this.header);

  }

  getService(service_id): Observable<any> {

    this.resetHeader();
    return this.http.get(this.url + 'service/' + service_id, this.header);

  }

  searchServices(search, staff_id = false): Observable<any> {

    this.resetHeader();
    let params = new HttpParams().set('search', search).set('staff_id', staff_id);
    this.header.params = params;

    return this.http.get(this.url + 'service', this.header);

  }

  getPoliciesByIC(cust_ic): Observable<any> {

    this.resetHeader();
    let params = new HttpParams().set('customer_ic', cust_ic);
    this.header.params = params;

    return this.http.get(this.url + 'policy', this.header);

  }

  getPolicy(id): Observable<any> {

    this.resetHeader();

    return this.http.get(this.url + 'policy/' + id, this.header);

  }

  getClaims(policy_id, staff_id = false): Observable<any> {

    this.resetHeader();
    let params = new HttpParams().set('policy_id', policy_id).set('staff_id', staff_id);
    this.header.params = params;

    return this.http.get(this.url + 'claim', this.header);

  }

  getClaim(claim_id): Observable<any> {

    // let params = new HttpParams().set('claim_id', claim_id);
    // this.header.params = params;

    this.resetHeader();
    return this.http.get(this.url + 'claim/' + claim_id, this.header);

  }

  deleteClaim(claim_id): Observable<any> {

    // let params = new HttpParams().set('claim_id', claim_id);
    // this.header.params = params;

    this.resetHeader();
    return this.http.delete(this.url + 'claim/' + claim_id, this.header);

  }

  searchClaims(search, staff_id = false, exact = false): Observable<any> {

    this.resetHeader();
    let params = new HttpParams().set('search', search).set('staff_id', staff_id).set('exact', exact);

    if (!exact) {
      params = new HttpParams().set('search', search).set('staff_id', staff_id);
    }

    this.header.params = params;

    return this.http.get(this.url + 'claim', this.header);

  }

  findClaim(reg_no): Observable<any> {

    this.resetHeader();
    let params = new HttpParams().set('reg_no', reg_no);
    this.header.params = params;

    return this.http.get(this.url + 'claim/find', this.header);

  }

  addService(data): Observable<any> {

    this.resetHeader();
    return this.http.post(this.url + 'service', data, this.header);

  }

  addClaim(data): Observable<any> {

    // let params = new HttpParams().set('image', data);
    // this.header.params = params;

    this.resetHeader();
    return this.http.post(this.url + 'claim', data, this.header);

  }

  updateClaim(claim_id, data) {

    this.resetHeader();
    return this.http.put(this.url + 'claim/' + claim_id, data, this.header);

  }

  updateClaimAttachment(claim_id, data, type) {

    this.resetHeader();
    return this.http.post(this.url + 'claim/' + type, data, this.header);

  }

  uploadImage(image) {

    this.resetHeader();
    const formData = new FormData();
    formData.append('image', image.blobData, `myimage.${image.format}`);
    // formData.append('name', name);

    return this.http.post(this.url + 'claim', formData, this.header);
  }

  getStaffs(is_active = false) {

    this.resetHeader();
    let params = new HttpParams().set('is_active', is_active);
    this.header.params = params;
    return this.http.get(this.url + 'staffs', this.header);

  }

  getStaff(id) {

    this.resetHeader();
    return this.http.get(this.url + 'staffs/' + id, this.header);

  }

  updateStaff(id, data): Observable<any> {

    this.resetHeader();
    return this.http.put(this.url + 'staffs/' + id, data, this.header);

  }

  getUsers(is_active = false) {

    this.resetHeader();
    let params = new HttpParams().set('is_active', is_active);
    this.header.params = params;
    return this.http.get(this.url + 'staffs/users', this.header);

  }

  getGenerals(): Observable<any> {

    this.resetHeader();
    return this.http.get(this.url + 'claim/general', this.header);
  }

  getReports(user_id, month): Observable<any> {

    this.resetHeader();
    let params = new HttpParams().set('user_id', user_id).set('month', month);
    this.header.params = params;

    return this.http.get(this.url + 'policy/report', this.header);

  }

  getReportsYearly(user_id, year, month): Observable<any> {

    this.resetHeader();
    let params = new HttpParams().set('user_id', user_id).set('year', year).set('month', month);
    this.header.params = params;

    return this.http.get(this.url + 'policy/reportYearly', this.header);

  }

  updateClaimStatus(data): Observable<any> {

    this.resetHeader();
    return this.http.post(this.url + 'claim/updateStatus', data, this.header);

  }

  getWorkshops(is_all = 0): Observable<any> {

    this.resetHeader();
    let params = new HttpParams().set('is_all', is_all);
    this.header.params = params;

    return this.http.get(this.url + 'workshop', this.header);
  }

  getWorkshop(id): Observable<any> {

    this.resetHeader();
    return this.http.get(this.url + 'workshop/' + id, this.header);
  }

  updateWorkshop(id, data): Observable<any> {

    this.resetHeader();
    return this.http.put(this.url + 'workshop/' + id, data, this.header);

  }

  addWorkshop(data): Observable<any> {

    this.resetHeader();
    return this.http.post(this.url + 'workshop', data, this.header);

  }

  searchWorkshops(search): Observable<any> {

    this.resetHeader();
    let params = new HttpParams().set('search', search);
    this.header.params = params;

    return this.http.get(this.url + 'workshop', this.header);
  }

  getWarrantyPlans(): Observable<any> {

    this.resetHeader();
    return this.http.get(this.url + 'warrantyPlan', this.header);
  }

  getWarrantyPlan(id): Observable<any> {

    this.resetHeader();
    return this.http.get(this.url + 'warrantyPlan/' + id, this.header);
  }

  updateWarrantyPlan(id, data): Observable<any> {

    this.resetHeader();
    return this.http.put(this.url + 'warrantyPlan/' + id, data, this.header);

  }

  getSettings(): Observable<any> {

    this.resetHeader();
    return this.http.get(this.url + 'generals', this.header);
  }

  addBanners(data): Observable<any> {

    this.resetHeader();
    return this.http.post(this.url + 'banner', data, this.header);

  }

  updateBanners(data): Observable<any> {

    this.resetHeader();
    return this.http.put(this.url + 'banner/0', data, this.header);

  }

  deleteBanners(id): Observable<any> {

    this.resetHeader();
    return this.http.delete(this.url + 'banner/' + id, this.header);

  }

  filterPolicy(filter): Observable<any> {

    this.resetHeader();
    let params = new HttpParams().set('filter', filter);
    this.header.params = params;

    return this.http.get(this.url + 'policy/filter', this.header);
  }

  searchCustomer(search): Observable<any> {

    this.resetHeader();
    let params = new HttpParams().set('search', search);
    this.header.params = params;

    return this.http.get(this.url + 'policy/searchCustomer', this.header);
  }

  // logout(): Promise<void> {
  //   this.isAuthenticated.next(false);
  //   // return Storage.remove({ key: TOKEN_KEY });
  // }
}
