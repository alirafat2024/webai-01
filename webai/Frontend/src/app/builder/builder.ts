import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { ChatMessage, Website } from '../models/website';
import { Renderer } from '../components/renderer/renderer';

@Component({
  imports: [CommonModule, FormsModule, Renderer,MatIconModule],
  selector: 'app-builder',
  styleUrl: './builder.css',
  templateUrl: './builder.html',
})
export class Builder implements OnInit {
  website: Website | null = null;
  messages: ChatMessage[] = [];
  prompt = '';
  loading = false;
  error = '';
  previewMode: 'desktop' | 'tablet' | 'mobile' = 'desktop';
  private initialPromptSubmitted = false;

  projectId: string | null = null;
  projectStatus: 'initializing' | 'starting' | 'running' | 'stopped' | 'error' = 'initializing';
  projectPreviewUrl: SafeResourceUrl | null = null;
  projectPreviewDisplayUrl: string | null = null;
  projectRunning = false;
  iframeError: string | null = null;

  constructor(
    private http: HttpClient,
    private router: Router,
    private changeDetector: ChangeDetectorRef,
    private sanitizer: DomSanitizer,
  ) {}
  ngOnInit(): void {
    const navigationState = this.router.getCurrentNavigation()?.extras.state;
    const historyState = typeof history !== 'undefined' ? history.state : undefined;
    const state = navigationState ?? historyState;

    const projectId = state?.['projectId'] as string | undefined;
    const initialPrompt = state?.['initialPrompt'] as string | undefined;

    if (projectId) {
      this.projectId = projectId;
      if (initialPrompt && !this.initialPromptSubmitted) {
        this.initialPromptSubmitted = true;
        this.handleInitialPrompt(initialPrompt);
      } else {
        // If no initial prompt but we have a project ID, just start the project
        this.startProject();
      }
    } else {
      this.projectStatus = 'error';
      this.error = 'No project ID provided. Please start from the home page.';
    }
  }

  handleInitialPrompt(initialPrompt: string): void {
    this.messages.push({ role: 'user', content: initialPrompt });
    this.loading = true;
    this.projectStatus = 'initializing';

    // Start the project first (install dependencies and run it)
    this.startProject();
  }

  openExistingProject(): void {
    this.loading = true;
    this.projectStatus = 'initializing';
    this.messages.push({
      role: 'assistant',
      content: 'Opening existing project...',
    });
    this.startProject();
  }

  submitPrompt(value = this.prompt): void {
    const prompt = value.trim();
    if (!prompt || this.loading) return;

    // Check if project is running before allowing modifications
    if (!this.projectRunning) {
      this.messages.push({
        role: 'assistant',
        content: 'Please wait for the project to start before making modifications.',
      });
      this.changeDetector.detectChanges();
      return;
    }

    this.messages.push({ role: 'user', content: prompt });
    this.prompt = '';
    this.loading = true;
    this.error = '';

    this.http.post('http://localhost:3000/api/coding/modify', {
      projectId: this.projectId,
      prompt: prompt
    }).subscribe({
      next: () => {
        this.messages.push({
          role: 'assistant',
          content: 'Project updated successfully.',
        });
        this.loading = false;
        this.changeDetector.detectChanges();

        if (this.projectRunning && this.projectPreviewUrl) {
          this.refreshPreview();
        }
      },
      error: (error) => {
        console.error('Failed to modify project:', error);
        this.error = 'Failed to modify project. Please try again.';
        this.messages.push({ role: 'assistant', content: this.error });
        this.loading = false;
        this.changeDetector.detectChanges();
      },
    });
  }

  startProject(): void {
    if (!this.projectId || this.projectRunning) return;

    // Clear any existing iframe state
    this.iframeError = null;
    this.projectPreviewUrl = null;
    this.projectPreviewDisplayUrl = null;
    
    this.projectStatus = 'starting';
    this.loading = true;

    this.http.post<{ projectId: string; status: string; frontendUrl: string; backendUrl: string }>(
      `http://localhost:3000/api/projects/${this.projectId}/start`,
      {}
    ).subscribe({
      next: (response) => {
        this.projectStatus = 'running';
        this.projectRunning = true;
        this.projectPreviewDisplayUrl = response.frontendUrl;
        
        // Add a small delay before setting the iframe URL to ensure proper cleanup
        setTimeout(() => {
          this.projectPreviewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
            response.frontendUrl + '?t=' + Date.now() // Add timestamp to prevent caching
          );
          this.loading = false;
          
          // Add success message
          this.messages.push({
            role: 'assistant',
            content: `Project started successfully! Preview available at ${response.frontendUrl}. You can now describe changes to modify your website.`,
          });
          
          // Set a timeout to check if iframe loads successfully
          setTimeout(() => {
            if (this.iframeError) {
              console.warn('Iframe may not have loaded successfully, attempting refresh...');
              this.forceRefreshPreview();
            }
          }, 10000); // Check after 10 seconds
          
          this.changeDetector.detectChanges();
        }, 500);
      },
      error: (error) => {
        console.error('Failed to start project:', error);
        this.error = 'Failed to start project. Please try again.';
        this.projectStatus = 'error';
        this.loading = false;
        this.iframeError = this.error;
        this.messages.push({ role: 'assistant', content: this.error });
        this.changeDetector.detectChanges();
      },
    });
  }

  stopProject(): void {
    if (!this.projectId || !this.projectRunning) return;

    this.http.post(`http://localhost:3000/api/projects/${this.projectId}/stop`, {}).subscribe({
      next: () => {
        this.projectStatus = 'stopped';
        this.projectRunning = false;
        
        // Clear iframe state completely
        this.projectPreviewUrl = null;
        this.projectPreviewDisplayUrl = null;
        this.iframeError = null;
        
        this.changeDetector.detectChanges();
      },
      error: (error) => {
        console.error('Failed to stop project:', error);
        this.error = 'Failed to stop project. Please try again.';
        this.changeDetector.detectChanges();
      },
    });
  }

  refreshPreview(): void {
    if (this.projectPreviewDisplayUrl) {
      this.projectPreviewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.projectPreviewDisplayUrl + '?t=' + Date.now());
      this.changeDetector.detectChanges();
    }
  }

  forceRefreshPreview(): void {
    if (this.projectPreviewDisplayUrl) {
      this.iframeError = null;
      this.projectPreviewUrl = null;
      this.changeDetector.detectChanges();
      
      setTimeout(() => {
        this.projectPreviewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.projectPreviewDisplayUrl + '?t=' + Date.now());
        this.changeDetector.detectChanges();
      }, 100);
    }
  }

  openInNewTab(): void {
    if (this.projectPreviewDisplayUrl) {
      window.open(this.projectPreviewDisplayUrl, '_blank');
    }
  }

  onPromptKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.submitPrompt();
    }
  }

  goHome(): void {
    this.router.navigate(['/']);
  }

  getPlaceholder(): string {
    if (this.projectStatus === 'initializing') {
      return 'Initializing project... please wait';
    } else if (this.projectStatus === 'starting') {
      return 'Starting project and installing dependencies...';
    } else if (this.projectStatus === 'error') {
      return 'Project error. Please try again.';
    } else if (this.projectRunning) {
      return 'Describe what you want to change...';
    } else {
      return 'Project not running...';
    }
  }

  onIframeLoad(): void {
    console.log('Iframe loaded successfully');
    this.iframeError = null;
    this.changeDetector.detectChanges();
  }

  onIframeError(): void {
    console.error('Iframe failed to load');
    // Only set error if the project is supposed to be running
    if (this.projectRunning && this.projectPreviewDisplayUrl) {
      this.iframeError = 'Failed to load project preview. The server might still be starting or encountered an error. Try using "Force Refresh" or "Open in New Tab".';
    }
    this.changeDetector.detectChanges();
  }
}
