import { Component } from '@angular/core';
import {DatePipe} from '@angular/common';
import {Button} from 'primeng/button';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-home',
    imports: [
        DatePipe,
        Button,
        RouterLink
    ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {

}
