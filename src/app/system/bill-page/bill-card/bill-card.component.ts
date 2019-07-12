import { Component, Input, OnInit } from '@angular/core';
import { Bill } from '../../shared/models/bill.model';

@Component({
  selector: 'wfm-bill-card',
  templateUrl: './bill-card.component.html',
  styleUrls: ['./bill-card.component.scss']
})
export class BillCardComponent implements OnInit {

  @Input() bill: Bill;
  @Input() currency: any;

  dollar: number;
  euro: number;

  constructor() { }

  ngOnInit() {
    const { quotes } = this.currency;
    this.dollar =  this.bill.value / quotes['USDRUB'];
    this.euro = this.dollar * quotes['USDEUR'];
  }

}
