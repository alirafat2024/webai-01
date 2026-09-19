import { Component } from '@angular/core';
import { Input } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-hero',
  styleUrl: './hero.css',
  templateUrl: './hero.html',
})
export class Hero {
  @Input() data: Record<string, unknown> = {};
  @Input() siteTitle = 'John Doe';
}
