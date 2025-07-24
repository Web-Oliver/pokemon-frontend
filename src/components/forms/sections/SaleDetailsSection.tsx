/**
 * Sale Details Section Component
 * Shared component for editing sale information on sold items
 * Following CLAUDE.md principles for component separation and reusability
 */

import React from 'react';
import { UseFormRegister, FieldErrors, UseFormWatch } from 'react-hook-form';
import { Banknote } from 'lucide-react';
import Input from '../../common/Input';
import Select from '../../common/Select';

interface SaleDetailsSectionProps {
  register: UseFormRegister<Record<string, unknown>>;
  errors: FieldErrors<Record<string, unknown>>;
  watch: UseFormWatch<Record<string, unknown>>;
  // Show section only for sold items in edit mode
  isVisible?: boolean;
  itemName?: string;
}

const SaleDetailsSection: React.FC<SaleDetailsSectionProps> = ({
  register,
  errors: _errors,
  watch,
  isVisible = true,
  itemName = 'item',
}) => {
  const watchedDeliveryMethod = watch('deliveryMethod');

  if (!isVisible) {
    return null;
  }

  return (
    <div className='bg-yellow-50/80 backdrop-blur-xl border border-yellow-200/50 rounded-3xl p-8 shadow-2xl relative overflow-hidden'>
      <div className='absolute inset-0 bg-gradient-to-br from-yellow-50/50 to-orange-50/50'></div>

      <h4 className='text-xl font-bold text-yellow-900 mb-8 flex items-center justify-center relative z-10'>
        <Banknote className='w-6 h-6 mr-3 text-yellow-600' />
        Update Sale Information (kr.)
      </h4>

      <div className='relative z-10 space-y-8'>
        {/* Sale Details */}
        <div>
          <h5 className='text-lg font-semibold text-yellow-800 mb-4'>Sale Details</h5>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            <div>
              <Select
                label='Payment Method'
                {...register('paymentMethod')}
                options={[
                  { value: '', label: 'Select payment method' },
                  { value: 'CASH', label: 'Cash' },
                  { value: 'Mobilepay', label: 'Mobilepay' },
                  { value: 'BankTransfer', label: 'Bank Transfer' },
                ]}
                className='bg-white'
              />
            </div>

            <div>
              <Input
                label='Actual Sold Price (kr.)'
                type='text'
                inputMode='numeric'
                {...register('actualSoldPrice', {
                  pattern: {
                    value: /^\d+$/,
                    message: 'Price must be a whole number only',
                  },
                  validate: (value) => {
                    const num = parseInt(value as string, 10);
                    if (isNaN(num) || num < 0) {
                      return 'Price must be a positive whole number';
                    }
                    return true;
                  },
                })}
                placeholder='0'
                className='bg-white'
              />
            </div>

            <div>
              <Select
                label='Source'
                {...register('source')}
                options={[
                  { value: '', label: 'Select source' },
                  { value: 'Facebook', label: 'Facebook' },
                  { value: 'DBA', label: 'DBA' },
                ]}
                className='bg-white'
              />
            </div>
          </div>
        </div>

        {/* Delivery Method */}
        <div>
          <h5 className='text-lg font-semibold text-yellow-800 mb-4'>Delivery Method</h5>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div>
              <Select
                label='Delivery Method'
                {...register('deliveryMethod')}
                options={[
                  { value: '', label: 'Select delivery method' },
                  { value: 'Sent', label: 'Sent (Shipping)' },
                  { value: 'Local Meetup', label: 'Local Meetup' },
                ]}
                className='bg-white'
              />
            </div>

            <div>
              <Input label='Date Sold' type='date' {...register('dateSold')} className='bg-white' />
            </div>
          </div>
        </div>

        {/* Buyer Information */}
        <div>
          <h5 className='text-lg font-semibold text-yellow-800 mb-4'>Buyer Information</h5>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div>
              <Input
                label='Buyer Full Name'
                type='text'
                {...register('buyerFullName')}
                placeholder='Enter buyer name'
                className='bg-white'
              />
            </div>

            <div>
              <Input
                label='Buyer Phone'
                type='text'
                {...register('buyerPhoneNumber')}
                placeholder='Enter buyer phone'
                className='bg-white'
              />
            </div>

            <div className='md:col-span-2'>
              <Input
                label='Buyer Email'
                type='email'
                {...register('buyerEmail')}
                placeholder='Enter buyer email'
                className='bg-white'
              />
            </div>
          </div>
        </div>

        {/* Conditional Address/Tracking Section */}
        {watchedDeliveryMethod === 'Sent' && (
          <div>
            <h5 className='text-lg font-semibold text-yellow-800 mb-4'>Shipping Information</h5>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div className='md:col-span-2'>
                <Input
                  label='Street Address'
                  type='text'
                  {...register('streetName')}
                  placeholder='Enter street address'
                  className='bg-white'
                />
              </div>

              <div>
                <Input
                  label='Postal Code'
                  type='text'
                  {...register('postnr')}
                  placeholder='Enter postal code'
                  className='bg-white'
                />
              </div>

              <div>
                <Input
                  label='City'
                  type='text'
                  {...register('city')}
                  placeholder='Enter city'
                  className='bg-white'
                />
              </div>

              <div className='md:col-span-2'>
                <Input
                  label='Tracking Number'
                  type='text'
                  {...register('trackingNumber')}
                  placeholder='Enter tracking number'
                  className='bg-white'
                />
              </div>
            </div>
          </div>
        )}

        {watchedDeliveryMethod === 'Local Meetup' && (
          <div>
            <h5 className='text-lg font-semibold text-yellow-800 mb-4'>Local Meetup Information</h5>
            <div className='p-4 bg-blue-50/80 border border-blue-200/50 rounded-xl backdrop-blur-sm'>
              <p className='text-sm text-blue-800'>
                <strong>Local Meetup:</strong> No shipping address or tracking required for local
                meetup deliveries.
              </p>
            </div>
          </div>
        )}

        <div className='p-4 bg-yellow-100/80 rounded-xl border border-yellow-300/50 backdrop-blur-sm'>
          <p className='text-sm text-yellow-800'>
            <strong>Note:</strong> This {itemName} is sold. You can only update sale information,
            buyer details, and delivery information.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SaleDetailsSection;
