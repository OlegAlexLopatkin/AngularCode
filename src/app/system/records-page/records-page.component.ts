import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Category } from '../shared/models/category.model';
import { CategoriesService } from '../shared/services/categories.service';

@Component({
  selector: 'wfm-records-page',
  templateUrl: './records-page.component.html',
  styleUrls: ['./records-page.component.scss']
})
export class RecordsPageComponent implements OnInit {

  categories: Category[] = [];
  isLoaded = false;
  isCategoriesEmpty = true;
  loading = false;

  constructor(private categoriesService: CategoriesService,
              private router: Router) {
  }

  ngOnInit() {
    this.categoriesService.getCategories()
      .subscribe((categories: Category[]) => {
        this.categories = categories;
        this.isLoaded = true;
        this.categoriesEmprty(this.categories);
      },
      () => this.router.navigate(['/login']));
  }

  newCategoryAdded(category: Category) {
    this.categories.push(category);
    this.categoriesEmprty(this.categories);
  }

  categoryWasEdited(category: Category) {
    const idx = this.categories
      .findIndex(c => c.id === category.id);
    this.categories[idx] = category;
  }

  categoryWasDelete(categories: Category[]) {
    this.categories = categories;
    this.categoriesEmprty(this.categories);
  }

  categoriesEmprty(categories) {
    if(categories.length > 0 ) {
      this.isCategoriesEmpty = false;
    } else {
      this.isCategoriesEmpty = true;
    }
  }

  dataLoader(event) {
    this.loading = event;
  }

}
