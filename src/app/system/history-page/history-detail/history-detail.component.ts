import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { EventsService } from '../../shared/services/events.service';
import { CategoriesService } from '../../shared/services/categories.service';
import { BillService } from '../../shared/services/bill.service';
import { WFMEvent } from '../../shared/models/event.model';
import { Category } from '../../shared/models/category.model';
import { Subscription } from 'rxjs/Subscription';
import { Bill } from '../../shared/models/bill.model';

@Component({
  selector: 'wfm-history-detail',
  templateUrl: './history-detail.component.html',
  styleUrls: ['./history-detail.component.scss']
})
export class HistoryDetailComponent implements OnInit, OnDestroy {

  event: WFMEvent;
  category: Category;
  numberPage = 0;
  isLoaded = false;
  s1: Subscription;
  isEditVisible = false;
  sub1: Subscription;
  sub2: Subscription;
  sub3: Subscription;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private eventsService: EventsService,
              private categoriesService: CategoriesService,
              private billService: BillService) {
  }

  ngOnInit() {
    this.s1 = this.route.params
      .mergeMap((params: Params) => {
        this.numberPage = params['idx'];
        return this.eventsService.getEventById(params['id'])}
      )
      .mergeMap((event: WFMEvent) => {
        this.event = event;
        return this.categoriesService.getCategoryById(event.category);
      })
      .subscribe((category: Category) => {
        this.category = category;
        this.isLoaded = true;
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

    if (this.sub3) {
      this.sub3.unsubscribe();
    }
  }

  editHistory() {
    this.toggleEditVisibility(true);
  }

  applyEditHistory(newEvent: WFMEvent) {
    this.isLoaded = false;
    this.event = newEvent;
    this.sub3 = this.categoriesService.getCategoryById(this.event.category)
      .subscribe((category: Category) => {
        this.category = category;
        this.isLoaded = true;
       },
      () => {
        this.router.navigate(['/login']);
      });
    
  }

  deleteHistory(event) {
    this.sub1 = this.billService.getBill()
      .subscribe((bill: Bill) => {
        let value = 0;
        if (event.type === 'outcome') {
            value = +bill.value + +event.amount;
        } else {
          value = bill.value - event.amount;
        }

        this.sub2 = this.billService.updateBill({value, currency: bill.currency})
          .mergeMap(() => this.eventsService.deleteEventById(event.id))
          .subscribe(() => {
            this.router.navigate(['/system/history']);
          },
          () => {
            this.router.navigate(['/login']);
          });
      },
      () => {
        this.router.navigate(['/login']);
      });
  }

  closeEditHistory() {
    this.s1 = this.route.params
      .mergeMap((params: Params) => {
        this.numberPage = params['idx'];
        return this.eventsService.getEventById(params['id'])}
      )
      .mergeMap((event: WFMEvent) => {
        this.event = event;
        return this.categoriesService.getCategoryById(event.category);
      })
      .subscribe((category: Category) => {
        this.category = category;
        this.isLoaded = true;
      },
      () => {
        this.router.navigate(['/login']);
      });
    this.toggleEditVisibility(false)
  }

  back() {
    this.router.navigate(['/system/history']);
  }

  private toggleEditVisibility(dir: boolean) {
    this.isEditVisible = dir;
  }

}
