/**
 * Test file to verify that our TypeScript interfaces are correctly defined
 * by creating dummy data objects that conform to these interfaces
 */

import { IPriceHistoryEntry, ISaleDetails, IBuyerAddress } from '../common';
import { ISet, ICard, IPsaGradedCard, IRawCard, IPsaGrades } from '../card';
import { ISealedProduct, ICardMarketReferenceProduct, SealedProductCategory } from '../sealedProduct';
import { IAuction, IAuctionItem } from '../auction';
import { ISalesSummary, ISalesGraphData, ISale } from '../sale';

describe('Model Interface Validation', () => {
  test('Common interfaces should accept valid data', () => {
    const priceHistoryEntry: IPriceHistoryEntry = {
      dateUpdated: '2024-01-15T00:00:00.000Z',
      price: 29.99
    };

    const buyerAddress: IBuyerAddress = {
      streetName: '123 Main St',
      postnr: '12345',
      city: 'Anytown'
    };

    const saleDetails: ISaleDetails = {
      paymentMethod: 'CASH',
      actualSoldPrice: 150.00,
      deliveryMethod: 'Sent',
      source: 'Facebook',
      dateSold: '2024-01-15T00:00:00.000Z',
      buyerFullName: 'John Doe',
      buyerAddress: buyerAddress,
      buyerEmail: 'john@example.com',
      buyerPhoneNumber: '+1-555-0123',
      trackingNumber: 'TR123456789'
    };

    expect(priceHistoryEntry.dateUpdated).toBeDefined();
    expect(buyerAddress.streetName).toBeDefined();
    expect(saleDetails.paymentMethod).toBeDefined();
  });

  test('Card interfaces should accept valid data', () => {
    const set: ISet = {
      id: 'set_123',
      setName: 'Base Set',
      year: 1998,
      setUrl: 'https://example.com/base-set',
      totalCardsInSet: 102,
      totalPsaPopulation: 50000
    };

    const psaGrades: IPsaGrades = {
      psa_1: 5,
      psa_2: 12,
      psa_3: 25,
      psa_4: 40,
      psa_5: 80,
      psa_6: 120,
      psa_7: 200,
      psa_8: 300,
      psa_9: 500,
      psa_10: 150
    };

    const card: ICard = {
      id: 'card_123',
      setId: 'set_123',
      pokemonNumber: '4',
      cardName: 'Charizard',
      baseName: 'Charizard',
      variety: 'Holo',
      psaGrades: psaGrades,
      psaTotalGradedForCard: 1432,
      setName: 'Base Set',
      year: 1998
    };

    const psaGradedCard: IPsaGradedCard = {
      id: 'psa_123',
      cardId: 'card_123',
      grade: '9',
      images: ['image1.jpg', 'image2.jpg'],
      myPrice: 100.00,
      priceHistory: [
        { dateUpdated: '2024-01-01T00:00:00.000Z', price: 80.00 },
        { dateUpdated: '2024-01-15T00:00:00.000Z', price: 100.00 }
      ],
      dateAdded: '2024-01-01T00:00:00.000Z',
      sold: false,
      cardName: 'Charizard',
      setName: 'Base Set',
      pokemonNumber: '4',
      baseName: 'Charizard',
      variety: 'Holo'
    };

    const rawCard: IRawCard = {
      id: 'raw_123',
      cardId: 'card_123',
      condition: 'Near Mint',
      images: ['image1.jpg'],
      myPrice: 50.00,
      priceHistory: [
        { dateUpdated: '2024-01-01T00:00:00.000Z', price: 50.00 }
      ],
      dateAdded: '2024-01-01T00:00:00.000Z',
      sold: false,
      cardName: 'Charizard',
      setName: 'Base Set',
      pokemonNumber: '4',
      baseName: 'Charizard',
      variety: 'Holo'
    };

    expect(set.setName).toBeDefined();
    expect(card.cardName).toBeDefined();
    expect(psaGradedCard.grade).toBeDefined();
    expect(rawCard.condition).toBeDefined();
  });

  test('Sealed Product interfaces should accept valid data', () => {
    const cardMarketProduct: ICardMarketReferenceProduct = {
      id: 'sp_123',
      name: 'Base Set Booster Box',
      setName: 'Base Set',
      available: true,
      price: 5000.00,
      category: 'Booster-Boxes',
      url: 'https://cardmarket.com/product/123',
      lastUpdated: '2024-01-15T00:00:00.000Z'
    };

    const sealedProduct: ISealedProduct = {
      id: 'spci_123',
      productId: 'sp_123',
      category: SealedProductCategory.BOOSTER_BOXES,
      setName: 'Base Set',
      name: 'Base Set Booster Box',
      availability: 10,
      cardMarketPrice: 5000.00,
      myPrice: 4500.00,
      priceHistory: [
        { dateUpdated: '2024-01-01T00:00:00.000Z', price: 4200.00 },
        { dateUpdated: '2024-01-15T00:00:00.000Z', price: 4500.00 }
      ],
      images: ['box1.jpg', 'box2.jpg'],
      dateAdded: '2024-01-01T00:00:00.000Z',
      sold: false,
      productName: 'Base Set Booster Box'
    };

    expect(cardMarketProduct.name).toBeDefined();
    expect(sealedProduct.myPrice).toBeDefined();
  });

  test('Auction interfaces should accept valid data', () => {
    const auctionItem: IAuctionItem = {
      itemId: 'psa_123',
      itemCategory: 'PsaGradedCard',
      sold: true,
      salePrice: 150.00,
      itemName: 'Charizard Base Set PSA 9',
      itemImage: 'charizard.jpg'
    };

    const auction: IAuction = {
      id: 'auction_123',
      topText: 'Pokemon Card Auction - High Grade Cards!',
      bottomText: 'All cards are authentic and professionally graded.',
      auctionDate: '2024-02-01T20:00:00.000Z',
      status: 'active',
      generatedFacebookPost: 'Check out these amazing Pokemon cards!',
      isActive: true,
      items: [auctionItem],
      totalValue: 500.00,
      soldValue: 150.00,
      createdAt: '2024-01-15T00:00:00.000Z',
      updatedAt: '2024-01-15T00:00:00.000Z'
    };

    expect(auctionItem.itemCategory).toBeDefined();
    expect(auction.status).toBeDefined();
  });

  test('Sales interfaces should accept valid data', () => {
    const salesSummary: ISalesSummary = {
      totalRevenue: 5000.00,
      totalProfit: 2000.00,
      averageMargin: 40.0,
      totalItems: 25,
      categoryBreakdown: {
        psaGradedCard: {
          count: 15,
          revenue: 3000.00
        },
        rawCard: {
          count: 8,
          revenue: 1500.00
        },
        sealedProduct: {
          count: 2,
          revenue: 500.00
        }
      }
    };

    const salesGraphData: ISalesGraphData = {
      date: '2024-01-15T00:00:00.000Z',
      revenue: 300.00,
      profit: 120.00
    };

    const sale: ISale = {
      id: 'sale_123',
      itemCategory: 'PsaGradedCard',
      itemName: 'Charizard Base Set PSA 9',
      myPrice: 100.00,
      actualSoldPrice: 150.00,
      dateSold: '2024-01-15T00:00:00.000Z',
      source: 'Facebook'
    };

    expect(salesSummary.totalRevenue).toBeDefined();
    expect(salesGraphData.date).toBeDefined();
    expect(sale.itemCategory).toBeDefined();
  });
});