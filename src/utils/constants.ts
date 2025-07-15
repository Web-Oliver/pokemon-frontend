// API Configuration
// Backend location: SAFESPACE/pokemon-collection-backend
// Backend runs on PORT 3000 (confirmed from server.js: const PORT = process.env.PORT || 3000)
export const API_BASE_URL = 'http://localhost:3000/api';

// Enum definitions matching actual backend schema values
export enum PaymentMethod {
  CASH = 'CASH',
  MOBILEPAY = 'Mobilepay',
  BANK_TRANSFER = 'BankTransfer',
}

export enum DeliveryMethod {
  SENT = 'Sent',
  LOCAL_MEETUP = 'Local Meetup',
}

export enum Source {
  FACEBOOK = 'Facebook',
  DBA = 'DBA',
}
