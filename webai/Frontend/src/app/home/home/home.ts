import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface Project {
  id: number;
  projectId: string;
  name: string;
  prompt: string;
  folderPath: string;
  status: string;
  frontendPort: number | null;
  backendPort: number | null;
  createdAt: string;
  updatedAt: string;
}

@Component({
  imports: [FormsModule, CommonModule],
  selector: 'app-home',
  styleUrl: './home.css',
  templateUrl: './home.html',
})
export class Home implements OnInit {
  prompt = '';
  loading = false;
  projects: Project[] = [];
  projectsLoading = false;

  constructor(private router: Router, private http: HttpClient, private changeDetector: ChangeDetectorRef) {}

  ngOnInit(): void {
    console.log('Home component initialized');
    this.loadProjects();
  }

  loadProjects(): void {
    this.projectsLoading = true;
    console.log('Loading projects from backend...');
    
    this.http.get<Project[]>('http://localhost:3000/api/get-projects').subscribe({
      next: (projects) => {
        console.log('Projects loaded successfully:', projects);
        this.projects = projects;
        this.projectsLoading = false;
        this.changeDetector.detectChanges();
      },
      error: (error) => {
        console.error('Failed to load projects:', error);
        this.projectsLoading = false;
        // Set empty array on error to show "No projects yet" message
        this.projects = [];
        this.changeDetector.detectChanges();
      }
    });
  }

  generateWebsite(prompt: string): void {
    const value = prompt.trim();
    if (!value) return;

    this.loading = true;

    this.http.post<{ projectId: string }>('http://localhost:3000/api/projects', { prompt: value }).subscribe({
      next: (response) => {
        // Navigate to builder with project ID - the builder will automatically start the project
        this.router.navigate(['/builder'], { state: { projectId: response.projectId, initialPrompt: value } });
      },
      error: (error) => {
        console.error('Failed to create project:', error);
        this.loading = false;
        alert('Failed to create project. Please try again.');
      }
    });
  }

  openProject(projectId: string): void {
    this.router.navigate(['/builder'], { state: { projectId } });
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }
}
