import { Component, EventEmitter, OnDestroy, Output, Input, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Subscription } from 'rxjs/Subscription';
import { Router } from '@angular/router';
import { CategoriesService } from '../../shared/services/categories.service';
import { Category } from '../../shared/models/category.model';
import { Message } from '../../../shared/models/message.model';


@Component({
  selector: 'wfm-add-category',
  templateUrl: './add-category.component.html',
  styleUrls: ['./add-category.component.scss']
})
export class AddCategoryComponent implements OnDestroy, OnInit {
  fetched: boolean = false;
  sub1: Subscription;
  @Input() loading: boolean = false;
  @Output() onCategoryAdd = new EventEmitter<Category>();
  @Output() onLoading = new EventEmitter<boolean>();

  timerID: any;
  message: Message;

  constructor(private categoriesService: CategoriesService,
              private router: Router) {
  }

  ngOnInit() {
    this.message = new Message('', '');
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
    let {name, capacity} = form.value;
    if (capacity < 0) capacity *= -1;

    const category = new Category(name, capacity);
 
    this.sub1 = this.categoriesService.addCategory(category)
      .subscribe(
        (category: Category) => {

          form.reset();
          form.form.patchValue({capacity: 1});
          this.onCategoryAdd.emit(category);
          this.onLoading.emit(false);
          this.showMessage('success', 'Категория успешно добавлена.');
        },
        error => {
          this.router.navigate(['/login'])
        }
      );

  }

  ngOnDestroy() {
    if (this.sub1) this.sub1.unsubscribe();
  }

}
