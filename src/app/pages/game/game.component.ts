import type { OnInit } from '@angular/core';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '@components/navbar/navbar.component';
import { discordUpdateStatus } from '@helpers/discord';

@Component({
  selector: 'app-game',
  imports: [RouterOutlet, NavbarComponent],
  templateUrl: './game.component.html',
  styleUrl: './game.component.scss',
})
export class GameComponent implements OnInit {
  ngOnInit() {
    discordUpdateStatus();
  }
}
