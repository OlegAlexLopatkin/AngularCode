import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild, ElementRef } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { Category } from '../../shared/models/category.model';
import { CategoriesService } from '../../shared/services/categories.service';
import { EventsService } from '../../shared/services/events.service';
import { Bill } from '../../shared/models/bill.model';
import { WFMEvent } from '../../shared/models/event.model';
import { BillService } from '../../shared/services/bill.service';
import { Message } from '../../../shared/models/message.model';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'wfm-edit-category',
  templateUrl: './edit-category.component.html',
  styleUrls: ['./edit-category.component.scss']
})
export class EditCategoryComponent implements OnInit, OnDestroy {
  @ViewChild('modal') modalWindow: ElementRef;
  @Input() categories: Category[] = [];
  @Output() onCategoryEdit = new EventEmitter<Category>();
  @Output() onCategoryDelete = new EventEmitter<Category[]>();
  @Output() onLoading = new EventEmitter<boolean>();
  @Input() loading: boolean = false;
  currentCategoryId: number;
  currentCategory: Category;
  message: Message;
  success: boolean;
  sub1: Subscription;
  sub2: Subscription;
  timerID: any;

  constructor(private categoriesService: CategoriesService,
              private eventsService: EventsService,
              private billService: BillService,
              private router: Router) {
  }

  ngOnInit() {
    this.message = new Message('', '');
    this.currentCategory = this.categories[0];
    this.currentCategoryId = this.currentCategory.id;
    
  }

  private showMessage(type: string, text: string) {
    this.message.type = type;
    this.message.text = text;
    this.timerID = window.setTimeout(() => this.message.text = '', 5000);
  }

  onCategoryChange() {
    this.currentCategory = this.categories
      .find(c => c.id === +this.currentCategoryId);
  }

  onSubmit(form: NgForm) {
    this.onLoading.emit(true);
    if(this.timerID) {
      clearTimeout(this.timerID);
    }
    this.message.text = '';
    let {capacity, name} = form.value;
    if (capacity < 0) capacity *= -1;

    const category = new Category(name, capacity, +this.currentCategoryId);

    this.sub1 = this.categoriesService.updateCategory(category)
      .subscribe(
        (category: Category) => {
          this.onLoading.emit(false);
          this.onCategoryEdit.emit(category);
          this.showMessage('success', 'Категория успешно отредактирована.');
        },
        error => {
          this.router.navigate(['/login'])
        }
      );
  }

  ngOnDestroy() {
    if (this.sub1) this.sub1.unsubscribe();
    if (this.sub2) this.sub2.unsubscribe();
  }

  deleteEvent(event) {
    return this.billService.getBill()
      .mergeMap((bill: Bill) => {
        let value = 0;
        if (event.type === 'outcome') {
            value = +bill.value + +event.amount;
        } else {
          value = bill.value - event.amount;
        }
        
        return this.billService.updateBill({value, currency: bill.currency})
      })
      .merge(this.eventsService.deleteEventById(event.id))
 
  }
  showModal() {
    this.modalWindow.nativeElement.style.display = 'block';
    this.modalWindow.nativeElement.style.opacity = 1;
  }
  closeModal() {
    this.modalWindow.nativeElement.style.display = 'none';
    this.modalWindow.nativeElement.style.opacity = 0;
  }
  stopPopagation(event){
    event.stopPropagation();
  }

  deleteCategory() {
    this.onLoading.emit(true);
    if(this.timerID) {
      clearTimeout(this.timerID);
    }
    this.message.text = '';
    this.closeModal();
    let deletedEvents = [];

    this.sub2 = this.categoriesService.deleteCategory(this.currentCategoryId)
      .subscribe(
        () => {
          this.success = true;
        },
        error => {
          () => this.router.navigate(['/login'])
        },
        () => {
          if(this.success) {
            this.categories = this.categories.filter(c => c.id !== +this.currentCategoryId);
            this.onCategoryDelete.emit(this.categories);
            this.onLoading.emit(false);
            this.showMessage('success', 'Категория успешно удалена.');
            if(this.categories.length > 0) {
              this.currentCategory = this.categories[0];
              this.currentCategoryId = this.currentCategory.id;            
            }
          }
        }
      )
      
  }

}
