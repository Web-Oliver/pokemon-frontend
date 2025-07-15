// API Configuration
// Backend location: SAFESPACE/pokemon-collection-backend
// Backend runs on PORT 3000 (confirmed from server.js: const PORT = process.env.PORT || 3000)
export const API_BASE_URL = 'http://localhost:3000/api';

// Enum definitions matching actual backend schema values
export enum PaymentMethod {
  _CASH = 'CASH',
  MOBILEPAY = 'Mobilepay',
  _BANK_TRANSFER = 'BankTransfer',
}

export enum DeliveryMethod {
  SENT = 'Sent',
  _LOCAL_MEETUP = 'Local Meetup',
}

export enum Source {
  _FACEBOOK = 'Facebook',
  _DBA = 'DBA',
}
