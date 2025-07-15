/**
 * MarkSoldForm Component
 * Form for marking collection items as sold with comprehensive sale details
 * Following CLAUDE.md: DRY, SRP, and reusable design principles
 */

import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { ISaleDetails, IBuyerAddress } from '../../domain/models/common';
import { PaymentMethod, DeliveryMethod, Source } from '../../utils/constants';
import Button from '../common/Button';
import Input from '../common/Input';
import Select from '../common/Select';

interface MarkSoldFormProps {
  onSubmit: (saleDetails: ISaleDetails) => void;
  onCancel: () => void;
  initialData?: Partial<ISaleDetails>;
  isLoading?: boolean;
}

interface FormData extends ISaleDetails {
  buyerAddress: IBuyerAddress;
}

export const MarkSoldForm: React.FC<MarkSoldFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
  isLoading = false
}) => {
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
    setValue
  } = useForm<FormData>({
    defaultValues: {
      paymentMethod: initialData?.paymentMethod || undefined,
      actualSoldPrice: initialData?.actualSoldPrice || undefined,
      deliveryMethod: initialData?.deliveryMethod || undefined,
      source: initialData?.source || undefined,
      dateSold: initialData?.dateSold || new Date().toISOString().split('T')[0], // Default to today
      buyerFullName: initialData?.buyerFullName || '',
      buyerAddress: {
        streetName: initialData?.buyerAddress?.streetName || '',
        postnr: initialData?.buyerAddress?.postnr || '',
        city: initialData?.buyerAddress?.city || ''
      },
      buyerPhoneNumber: initialData?.buyerPhoneNumber || '',
      buyerEmail: initialData?.buyerEmail || '',
      trackingNumber: initialData?.trackingNumber || ''
    }
  });

  // Watch deliveryMethod to conditionally show buyer info
  const deliveryMethod = watch('deliveryMethod');
  const showBuyerInfo = deliveryMethod === DeliveryMethod.SENT;

  const onFormSubmit = (data: FormData) => {
    // Convert date to ISO string if it's not already
    const formattedData: ISaleDetails = {
      ...data,
      dateSold: data.dateSold ? new Date(data.dateSold).toISOString() : undefined
    };

    // Remove empty buyer address if not needed
    if (!showBuyerInfo || !data.buyerAddress?.streetName && !data.buyerAddress?.postnr && !data.buyerAddress?.city) {
      delete formattedData.buyerAddress;
    }

    onSubmit(formattedData);
  };

  // Payment method options
  const paymentMethodOptions = Object.values(PaymentMethod).map(method => ({
    value: method,
    label: method === PaymentMethod.MOBILEPAY ? 'MobilePay' : 
           method === PaymentMethod.BANK_TRANSFER ? 'Bank Transfer' : method
  }));

  // Delivery method options
  const deliveryMethodOptions = Object.values(DeliveryMethod).map(method => ({
    value: method,
    label: method
  }));

  // Source options
  const sourceOptions = Object.values(Source).map(source => ({
    value: source,
    label: source
  }));

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Mark Item as Sold</h2>
        <p className="text-gray-600">Enter the sale details for this item.</p>
      </div>

      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
        {/* Sale Information Section */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
            Sale Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Actual Sold Price */}
            <div>
              <Controller
                name="actualSoldPrice"
                control={control}
                rules={{ 
                  required: 'Sale price is required',
                  min: { value: 0.01, message: 'Price must be greater than 0' }
                }}
                render={({ field }) => (
                  <Input
                    {...field}
                    label="Actual Sold Price *"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    error={errors.actualSoldPrice?.message}
                    value={field.value || ''}
                    onChange={(e) => {
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
                name="dateSold"
                control={control}
                rules={{ required: 'Sale date is required' }}
                render={({ field }) => (
                  <Input
                    {...field}
                    label="Date Sold *"
                    type="date"
                    error={errors.dateSold?.message}
                    value={field.value ? field.value.split('T')[0] : ''}
                  />
                )}
              />
            </div>

            {/* Payment Method */}
            <div>
              <Controller
                name="paymentMethod"
                control={control}
                rules={{ required: 'Payment method is required' }}
                render={({ field }) => (
                  <Select
                    {...field}
                    label="Payment Method *"
                    options={paymentMethodOptions}
                    error={errors.paymentMethod?.message}
                    placeholder="Select payment method"
                  />
                )}
              />
            </div>

            {/* Source */}
            <div>
              <Controller
                name="source"
                control={control}
                rules={{ required: 'Source is required' }}
                render={({ field }) => (
                  <Select
                    {...field}
                    label="Source *"
                    options={sourceOptions}
                    error={errors.source?.message}
                    placeholder="Select sale source"
                  />
                )}
              />
            </div>
          </div>
        </div>

        {/* Delivery Information Section */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            Delivery Information
          </h3>

          <div className="mb-4">
            <Controller
              name="deliveryMethod"
              control={control}
              rules={{ required: 'Delivery method is required' }}
              render={({ field }) => (
                <Select
                  {...field}
                  label="Delivery Method *"
                  options={deliveryMethodOptions}
                  error={errors.deliveryMethod?.message}
                  placeholder="Select delivery method"
                />
              )}
            />
          </div>

          {/* Conditional Buyer Information - only show if delivery method is 'Sent' */}
          {showBuyerInfo && (
            <div className="space-y-4 border-t pt-4">
              <h4 className="font-medium text-gray-900">Buyer Information</h4>
              
              {/* Buyer Full Name */}
              <div>
                <Controller
                  name="buyerFullName"
                  control={control}
                  rules={{ 
                    required: deliveryMethod === DeliveryMethod.SENT ? 'Buyer full name is required for shipped items' : false 
                  }}
                  render={({ field }) => (
                    <Input
                      {...field}
                      label="Buyer Full Name *"
                      placeholder="John Doe"
                      error={errors.buyerFullName?.message}
                    />
                  )}
                />
              </div>

              {/* Buyer Contact */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Controller
                    name="buyerPhoneNumber"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        label="Phone Number"
                        type="tel"
                        placeholder="+45 12 34 56 78"
                        error={errors.buyerPhoneNumber?.message}
                      />
                    )}
                  />
                </div>

                <div>
                  <Controller
                    name="buyerEmail"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        label="Email"
                        type="email"
                        placeholder="buyer@example.com"
                        error={errors.buyerEmail?.message}
                      />
                    )}
                  />
                </div>
              </div>

              {/* Buyer Address */}
              <div className="space-y-4">
                <h5 className="font-medium text-gray-700">Shipping Address</h5>
                
                <div>
                  <Controller
                    name="buyerAddress.streetName"
                    control={control}
                    rules={{
                      required: deliveryMethod === DeliveryMethod.SENT ? 'Street address is required for shipped items' : false
                    }}
                    render={({ field }) => (
                      <Input
                        {...field}
                        label="Street Address *"
                        placeholder="123 Main Street"
                        error={errors.buyerAddress?.streetName?.message}
                      />
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Controller
                      name="buyerAddress.postnr"
                      control={control}
                      rules={{
                        required: deliveryMethod === DeliveryMethod.SENT ? 'Postal code is required for shipped items' : false
                      }}
                      render={({ field }) => (
                        <Input
                          {...field}
                          label="Postal Code *"
                          placeholder="12345"
                          error={errors.buyerAddress?.postnr?.message}
                        />
                      )}
                    />
                  </div>

                  <div>
                    <Controller
                      name="buyerAddress.city"
                      control={control}
                      rules={{
                        required: deliveryMethod === DeliveryMethod.SENT ? 'City is required for shipped items' : false
                      }}
                      render={({ field }) => (
                        <Input
                          {...field}
                          label="City *"
                          placeholder="Copenhagen"
                          error={errors.buyerAddress?.city?.message}
                        />
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* Tracking Number */}
              <div>
                <Controller
                  name="trackingNumber"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      label="Tracking Number"
                      placeholder="1234567890"
                      error={errors.trackingNumber?.message}
                    />
                  )}
                />
              </div>
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
          <Button
            type="submit"
            variant="primary"
            disabled={isLoading}
            className="sm:flex-1"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Marking as Sold...
              </>
            ) : (
              'Mark as Sold'
            )}
          </Button>
          
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={isLoading}
            className="sm:flex-1"
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default MarkSoldForm;