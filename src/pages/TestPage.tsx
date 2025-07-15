/**
 * Temporary Test Page for UI Components
 * This is for visual inspection and will be removed later
 * Following CLAUDE.md guidelines for component testing
 */

import React, { useState } from 'react';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Search, Eye, Mail } from 'lucide-react';

const TestPage: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const [selectValue, setSelectValue] = useState('');
  const [loading, setLoading] = useState(false);

  const selectOptions = [
    { value: 'psa', label: 'PSA Graded Cards' },
    { value: 'raw', label: 'Raw Cards' },
    { value: 'sealed', label: 'Sealed Products' },
    { value: 'sold', label: 'Sold Items', disabled: false },
  ];

  const handleLoadingTest = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 3000);
  };

  return (
    <div className='min-h-screen bg-gray-50 p-8'>
      <div className='max-w-4xl mx-auto space-y-12'>
        {/* Header */}
        <div className='text-center'>
          <h1 className='text-3xl font-bold text-gray-900 mb-2'>Component Test Page</h1>
          <p className='text-gray-600'>Visual inspection of common UI components</p>
        </div>

        {/* Button Tests */}
        <section className='bg-white p-6 rounded-lg shadow'>
          <h2 className='text-2xl font-semibold mb-4'>Button Components</h2>

          <div className='space-y-4'>
            <div>
              <h3 className='text-lg font-medium mb-3'>Variants</h3>
              <div className='flex flex-wrap gap-3'>
                <Button variant='primary'>Primary</Button>
                <Button variant='secondary'>Secondary</Button>
                <Button variant='danger'>Danger</Button>
                <Button variant='success'>Success</Button>
                <Button variant='outline'>Outline</Button>
              </div>
            </div>

            <div>
              <h3 className='text-lg font-medium mb-3'>Sizes</h3>
              <div className='flex flex-wrap items-center gap-3'>
                <Button size='sm'>Small</Button>
                <Button size='md'>Medium</Button>
                <Button size='lg'>Large</Button>
              </div>
            </div>

            <div>
              <h3 className='text-lg font-medium mb-3'>States</h3>
              <div className='flex flex-wrap gap-3'>
                <Button>Normal</Button>
                <Button disabled>Disabled</Button>
                <Button loading={loading} onClick={handleLoadingTest}>
                  {loading ? 'Loading...' : 'Test Loading'}
                </Button>
                <Button fullWidth>Full Width</Button>
              </div>
            </div>
          </div>
        </section>

        {/* Input Tests */}
        <section className='bg-white p-6 rounded-lg shadow'>
          <h2 className='text-2xl font-semibold mb-4'>Input Components</h2>

          <div className='space-y-4 max-w-md'>
            <Input
              label='Basic Input'
              placeholder='Enter some text'
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
            />

            <Input label='Input with Start Icon' placeholder='Search...' startIcon={<Search />} />

            <Input
              label='Input with End Icon'
              type='password'
              placeholder='Password'
              endIcon={<Eye />}
            />

            <Input
              label='Input with Both Icons'
              type='email'
              placeholder='Email address'
              startIcon={<Mail />}
              endIcon={<Eye />}
            />

            <Input
              label='Input with Error'
              placeholder='This has an error'
              error='This field is required'
            />

            <Input
              label='Input with Helper Text'
              placeholder='Helper text example'
              helperText='This is some helpful information'
            />

            <Input label='Full Width Input' placeholder='Full width' fullWidth />
          </div>
        </section>

        {/* Select Tests */}
        <section className='bg-white p-6 rounded-lg shadow'>
          <h2 className='text-2xl font-semibold mb-4'>Select Components</h2>

          <div className='space-y-4 max-w-md'>
            <Select
              label='Basic Select'
              options={selectOptions}
              value={selectValue}
              onChange={e => setSelectValue(e.target.value)}
              placeholder='Choose an option...'
            />

            <Select
              label='Select with Error'
              options={selectOptions}
              error='Please select a valid option'
            />

            <Select
              label='Select with Helper Text'
              options={selectOptions}
              helperText='Select your preferred item type'
            />

            <Select label='Full Width Select' options={selectOptions} fullWidth />
          </div>
        </section>

        {/* Loading Spinner Tests */}
        <section className='bg-white p-6 rounded-lg shadow'>
          <h2 className='text-2xl font-semibold mb-4'>Loading Spinner Components</h2>

          <div className='space-y-6'>
            <div>
              <h3 className='text-lg font-medium mb-3'>Sizes</h3>
              <div className='flex items-center gap-6'>
                <div className='text-center'>
                  <LoadingSpinner size='sm' />
                  <p className='mt-2 text-sm text-gray-600'>Small</p>
                </div>
                <div className='text-center'>
                  <LoadingSpinner size='md' />
                  <p className='mt-2 text-sm text-gray-600'>Medium</p>
                </div>
                <div className='text-center'>
                  <LoadingSpinner size='lg' />
                  <p className='mt-2 text-sm text-gray-600'>Large</p>
                </div>
                <div className='text-center'>
                  <LoadingSpinner size='xl' />
                  <p className='mt-2 text-sm text-gray-600'>Extra Large</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className='text-lg font-medium mb-3'>Colors</h3>
              <div className='flex items-center gap-6'>
                <LoadingSpinner color='blue' />
                <LoadingSpinner color='green' />
                <LoadingSpinner color='red' />
                <LoadingSpinner color='yellow' />
                <LoadingSpinner color='purple' />
              </div>
            </div>

            <div>
              <h3 className='text-lg font-medium mb-3'>With Text</h3>
              <div className='space-y-4'>
                <LoadingSpinner text='Loading data...' />
                <LoadingSpinner size='lg' color='green' text='Processing your request...' />
              </div>
            </div>
          </div>
        </section>

        {/* Current Values Display */}
        <section className='bg-white p-6 rounded-lg shadow'>
          <h2 className='text-2xl font-semibold mb-4'>Current Values</h2>
          <div className='space-y-2'>
            <p>
              <strong>Input Value:</strong> {inputValue || 'Empty'}
            </p>
            <p>
              <strong>Select Value:</strong> {selectValue || 'None selected'}
            </p>
            <p>
              <strong>Loading State:</strong> {loading ? 'True' : 'False'}
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default TestPage;
