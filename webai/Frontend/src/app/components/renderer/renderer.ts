import { Component } from '@angular/core';
import { Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { About } from '../website/about/about';
import { Contact } from '../website/contact/contact';
import { Hero } from '../website/hero/hero';
import { Projects } from '../website/projects/projects';
import { Skills } from '../website/skills/skills';
import { Website } from '../../models/website';

@Component({
  imports: [CommonModule, Hero, About, Skills, Projects, Contact],
  selector: 'app-renderer',
  styleUrl: './renderer.css',
  templateUrl: './renderer.html',
})
export class Renderer {
  @Input() website: Website | null = null;
}
