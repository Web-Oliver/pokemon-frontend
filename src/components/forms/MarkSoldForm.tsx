/**
 * MarkSoldForm Component
 * Form for marking collection items as sold with comprehensive sale details
 * Following CLAUDE.md: DRY, SRP, and reusable design principles
 */

import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { DollarSign } from 'lucide-react';
import { ISaleDetails, IBuyerAddress } from '../../domain/models/common';
import { PaymentMethod, DeliveryMethod, Source } from '../../utils/constants';
import Button from '../common/Button';
import Input from '../common/Input';
import Select from '../common/Select';
import FormHeader from '../common/FormHeader';
import FormActionButtons from '../common/FormActionButtons';
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
    onError: err => console.error('Failed to mark item as sold:', err),
  });
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      paymentMethod: initialData?.paymentMethod || '', // Empty string for placeholder
      actualSoldPrice: initialData?.actualSoldPrice,
      deliveryMethod: initialData?.deliveryMethod || '', // Empty string for placeholder
      source: initialData?.source || '', // Empty string for placeholder
      dateSold: initialData?.dateSold || new Date().toISOString().split('T')[0], // Default to today
      buyerFullName: initialData?.buyerFullName || '',
      buyerAddress: {
        streetName: initialData?.buyerAddress?.streetName || '',
        postnr: initialData?.buyerAddress?.postnr || '',
        city: initialData?.buyerAddress?.city || '',
      },
      buyerPhoneNumber: initialData?.buyerPhoneNumber || '',
      buyerEmail: initialData?.buyerEmail || '',
      trackingNumber: initialData?.trackingNumber || '',
    },
  });

  // Watch deliveryMethod to conditionally show buyer info
  const deliveryMethod = watch('deliveryMethod');
  const showBuyerInfo = deliveryMethod === DeliveryMethod.SENT;
  const showBuyerName =
    deliveryMethod === DeliveryMethod.LOCAL_MEETUP || deliveryMethod === DeliveryMethod.SENT;

  const onFormSubmit = async (data: FormData) => {
    // Clear any previous errors
    clearError();

    // Convert date to ISO string if it's not already
    const formattedData: ISaleDetails = {
      ...data,
      dateSold: data.dateSold ? new Date(data.dateSold).toISOString() : undefined,
    };

    // Remove empty buyer address if not needed
    if (
      !showBuyerInfo ||
      (!data.buyerAddress?.streetName && !data.buyerAddress?.postnr && !data.buyerAddress?.city)
    ) {
      delete formattedData.buyerAddress;
    }

    // Use the hook to mark the item as sold
    await markAsSold(formattedData);
  };

  // Payment method options
  const paymentMethodOptions = Object.values(PaymentMethod).map(method => ({
    value: method,
    label:
      method === PaymentMethod.MOBILEPAY
        ? 'MobilePay'
        : method === PaymentMethod.BANK_TRANSFER
          ? 'Bank Transfer'
          : method,
  }));

  // Delivery method options
  const deliveryMethodOptions = Object.values(DeliveryMethod).map(method => ({
    value: method,
    label: method,
  }));

  // Source options
  const sourceOptions = Object.values(Source).map(source => ({
    value: source,
    label: source,
  }));

  return (
    <div className='max-w-2xl mx-auto'>
      {/* Reusable Form Header */}
      <FormHeader
        icon={DollarSign}
        title='Mark Item as Sold'
        description='Enter the sale details for this item'
        primaryColorClass='amber'
      />

      {/* Error Display */}
      {error && (
        <div className='mb-6 p-4 bg-red-900/30 border border-red-600 rounded-lg'>
          <p className='text-red-300'>Error: {error.message}</p>
        </div>
      )}

      <div className='bg-zinc-900/80 backdrop-blur-xl rounded-lg shadow-lg p-6 mt-6 border border-zinc-700/50'>
        <form onSubmit={handleSubmit(onFormSubmit)} className='space-y-6'>
          {/* Sale Information Section */}
          <div className='bg-zinc-800/50 p-4 rounded-lg border border-zinc-600/50'>
            <h3 className='text-lg font-semibold text-zinc-100 mb-4 flex items-center'>
              <svg
                className='w-5 h-5 mr-2 text-green-600'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1'
                />
              </svg>
              Sale Information
            </h3>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {/* Actual Sold Price */}
              <div>
                <Controller
                  name='actualSoldPrice'
                  control={control}
                  rules={{
                    required: 'Sale price is required',
                    min: { value: 0.01, message: 'Price must be greater than 0' },
                  }}
                  render={({ field }) => (
                    <Input
                      {...field}
                      label='Actual Sold Price *'
                      type='number'
                      step='0.01'
                      placeholder='0.00'
                      error={errors.actualSoldPrice?.message}
                      value={field.value || ''}
                      onChange={e => {
                        const value = e.target.value;
                        field.onChange(value === '' ? undefined : parseFloat(value));
                      }}
                    />
                  )}
                />
              </div>

              {/* Date Sold */}
              <div>
                <Controller
                  name='dateSold'
                  control={control}
                  rules={{ required: 'Sale date is required' }}
                  render={({ field }) => (
                    <Input
                      {...field}
                      label='Date Sold *'
                      type='date'
                      error={errors.dateSold?.message}
                      value={field.value ? field.value.split('T')[0] : ''}
                    />
                  )}
                />
              </div>

              {/* Payment Method */}
              <div>
                <Controller
                  name='paymentMethod'
                  control={control}
                  rules={{ required: 'Payment method is required' }}
                  render={({ field }) => (
                    <Select
                      {...field}
                      label='Payment Method *'
                      options={paymentMethodOptions}
                      error={errors.paymentMethod?.message}
                      placeholder='Select payment method'
                    />
                  )}
                />
              </div>

              {/* Source */}
              <div>
                <Controller
                  name='source'
                  control={control}
                  rules={{ required: 'Source is required' }}
                  render={({ field }) => (
                    <Select
                      {...field}
                      label='Source *'
                      options={sourceOptions}
                      error={errors.source?.message}
                      placeholder='Select sale source'
                    />
                  )}
                />
              </div>
            </div>
          </div>

          {/* Delivery Information Section */}
          <div className='bg-zinc-800/50 p-4 rounded-lg border border-zinc-600/50'>
            <h3 className='text-lg font-semibold text-zinc-100 mb-4 flex items-center'>
              <svg
                className='w-5 h-5 mr-2 text-blue-600'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4'
                />
              </svg>
              Delivery Information
            </h3>

            <div className='mb-4'>
              <Controller
                name='deliveryMethod'
                control={control}
                rules={{ required: 'Delivery method is required' }}
                render={({ field }) => (
                  <Select
                    {...field}
                    label='Delivery Method *'
                    options={deliveryMethodOptions}
                    error={errors.deliveryMethod?.message}
                    placeholder='Select delivery method'
                  />
                )}
              />
            </div>

            {/* Conditional Buyer Information */}
            {showBuyerName && (
              <div className='space-y-4 border-t pt-4'>
                <h4 className='font-medium text-zinc-100'>Buyer Information</h4>

                {/* Buyer Full Name */}
                <div>
                  <Controller
                    name='buyerFullName'
                    control={control}
                    rules={{
                      required:
                        deliveryMethod === DeliveryMethod.SENT ||
                        deliveryMethod === DeliveryMethod.LOCAL_MEETUP
                          ? 'Buyer full name is required'
                          : false,
                    }}
                    render={({ field }) => (
                      <Input
                        {...field}
                        label='Buyer Full Name *'
                        placeholder='John Doe'
                        error={errors.buyerFullName?.message}
                      />
                    )}
                  />
                </div>

                {/* Buyer Contact - only show for shipped items */}
                {showBuyerInfo && (
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div>
                      <Controller
                        name='buyerPhoneNumber'
                        control={control}
                        render={({ field }) => (
                          <Input
                            {...field}
                            label='Phone Number'
                            type='tel'
                            placeholder='+45 12 34 56 78'
                            error={errors.buyerPhoneNumber?.message}
                          />
                        )}
                      />
                    </div>

                    <div>
                      <Controller
                        name='buyerEmail'
                        control={control}
                        render={({ field }) => (
                          <Input
                            {...field}
                            label='Email'
                            type='email'
                            placeholder='buyer@example.com'
                            error={errors.buyerEmail?.message}
                          />
                        )}
                      />
                    </div>
                  </div>
                )}

                {/* Buyer Address - only show for shipped items */}
                {showBuyerInfo && (
                  <div className='space-y-4'>
                    <h5 className='font-medium text-zinc-200'>Shipping Address</h5>

                    <div>
                      <Controller
                        name='buyerAddress.streetName'
                        control={control}
                        rules={{
                          required:
                            deliveryMethod === DeliveryMethod.SENT
                              ? 'Street address is required for shipped items'
                              : false,
                        }}
                        render={({ field }) => (
                          <Input
                            {...field}
                            label='Street Address *'
                            placeholder='123 Main Street'
                            error={errors.buyerAddress?.streetName?.message}
                          />
                        )}
                      />
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                      <div>
                        <Controller
                          name='buyerAddress.postnr'
                          control={control}
                          rules={{
                            required:
                              deliveryMethod === DeliveryMethod.SENT
                                ? 'Postal code is required for shipped items'
                                : false,
                          }}
                          render={({ field }) => (
                            <Input
                              {...field}
                              label='Postal Code *'
                              placeholder='12345'
                              error={errors.buyerAddress?.postnr?.message}
                            />
                          )}
                        />
                      </div>

                      <div>
                        <Controller
                          name='buyerAddress.city'
                          control={control}
                          rules={{
                            required:
                              deliveryMethod === DeliveryMethod.SENT
                                ? 'City is required for shipped items'
                                : false,
                          }}
                          render={({ field }) => (
                            <Input
                              {...field}
                              label='City *'
                              placeholder='Copenhagen'
                              error={errors.buyerAddress?.city?.message}
                            />
                          )}
                        />
                      </div>
                    </div>

                    {/* Tracking Number */}
                    <div>
                      <Controller
                        name='trackingNumber'
                        control={control}
                        render={({ field }) => (
                          <Input
                            {...field}
                            label='Tracking Number'
                            placeholder='1234567890'
                            error={errors.trackingNumber?.message}
                          />
                        )}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Reusable Action Buttons */}
          <FormActionButtons
            onCancel={onCancel}
            isSubmitting={isProcessing}
            isEditing={false}
            submitButtonText='Mark as Sold'
            loadingSubmitText='Marking as Sold...'
            primaryButtonColorClass='amber'
            cancelDisabled={isProcessing}
          />
        </form>
      </div>
    </div>
  );
};

export default MarkSoldForm;
