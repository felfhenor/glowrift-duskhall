import type { OnInit } from '@angular/core';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-transition',
  imports: [],
  templateUrl: './transition.component.html',
  styleUrl: './transition.component.scss',
})
export class TransitionComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  ngOnInit() {
    const nextPage = this.route.snapshot.queryParamMap.get('transitionTo');
    if (!nextPage) {
      this.router.navigate(['/']);
      return;
    }

    this.router.navigate([nextPage]);
  }
}
