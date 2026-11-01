import type { FaqCategory } from '@/components/faqs/FaqSection';

// Single source of truth for the storefront FAQs — shown by <FaqSection /> on the home, about,
// contact and /faqs pages.
export const FAQ_CATEGORIES: FaqCategory[] = [
  {
    title: 'Ordering & WhatsApp confirmation',
    questions: [
      {
        question: 'How do I place an order?',
        answer:
          'Add the items you need to your cart, enter your delivery details, and submit your order. Our team will then contact you on WhatsApp to confirm the items, address, and final order details before it is prepared.',
      },
      {
        question: 'Is my order confirmed as soon as I submit it?',
        answer:
          'Your order request is received when you submit it, but it is confirmed after our team verifies it with you on WhatsApp. Please keep an eye on your WhatsApp messages so we can help your order move ahead quickly.',
      },
      {
        question: 'Can I change or cancel my order?',
        answer:
          'Yes, please message us on WhatsApp as soon as possible. We will do our best to update or cancel the order if it has not already been prepared or sent for delivery.',
      },
    ],
  },
  {
    title: 'Payment',
    questions: [
      {
        question: 'Which payment methods do you accept?',
        answer:
          'Pet’s Friendly Shop currently accepts Cash on Delivery only. You pay the delivery rider when your confirmed order arrives; online card payments and payment gateway checkout are not available at this time.',
      },
      {
        question: 'Do I need to pay anything online to place an order?',
        answer:
          'No. There is no online payment step. After you confirm the order with our team on WhatsApp, payment is collected as Cash on Delivery when the order is delivered.',
      },
    ],
  },
  {
    title: 'Shipping & Delivery',
    questions: [
      {
        question: 'Which areas do you deliver to?',
        answer:
          'Delivery areas are being finalized. Please share your address with us on WhatsApp before confirmation, and our team will let you know whether delivery is available for your location.',
      },
      {
        question: 'How long will delivery take?',
        answer:
          'Delivery timing depends on your location, item availability, and order confirmation time. Our team will share the expected delivery window with you on WhatsApp once your order has been confirmed.',
      },
      {
        question: 'Will I be contacted before delivery?',
        answer:
          'Yes. Please provide an active phone number and keep it available after confirmation. Our team or delivery rider may contact you if they need help completing the delivery.',
      },
    ],
  },
  {
    title: 'Returns & Refunds',
    questions: [
      {
        question: 'Can I return an item?',
        answer:
          'If an item arrives damaged, incorrect, or has a quality concern, please contact us on WhatsApp promptly with your order details and clear photos where possible. Our team will review the issue and guide you through the next steps.',
      },
      {
        question: 'How are refunds handled for Cash on Delivery orders?',
        answer:
          'As orders are paid by Cash on Delivery, any approved return or refund arrangement will be discussed directly with you after our team reviews the issue. The exact method and timing will depend on the order and resolution agreed with you.',
      },
    ],
  },
  {
    title: 'Account & Order Tracking',
    questions: [
      {
        question: 'Do I need an account to place an order?',
        answer:
          'You can browse the store freely. If an account option is available, it can make it easier to manage your details; our team will still confirm each order with you on WhatsApp before delivery.',
      },
      {
        question: 'How can I track my order?',
        answer:
          'Order updates are shared through WhatsApp. If you would like an update after your order has been confirmed, message us with your name and order details and our team will be happy to help.',
      },
    ],
  },
];

// Page-specific FAQs — each page shows only the questions that make sense on it, while the
// home page and /faqs keep the full FAQ_CATEGORIES list above.
export const ABOUT_FAQS: FaqCategory[] = [
  {
    title: 'About Pet’s Friendly Shop',
    questions: [
      {
        question: 'Who is Pet’s Friendly Shop?',
        answer:
          'Pet’s Friendly Shop is a locally rooted pet store serving pet parents across Pakistan. We handpick everyday essentials, food, toys, grooming supplies and accessories, and back every order with friendly, real human support.',
      },
      {
        question: 'How do you choose the products you sell?',
        answer:
          'We choose items we would feel comfortable using for our own pets, focusing on quality, trust and everyday usefulness. If you are unsure which product suits your pet, our team is happy to guide you.',
      },
      {
        question: 'Do you only sell products?',
        answer:
          'No. Along with our store, we offer veterinary and pet care services. You can see everything we offer on our Services page.',
      },
    ],
  },
  {
    title: 'Shopping with us',
    questions: [
      {
        question: 'How do I order from Pet’s Friendly Shop?',
        answer:
          'Add items to your cart and submit your order. Our team then confirms the details with you on WhatsApp, and you pay with Cash on Delivery when it arrives.',
      },
      {
        question: 'Can I ask questions before I buy?',
        answer:
          'Of course. Message us on WhatsApp or use the contact form and a real person from our team will help with product questions and suggestions.',
      },
    ],
  },
];

export const CONTACT_FAQS: FaqCategory[] = [
  {
    title: 'Getting in touch',
    questions: [
      {
        question: 'What is the fastest way to reach you?',
        answer:
          'WhatsApp is usually the quickest way to reach our team. You can also call us or send a message using the contact form on this page.',
      },
      {
        question: 'How soon will you reply?',
        answer:
          'We aim to respond to messages the same day. Replies can take a little longer outside our working hours.',
      },
      {
        question: 'Can I visit your shop?',
        answer:
          'Our shop address and working hours are listed on this page. If you plan to visit for a specific product, message us first so we can confirm it is available.',
      },
    ],
  },
  {
    title: 'Orders & support',
    questions: [
      {
        question: 'I have a problem with my order. What should I do?',
        answer:
          'Message us on WhatsApp with your name and order details, and clear photos if an item arrived damaged or incorrect. Our team will review it and guide you through the next steps.',
      },
      {
        question: 'Can you help me choose the right product?',
        answer:
          'Yes. Tell us about your pet, such as the type, age and any needs, and we will suggest suitable options.',
      },
    ],
  },
];

export const SERVICES_FAQS: FaqCategory[] = [
  {
    title: 'Our services',
    questions: [
      {
        question: 'What services does Pet’s Friendly Shop offer?',
        answer:
          'We offer veterinary and pet care services such as checkups, vaccinations and emergency support. The full list is shown on this page, and each service has its own details page.',
      },
      {
        question: 'How do I find out more about a service?',
        answer:
          'Open any service card and choose View Service to see what to expect. You can also message our team with any questions before you book.',
      },
    ],
  },
  {
    title: 'Appointments & emergencies',
    questions: [
      {
        question: 'How do I book an appointment?',
        answer:
          'Use the Book an Appointment button or contact us on WhatsApp, and our team will help set up a suitable visit for your pet.',
      },
      {
        question: 'What should I do in an emergency?',
        answer:
          'Tap the emergency service on this page to message our team on WhatsApp right away. For a life-threatening situation, please go to the nearest veterinary clinic immediately.',
      },
    ],
  },
];
