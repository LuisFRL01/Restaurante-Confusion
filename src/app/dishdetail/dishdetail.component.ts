import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Dish } from '../shared/dish';
import { Comment } from '../shared/comment';
import { DishService } from '../services/dish.service';

import { Params, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { switchMap } from 'rxjs/operators';

import { visibility, flyInOut, expand } from '../animations/app.animation';

import { FA_ICONS } from '../shared/fontawesome-const'

@Component({
  selector: 'app-dishdetail',
  templateUrl: './dishdetail.component.html',
  styleUrls: ['./dishdetail.component.scss'],
  host: {
    '[@flyInOut]': 'true',
    'style': 'display: block'
  },
  animations: [
    visibility(),
    flyInOut(),
    expand()
  ]
})
export class DishdetailComponent implements OnInit {

  dishIds: string[];
  prev: string;
  next: string;
  dish: Dish;
  dishcopy: Dish;

  dishErrMess: string;

  feedbackDishForm: FormGroup;
  comment: Comment;

  visibility = 'shown';

  FA_ICONS = FA_ICONS;

  @ViewChild('fform') feedbackDishFormDirective;

  formErrors = {
    'author': '',
    'comment': ''
  }

  validationMessages = {
    'author': {
      'required': 'Author is required.',
      'minlength': 'Author name must be at least 2 characters long.',
      'maxlength': 'Author name cannot be more than 25 characters long.'
    },
    'comment': {
      'required': 'Comment is required.',
      'minlength': 'Comment must be at least 2 characters long.'
    }
  }

  constructor(private dishservice: DishService,
    private route: ActivatedRoute,
    private location: Location,
    private fb: FormBuilder,
    @Inject('BaseURL') private BaseURL) { this.createForm(); }

  ngOnInit() {
    this.dishservice.getDishIds().subscribe(dishIds => this.dishIds = dishIds);
    this.route.params.pipe(switchMap((params: Params) => { this.visibility = 'hidden'; return this.dishservice.getDish(params['id']); }))
      .subscribe(dish => {
        this.dish = dish; this.dishcopy = dish;
        this.setPrevNext(dish.id); this.visibility = 'shown';
      }, dishErrMess => this.dishErrMess = <any>dishErrMess);
  }

  createForm() {
    this.feedbackDishForm = this.fb.group({
      author: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(25)]],
      rating: 5,
      comment: ['', [Validators.required, Validators.minLength(2)]]
    });

    this.feedbackDishForm.valueChanges.subscribe(data => this.onValueChanged(data));
  }

  onValueChanged(data?: any) {
    if (!this.feedbackDishForm) { return; }
    const form = this.feedbackDishForm;
    for (const field in this.formErrors) {
      if (this.formErrors.hasOwnProperty(field)) {
        this.formErrors[field] = '';
        const control = form.get(field);
        if (control && control.dirty && !control.valid) {
          const messages = this.validationMessages[field];
          for (const key in control.errors) {
            if (control.errors.hasOwnProperty(key)) {
              this.formErrors[field] += messages[key] + ' ';
            }
          }
        }
      }
    }
  }

  setPrevNext(dishId: string) {
    const index = this.dishIds.indexOf(dishId);
    this.prev = this.dishIds[(this.dishIds.length + index - 1) % this.dishIds.length];
    this.next = this.dishIds[(this.dishIds.length + index + 1) % this.dishIds.length];
  }

  goBack(): void {
    this.location.back();
  }

  onSubmit() {
    this.comment = this.feedbackDishForm.value;
    this.comment.date = new Date().toISOString();

    this.dishcopy.comments.push(this.comment);
    this.dishservice.putDish(this.dishcopy).
      subscribe(dish => { this.dish = dish; this.dishcopy = dish }, dishErrMess => { this.dish = null; this.dishcopy = null; this.dishErrMess = <any>dishErrMess; });

    this.feedbackDishFormDirective.resetForm();

    this.feedbackDishForm.reset({
      author: '',
      rating: 5,
      comment: ''
    });
  }
}
