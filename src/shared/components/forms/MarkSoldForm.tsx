/**
 * MarkSoldForm Component
 * Form for marking collection items as sold with comprehensive sale details
 * Following CLAUDE.md: DRY, SRP, and reusable design principles
 */

import React from 'react';
import { DollarSign } from 'lucide-react';
import { IBuyerAddress, ISaleDetails } from '../../../domain/models/common';
import { DeliveryMethod, PaymentMethod, Source } from '../../utils/constants';
import { PokemonForm, PokemonFormSection } from '../atoms/design-system/PokemonForm';
import { useMarkSold } from '../../hooks/useMarkSold';

interface MarkSoldFormProps {
  /** Item ID to mark as sold */
  itemId: string;
  /** Item type being sold */
  itemType: 'psa' | 'raw' | 'sealed';
  /** Callback when cancel is clicked */
  onCancel: () => void;
  /** Callback when item is successfully sold */
  onSuccess: () => void;
  /** Initial sale data for editing */
  initialData?: Partial<ISaleDetails>;
}

interface FormData extends ISaleDetails {
  buyerAddress: IBuyerAddress;
}

export const MarkSoldForm: React.FC<MarkSoldFormProps> = ({
  itemId,
  itemType,
  onCancel,
  onSuccess,
  initialData,
}) => {
  // Use the specialized mark as sold hook
  const { isProcessing, error, markAsSold, clearError } = useMarkSold({
    itemType,
    itemId,
    onSuccess,
    onError: (err) => console.error('Failed to mark item as sold:', err),
  });

  // Handle form submission
  const handleFormSubmit = async (data: FormData) => {
    clearError();

    // Format data for submission
    const formattedData: ISaleDetails = {
      ...data,
      dateSold: data.dateSold ? new Date(data.dateSold).toISOString() : undefined,
    };

    // Remove empty buyer address if not needed
    const deliveryMethod = data.deliveryMethod;
    const showBuyerInfo = deliveryMethod === DeliveryMethod.SENT;
    
    if (!showBuyerInfo || (!data.buyerAddress?.streetName && !data.buyerAddress?.postnr && !data.buyerAddress?.city)) {
      delete formattedData.buyerAddress;
    }

    await markAsSold(formattedData);
  };

  // Form configuration using PokemonForm
  const formSections: PokemonFormSection[] = [
    {
      id: 'sale-info',
      title: 'Sale Information',
      icon: DollarSign,
      fields: [
        {
          type: 'number',
          name: 'actualSoldPrice',
          label: 'Actual Sold Price',
          placeholder: 'Enter sale price',
          required: true,
          validation: {
            required: 'Sale price is required',
            min: { value: 0.01, message: 'Price must be greater than 0' }
          },
          leftIcon: <DollarSign className="w-4 h-4" />,
          step: 0.01,
          min: 0.01,
          fullWidth: true
        },
        {
          type: 'select',
          name: 'paymentMethod',
          label: 'Payment Method',
          required: true,
          validation: { required: 'Payment method is required' },
          options: Object.values(PaymentMethod).map((method) => ({
            value: method,
            label: method === PaymentMethod.MOBILEPAY ? 'MobilePay' : 
                   method === PaymentMethod.BANK_TRANSFER ? 'Bank Transfer' : method,
          })),
          fullWidth: true
        },
        {
          type: 'select',
          name: 'deliveryMethod',
          label: 'Delivery Method',
          required: true,
          validation: { required: 'Delivery method is required' },
          options: Object.values(DeliveryMethod).map((method) => ({
            value: method,
            label: method,
          })),
          fullWidth: true
        },
        {
          type: 'select',
          name: 'source',
          label: 'Sale Source',
          required: true,
          validation: { required: 'Sale source is required' },
          options: Object.values(Source).map((source) => ({
            value: source,
            label: source,
          })),
          fullWidth: true
        },
        {
          type: 'date',
          name: 'dateSold',
          label: 'Date Sold',
          required: true,
          validation: { required: 'Sale date is required' },
          fullWidth: true
        }
      ]
    },
    {
      id: 'buyer-info',
      title: 'Buyer Information',
      description: 'Required for sent items',
      fields: [
        {
          type: 'input',
          name: 'buyerFullName',
          label: 'Buyer Full Name',
          placeholder: 'Enter buyer name',
          conditionalOn: {
            field: 'deliveryMethod',
            value: DeliveryMethod.LOCAL_MEETUP,
            operator: '='
          },
          validation: { required: 'Buyer name is required' },
          fullWidth: true
        },
        {
          type: 'input',
          name: 'buyerFullName',
          label: 'Buyer Full Name',
          placeholder: 'Enter buyer name',
          conditionalOn: {
            field: 'deliveryMethod',
            value: DeliveryMethod.SENT,
            operator: '='
          },
          validation: { required: 'Buyer name is required' },
          fullWidth: true
        },
        {
          type: 'input',
          name: 'buyerAddress.streetName',
          label: 'Street Address',
          placeholder: 'Enter street address',
          conditionalOn: {
            field: 'deliveryMethod',
            value: DeliveryMethod.SENT,
            operator: '='
          },
          validation: { required: 'Street address is required' },
          fullWidth: true
        },
        {
          type: 'input',
          name: 'buyerAddress.postnr',
          label: 'Postal Code',
          placeholder: 'Enter postal code',
          conditionalOn: {
            field: 'deliveryMethod',
            value: DeliveryMethod.SENT,
            operator: '='
          },
          validation: { required: 'Postal code is required' },
          fullWidth: true
        },
        {
          type: 'input',
          name: 'buyerAddress.city',
          label: 'City',
          placeholder: 'Enter city',
          conditionalOn: {
            field: 'deliveryMethod',
            value: DeliveryMethod.SENT,
            operator: '='
          },
          validation: { required: 'City is required' },
          fullWidth: true
        },
        {
          type: 'tel',
          name: 'buyerPhoneNumber',
          label: 'Phone Number',
          placeholder: 'Enter phone number',
          conditionalOn: {
            field: 'deliveryMethod',
            value: DeliveryMethod.SENT,
            operator: '='
          },
          fullWidth: true
        },
        {
          type: 'email',
          name: 'buyerEmail',
          label: 'Email Address',
          placeholder: 'Enter email address',
          conditionalOn: {
            field: 'deliveryMethod',
            value: DeliveryMethod.SENT,
            operator: '='
          },
          fullWidth: true
        },
        {
          type: 'input',
          name: 'trackingNumber',
          label: 'Tracking Number',
          placeholder: 'Enter tracking number',
          conditionalOn: {
            field: 'deliveryMethod',
            value: DeliveryMethod.SENT,
            operator: '='
          },
          fullWidth: true
        }
      ]
    }
  ];

  // Default values
  const defaultValues = {
    paymentMethod: initialData?.paymentMethod || '',
    actualSoldPrice: initialData?.actualSoldPrice,
    deliveryMethod: initialData?.deliveryMethod || '',
    source: initialData?.source || '',
    dateSold: initialData?.dateSold || new Date().toISOString().split('T')[0],
    buyerFullName: initialData?.buyerFullName || '',
    buyerAddress: {
      streetName: initialData?.buyerAddress?.streetName || '',
      postnr: initialData?.buyerAddress?.postnr || '',
      city: initialData?.buyerAddress?.city || '',
    },
    buyerPhoneNumber: initialData?.buyerPhoneNumber || '',
    buyerEmail: initialData?.buyerEmail || '',
    trackingNumber: initialData?.trackingNumber || '',
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-900/30 border border-red-600 rounded-lg">
          <p className="text-red-300">Error: {error.message}</p>
        </div>
      )}

      <PokemonForm
        formType="sale"
        title="Mark Item as Sold"
        description="Enter the sale details for this item"
        icon={DollarSign}
        sections={formSections}
        defaultValues={defaultValues}
        onSubmit={handleFormSubmit}
        onCancel={onCancel}
        isSubmitting={isProcessing}
        submitText="Mark as Sold"
        cancelText="Cancel"
        variant="glass"
        layout="sections"
        spacing="normal"
      />
    </div>
  );
};

export default MarkSoldForm;
