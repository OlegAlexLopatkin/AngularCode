import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import { Bill } from '../models/bill.model';
import { BaseApi } from '../../../shared/core/base-api';

@Injectable()
export class BillService extends BaseApi {
  constructor(public http: Http) {
    super(http);
  }

  getBill(): Observable<Bill> {
    return this.get('bill');
  }


  updateBill(bill: Bill): Observable<Bill> {
    return this.post('updatebill', bill);
  }
 

  private obj = {};
  private timestamp = 0;

  getCurrency(bool: boolean = false): Observable<any> {
    if((new Date()).getTime() /1000 - this.timestamp > 3600 || bool) {
      return this.http.get(`http://www.apilayer.net/api/live?access_key=`)
        .map((response: Response) => response.json())
        .map(currency => {
          this.obj= currency;
          this.timestamp = (new Date()).getTime() /1000;
          return currency;
        });
    } else {
      return Observable.of(this.obj);
    }
    
  }

}

