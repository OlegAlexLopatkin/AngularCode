import { Component, EventEmitter, Input, Output, OnInit, OnDestroy } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { Category } from '../../shared/models/category.model';
import { CategoriesService } from '../../shared/services/categories.service';
import { EventsService } from '../../shared/services/events.service';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { WFMEvent } from '../../shared/models/event.model';
import { BillService } from '../../shared/services/bill.service';
import { Bill } from '../../shared/models/bill.model';
import { Message } from '../../../shared/models/message.model';

@Component({
  selector: 'wfm-history-edit',
  templateUrl: './history-edit.component.html',
  styleUrls: ['./history-edit.component.scss']
})
export class HistoryEditComponent implements OnInit, OnDestroy {

  @Output() onEditCancel = new EventEmitter<any>();
  @Output() onEditApply = new EventEmitter<any>();

  @Input() categories: Category[] = [];
  @Input() eventItem: WFMEvent;

  constructor(private categoriesService: CategoriesService,
              private eventService: EventsService,
              private billService: BillService,
              private router: Router) {
  }

  isLoaded = false;
  s1: Subscription;
  events: WFMEvent[] = [];
  sub1: Subscription;
  sub2: Subscription;
  previousAmount = 1;
  previousDescription = '';
  previousType = 'outcome';
  previousCategory = 1;
  message: Message;
  timerID: any;

  ngOnInit() {
    this.message = new Message('', '');
    this.s1 = Observable.combineLatest(
      this.categoriesService.getCategories(),
      this.eventService.getEvents()
    ).subscribe((data: [Category[], WFMEvent[]]) => {
      this.categories = data[0];
      this.events = data[1];


      this.isLoaded = true;
    },
    () => {
      this.router.navigate(['/login']);
    });
    this.previousAmount = this.eventItem.amount;
    this.previousDescription = this.eventItem.description;
    this.previousType = this.eventItem.type;
    this.previousCategory = this.eventItem.category;
  }


  types = [
    {type: 'income', label: 'Доход'},
    {type: 'outcome', label: 'Расход'}
  ];

  closeEdit() {
    if(this.timerID) {
      clearTimeout(this.timerID);
    }

    this.onEditCancel.emit();
  }

  private showMessage(type: string, text: string) {
    this.message.type = type;
    this.message.text = text;
    this.timerID = window.setTimeout(() => this.message.text = '', 5000);
  }

  onSubmit(form: NgForm) {
    if(this.timerID) {
      clearTimeout(this.timerID);
    }

    let {amount, description, category, type} = form.value;
    if (amount < 0) amount *= -1;

    const event = new WFMEvent(
      type, amount, +category,
      this.eventItem.date, description,
      this.eventItem.id
    );

    this.sub1 = this.billService.getBill()
      .subscribe((bill: Bill) => {
        let value = 0;
        if (type === 'outcome') {
          value = bill.value - amount;
        } else {
          value = +bill.value + +amount;
        }

        if(this.eventItem.type === 'outcome') {
          value = +value + +this.eventItem.amount;
        } else {
          value = value - this.eventItem.amount;
        }

        this.sub2 = this.billService.updateBill({value, currency: bill.currency})
          .mergeMap(() => this.eventService.updateEventById(this.eventItem.id, event))
          .subscribe(
            () => {
               this.message.type = 'success';
              this.message.text = `Запись успешно отредактирована.`;
              this.timerID = window.setTimeout(() => {
                this.message.text = '';
                this.onEditApply.emit(event);
              }, 5000);
            },
            () => {
               this.router.navigate(['/login']);
            }
          );

      },
      () => {
        this.router.navigate(['/login']);
      });
  }

  ngOnDestroy() {
    if (this.s1) {
      this.s1.unsubscribe();
    }

    if (this.sub1) {
      this.sub1.unsubscribe();
    }

    if (this.sub2) {
      this.sub2.unsubscribe();
    }

    if(this.timerID) {
      clearTimeout(this.timerID);
    }
  }

}
