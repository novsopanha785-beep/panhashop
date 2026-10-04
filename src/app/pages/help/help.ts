import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

interface FaqSection {
  id: string;
  title: string;
  icon: string;
  items: FaqItem[];
}

@Component({
  selector: 'app-help',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  templateUrl: './help.html',
  styleUrl: './help.css',
})
export class Help {
  readonly sections: FaqSection[] = [
    {
      id: 'shipping',
      title: 'Shipping',
      icon: '🚚',
      items: [
        {
          id: 'shipping-1',
          question: 'How long does delivery take?',
          answer:
            'Standard delivery is simulated for this demo. In a live store, most orders would arrive within 3–5 business days.',
        },
        {
          id: 'shipping-2',
          question: 'Is shipping free?',
          answer: 'Yes — shipping is free on every order shown at checkout, with no minimum spend.',
        },
        {
          id: 'shipping-3',
          question: 'Can I track my order?',
          answer:
            'Order tracking isn\u2019t wired up in this demo project, but your order confirmation includes a unique order number for reference.',
        },
      ],
    },
    {
      id: 'returns',
      title: 'Returns',
      icon: '↩',
      items: [
        {
          id: 'returns-1',
          question: 'What is your return policy?',
          answer:
            'This storefront offers a 30-day return window on all items, shown on the checkout page as a guarantee.',
        },
        {
          id: 'returns-2',
          question: 'How do I start a return?',
          answer:
            'Reach out through the Contact page with your order number and we\u2019ll walk you through it.',
        },
      ],
    },
    {
      id: 'payments',
      title: 'Payments',
      icon: '💳',
      items: [
        {
          id: 'payments-1',
          question: 'What payment methods are supported?',
          answer:
            'At checkout you can choose Cash on Delivery, Card, or Bank Transfer / QR Pay. All three are simulated — no real payment is ever processed or stored.',
        },
        {
          id: 'payments-2',
          question: 'Is my payment information safe?',
          answer:
            'This is a student demo project, so no payment details are collected, transmitted, or stored anywhere.',
        },
      ],
    },
    {
      id: 'account',
      title: 'Orders & Account',
      icon: '🛒',
      items: [
        {
          id: 'account-1',
          question: 'Do I need an account to buy something?',
          answer:
            'No — this demo supports guest checkout only, so you can go straight from cart to order confirmation.',
        },
        {
          id: 'account-2',
          question: 'Why is my cart empty after I refresh?',
          answer:
            'Your cart is saved in your browser\u2019s local storage, so it should persist across refreshes on the same device and browser unless storage was cleared.',
        },
      ],
    },
  ];

  private openIds = signal<Set<string>>(new Set());

  isOpen(id: string): boolean {
    return this.openIds().has(id);
  }

  toggle(id: string): void {
    this.openIds.update((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }
}
