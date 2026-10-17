import React from 'react';
import { FaWhatsapp } from 'react-icons/fa6';

export interface WhatsAppContact {
  id: string;
  name: string;
  number: string;
  displayNumber: string;
  role: string;
}

export const WHATSAPP_CONTACTS: WhatsAppContact[] = [
  {
    id: '1',
    name: 'Azizullah Munsif',
    number: '+93 70 526 9096',
    displayNumber: '+93 70 526 9096',
    role: 'Owner & Support',
  },
  {
    id: '2',
    name: 'DigitalAzizi Support',
    number: '+92 312 8339505',
    displayNumber: '+92 312 8339505',
    role: 'Technical Assistance',
  },
];

export default function WhatsAppSupportSection() {
  return (
    <div className="flex justify-between font-sans">
      {WHATSAPP_CONTACTS.map((contact) => {
        const whatsappUrl = `https://wa.me/${contact.number}?text=${encodeURIComponent(
          'Hello DigitalAzizi Team, I need assistance with...'
        )}`;

        return (
          <a
            key={contact.id}
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`WhatsApp ${contact.displayNumber}`}
            className="whatsapp-contact-link inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold shadow-md transition-colors"
          >
            <FaWhatsapp className="whatsapp-contact-icon h-5 w-5 shrink-0" />
            <span>{contact.displayNumber}</span>
          </a>
        );
      })}
    </div>
  );
}
