import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-about',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  templateUrl: './about.html',
  styleUrl: './about.css',
})
export class About {
  readonly values = [
    {
      icon: '🎯',
      title: 'Curated Selection',
      text: 'Every product on PANHASHOP is chosen for everyday usefulness, not just trend value.',
    },
    {
      icon: '🚚',
      title: 'Fast, Reliable Delivery',
      text: 'We partner with trusted carriers so your order arrives quickly and in one piece.',
    },
    {
      icon: '🔒',
      title: 'Secure by Default',
      text: 'Checkout data stays on your device — this demo never sends payment details anywhere.',
    },
    {
      icon: '💬',
      title: 'Real Support',
      text: 'Questions before or after a purchase? Our team replies to every message we get.',
    },
  ];
}
