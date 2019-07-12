import { Component, Input, OnDestroy, OnInit, Output, EventEmitter } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import * as moment from 'moment';

import { Category } from '../../shared/models/category.model';
import { WFMEvent } from '../../shared/models/event.model';
import { EventsService } from '../../shared/services/events.service';
import { BillService } from '../../shared/services/bill.service';
import { Bill } from '../../shared/models/bill.model';
import { Message } from '../../../shared/models/message.model';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'wfm-add-event',
  templateUrl: './add-event.component.html',
  styleUrls: ['./add-event.component.scss']
})
export class AddEventComponent implements OnInit, OnDestroy {

  sub1: Subscription;
  sub2: Subscription;
  @Input() categories: Category[] = [];
  categoryId: number = 1;
  @Input() loading: boolean = false;
  @Output() onLoading = new EventEmitter<boolean>();

  types = [
    {type: 'income', label: 'Доход'},
    {type: 'outcome', label: 'Расход'}
  ];

  message: Message;
  timerID: any;

  constructor(private eventsService: EventsService,
              private billService: BillService,
              private router: Router) {
  }

  ngOnInit() {
    this.message = new Message('', '');
    this.categoryId = this.categories[0].id
  }

  private showMessage(type: string, text: string) {
    this.message.type = type;
    this.message.text = text;
    this.timerID = window.setTimeout(() => this.message.text = '', 5000);
  }

  onSubmit(form: NgForm) {
    this.onLoading.emit(true);
    if(this.timerID) {
      clearTimeout(this.timerID);
    }
    this.message.text = '';
    let {amount, description, category, type} = form.value;
    if (amount < 0) amount *= -1;

    const event = new WFMEvent(
      type, amount, +category,
      moment().format('DD.MM.YYYY HH:mm:ss'), description
    );
    this.sub1 = this.billService.getBill()
      .subscribe(
          (bill: Bill) => {
          let value = 0;
          if (type === 'outcome') {
            value = bill.value - amount;
          } else {
            value = +bill.value + +amount;
          }

          this.sub2 = this.billService.updateBill({value, currency: bill.currency})
            .mergeMap(() => this.eventsService.addEvent(event))
            .subscribe(
              () => {
                form.setValue({
                  amount: 1,
                  description: ' ',
                  category: +category,
                  type: 'outcome'
                });
                this.onLoading.emit(false);
                this.showMessage('success', 'Событие успешно добавлено.');
              },
              error => {
                this.router.navigate(['/login'])
              }
            );
        },
        error => {
          () => this.router.navigate(['/login'])
        }
      );
  }

  ngOnDestroy() {
    if (this.sub1) this.sub1.unsubscribe();
    if (this.sub2) this.sub2.unsubscribe();
  }

}
