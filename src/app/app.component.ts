import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LinksService } from './links.service';
import { Link } from './link.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  private linksService = inject(LinksService);

  url = signal('');
  links = signal<Link[]>([]);
  lastCreated = signal<Link | null>(null);
  error = signal('');
  submitting = signal(false);

  constructor() {
    this.refresh();
  }

  private isHttpUrl(value: string): boolean {
    try {
      const parsed = new URL(value);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  }

  refresh(): void {
    this.linksService.list().subscribe({
      next: (links) => this.links.set(links),
      error: () => this.error.set('Could not load links from the server.')
    });
  }

  submit(): void {
    const value = this.url().trim();
    this.error.set('');
    this.lastCreated.set(null);

    if (!this.isHttpUrl(value)) {
      this.error.set('Please enter a valid http:// or https:// URL.');
      return;
    }

    this.submitting.set(true);
    this.linksService.create(value).subscribe({
      next: (link) => {
        this.lastCreated.set(link);
        this.url.set('');
        this.submitting.set(false);
        this.refresh();
      },
      error: (err) => {
        this.error.set(err?.error?.error ?? 'Something went wrong creating the link.');
        this.submitting.set(false);
      }
    });
  }
}
