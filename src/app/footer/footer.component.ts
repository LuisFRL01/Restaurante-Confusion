import { Component, OnInit } from '@angular/core';
import { FA_ICONS } from '../shared/fontawesome-const';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {

  FA_ICONS = FA_ICONS;

  constructor() { }

  ngOnInit(): void {
  }

}
