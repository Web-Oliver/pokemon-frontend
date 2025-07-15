/**
 * Unit Tests for MarkSoldForm Component
 * Following CLAUDE.md: Comprehensive testing without mocking for critical business logic
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MarkSoldForm } from './MarkSoldForm';
import { ISaleDetails } from '../../domain/models/common';
import { PaymentMethod, DeliveryMethod, Source } from '../../utils/constants';

describe('MarkSoldForm Component', () => {
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
    mockOnCancel.mockClear();
  });

  const defaultProps = {
    onSubmit: mockOnSubmit,
    onCancel: mockOnCancel
  };

  describe('Component Rendering', () => {
    it('renders the form with all required fields', () => {
      render(<MarkSoldForm {...defaultProps} />);

      // Check main heading
      expect(screen.getByText('Mark Item as Sold')).toBeInTheDocument();
      expect(screen.getByText('Enter the sale details for this item.')).toBeInTheDocument();

      // Check section headings
      expect(screen.getByText('Sale Information')).toBeInTheDocument();
      expect(screen.getByText('Delivery Information')).toBeInTheDocument();

      // Check required fields
      expect(screen.getByLabelText(/actual sold price/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/date sold/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/payment method/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/source/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/delivery method/i)).toBeInTheDocument();

      // Check action buttons
      expect(screen.getByRole('button', { name: /mark as sold/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    it('sets default date to today', () => {
      render(<MarkSoldForm {...defaultProps} />);
      
      const dateInput = screen.getByLabelText(/date sold/i) as HTMLInputElement;
      const today = new Date().toISOString().split('T')[0];
      expect(dateInput.value).toBe(today);
    });

    it('renders with initial data when provided', () => {
      const initialData: Partial<ISaleDetails> = {
        actualSoldPrice: 150,
        paymentMethod: PaymentMethod.CASH,
        deliveryMethod: DeliveryMethod.SENT, // Change to SENT so buyer fields are visible
        source: Source.FACEBOOK,
        buyerFullName: 'John Doe',
        buyerEmail: 'john@example.com'
      };

      render(<MarkSoldForm {...defaultProps} initialData={initialData} />);

      expect(screen.getByDisplayValue('150')).toBeInTheDocument();
      expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
      expect(screen.getByDisplayValue('john@example.com')).toBeInTheDocument();
    });
  });

  describe('Conditional Rendering', () => {
    it('does not show buyer information when delivery method is Local Meetup', async () => {
      const user = userEvent.setup();
      render(<MarkSoldForm {...defaultProps} />);

      // Select Local Meetup as delivery method
      const deliverySelect = screen.getByLabelText(/delivery method/i);
      await user.selectOptions(deliverySelect, DeliveryMethod.LOCAL_MEETUP);

      // Buyer information should not be visible
      expect(screen.queryByText('Buyer Information')).not.toBeInTheDocument();
      expect(screen.queryByLabelText(/buyer full name/i)).not.toBeInTheDocument();
    });

    it('shows buyer information when delivery method is Sent', async () => {
      const user = userEvent.setup();
      render(<MarkSoldForm {...defaultProps} />);

      // Select Sent as delivery method
      const deliverySelect = screen.getByLabelText(/delivery method/i);
      await user.selectOptions(deliverySelect, DeliveryMethod.SENT);

      // Wait for conditional fields to appear
      await waitFor(() => {
        expect(screen.getByText('Buyer Information')).toBeInTheDocument();
      });

      // Check all buyer fields are present
      expect(screen.getByLabelText(/buyer full name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByText('Shipping Address')).toBeInTheDocument();
      expect(screen.getByLabelText(/street address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/postal code/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/city/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/tracking number/i)).toBeInTheDocument();
    });

    it('toggles buyer information when delivery method changes', async () => {
      const user = userEvent.setup();
      render(<MarkSoldForm {...defaultProps} />);

      const deliverySelect = screen.getByLabelText(/delivery method/i);

      // Start with Sent method
      await user.selectOptions(deliverySelect, DeliveryMethod.SENT);
      await waitFor(() => {
        expect(screen.getByText('Buyer Information')).toBeInTheDocument();
      });

      // Switch to Local Meetup
      await user.selectOptions(deliverySelect, DeliveryMethod.LOCAL_MEETUP);
      await waitFor(() => {
        expect(screen.queryByText('Buyer Information')).not.toBeInTheDocument();
      });
    });
  });

  describe('Form Validation', () => {
    it('shows validation errors for required fields', async () => {
      const user = userEvent.setup();
      render(<MarkSoldForm {...defaultProps} />);

      // Clear the date field since it has a default value
      const dateInput = screen.getByLabelText(/date sold/i);
      await user.clear(dateInput);

      // Try to submit empty form
      const submitButton = screen.getByRole('button', { name: /mark as sold/i });
      await user.click(submitButton);

      // Check for validation error messages
      await waitFor(() => {
        expect(screen.getByText(/sale price is required/i)).toBeInTheDocument();
        expect(screen.getByText(/sale date is required/i)).toBeInTheDocument();
        expect(screen.getByText(/payment method is required/i)).toBeInTheDocument();
        expect(screen.getByText(/source is required/i)).toBeInTheDocument();
        expect(screen.getByText(/delivery method is required/i)).toBeInTheDocument();
      });

      // Form should not be submitted
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('validates price is greater than 0', async () => {
      const user = userEvent.setup();
      render(<MarkSoldForm {...defaultProps} />);

      const priceInput = screen.getByLabelText(/actual sold price/i);
      await user.clear(priceInput);
      await user.type(priceInput, '0.00');

      const submitButton = screen.getByRole('button', { name: /mark as sold/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/price must be greater than 0/i)).toBeInTheDocument();
      });
    });

    it('validates buyer information when delivery method is Sent', async () => {
      const user = userEvent.setup();
      render(<MarkSoldForm {...defaultProps} />);

      // Fill basic required fields
      await user.type(screen.getByLabelText(/actual sold price/i), '100');
      await user.selectOptions(screen.getByLabelText(/payment method/i), PaymentMethod.CASH);
      await user.selectOptions(screen.getByLabelText(/source/i), Source.FACEBOOK);
      await user.selectOptions(screen.getByLabelText(/delivery method/i), DeliveryMethod.SENT);

      // Wait for buyer fields to appear
      await waitFor(() => {
        expect(screen.getByLabelText(/buyer full name/i)).toBeInTheDocument();
      });

      // Try to submit without buyer information
      const submitButton = screen.getByRole('button', { name: /mark as sold/i });
      await user.click(submitButton);

      // Check for buyer validation errors
      await waitFor(() => {
        expect(screen.getByText(/buyer full name is required for shipped items/i)).toBeInTheDocument();
        expect(screen.getByText(/street address is required for shipped items/i)).toBeInTheDocument();
        expect(screen.getByText(/postal code is required for shipped items/i)).toBeInTheDocument();
        expect(screen.getByText(/city is required for shipped items/i)).toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    it('submits form with valid data for Local Meetup', async () => {
      const user = userEvent.setup();
      render(<MarkSoldForm {...defaultProps} />);

      // Fill all required fields for Local Meetup
      await user.type(screen.getByLabelText(/actual sold price/i), '150.50');
      await user.selectOptions(screen.getByLabelText(/payment method/i), PaymentMethod.CASH);
      await user.selectOptions(screen.getByLabelText(/source/i), Source.FACEBOOK);
      await user.selectOptions(screen.getByLabelText(/delivery method/i), DeliveryMethod.LOCAL_MEETUP);

      // Submit form
      const submitButton = screen.getByRole('button', { name: /mark as sold/i });
      await user.click(submitButton);

      // Verify onSubmit was called with correct data
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledTimes(1);
      });

      const submittedData = mockOnSubmit.mock.calls[0][0] as ISaleDetails;
      expect(submittedData.actualSoldPrice).toBe(150.5);
      expect(submittedData.paymentMethod).toBe(PaymentMethod.CASH);
      expect(submittedData.deliveryMethod).toBe(DeliveryMethod.LOCAL_MEETUP);
      expect(submittedData.source).toBe(Source.FACEBOOK);
      expect(submittedData.dateSold).toBeDefined();
    });

    it('submits form with valid data for Sent delivery', async () => {
      const user = userEvent.setup();
      render(<MarkSoldForm {...defaultProps} />);

      // Fill basic required fields
      await user.type(screen.getByLabelText(/actual sold price/i), '200');
      await user.selectOptions(screen.getByLabelText(/payment method/i), PaymentMethod.MOBILEPAY);
      await user.selectOptions(screen.getByLabelText(/source/i), Source.DBA);
      await user.selectOptions(screen.getByLabelText(/delivery method/i), DeliveryMethod.SENT);

      // Wait for buyer fields to appear and fill them
      await waitFor(() => {
        expect(screen.getByLabelText(/buyer full name/i)).toBeInTheDocument();
      });

      await user.type(screen.getByLabelText(/buyer full name/i), 'Jane Smith');
      await user.type(screen.getByLabelText(/phone number/i), '+45 12 34 56 78');
      await user.type(screen.getByLabelText(/email/i), 'jane@example.com');
      await user.type(screen.getByLabelText(/street address/i), '123 Main St');
      await user.type(screen.getByLabelText(/postal code/i), '12345');
      await user.type(screen.getByLabelText(/city/i), 'Copenhagen');
      await user.type(screen.getByLabelText(/tracking number/i), 'TRACK123');

      // Submit form
      const submitButton = screen.getByRole('button', { name: /mark as sold/i });
      await user.click(submitButton);

      // Verify onSubmit was called with correct data
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledTimes(1);
      });

      const submittedData = mockOnSubmit.mock.calls[0][0] as ISaleDetails;
      expect(submittedData.actualSoldPrice).toBe(200);
      expect(submittedData.paymentMethod).toBe(PaymentMethod.MOBILEPAY);
      expect(submittedData.deliveryMethod).toBe(DeliveryMethod.SENT);
      expect(submittedData.source).toBe(Source.DBA);
      expect(submittedData.buyerFullName).toBe('Jane Smith');
      expect(submittedData.buyerPhoneNumber).toBe('+45 12 34 56 78');
      expect(submittedData.buyerEmail).toBe('jane@example.com');
      expect(submittedData.buyerAddress?.streetName).toBe('123 Main St');
      expect(submittedData.buyerAddress?.postnr).toBe('12345');
      expect(submittedData.buyerAddress?.city).toBe('Copenhagen');
      expect(submittedData.trackingNumber).toBe('TRACK123');
    });

    it('converts date to ISO string format', async () => {
      const user = userEvent.setup();
      render(<MarkSoldForm {...defaultProps} />);

      // Fill required fields
      await user.type(screen.getByLabelText(/actual sold price/i), '100');
      await user.selectOptions(screen.getByLabelText(/payment method/i), PaymentMethod.CASH);
      await user.selectOptions(screen.getByLabelText(/source/i), Source.FACEBOOK);
      await user.selectOptions(screen.getByLabelText(/delivery method/i), DeliveryMethod.LOCAL_MEETUP);

      // Set a specific date
      const dateInput = screen.getByLabelText(/date sold/i);
      await user.clear(dateInput);
      await user.type(dateInput, '2023-12-25');

      // Submit form
      const submitButton = screen.getByRole('button', { name: /mark as sold/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledTimes(1);
      });

      const submittedData = mockOnSubmit.mock.calls[0][0] as ISaleDetails;
      expect(submittedData.dateSold).toMatch(/2023-12-25T.*Z/); // ISO string format
    });
  });

  describe('User Interactions', () => {
    it('calls onCancel when cancel button is clicked', async () => {
      const user = userEvent.setup();
      render(<MarkSoldForm {...defaultProps} />);

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    it('disables form when loading', () => {
      render(<MarkSoldForm {...defaultProps} isLoading={true} />);

      const submitButton = screen.getByRole('button', { name: /marking as sold/i });
      const cancelButton = screen.getByRole('button', { name: /cancel/i });

      expect(submitButton).toBeDisabled();
      expect(cancelButton).toBeDisabled();
      expect(screen.getByText('Marking as Sold...')).toBeInTheDocument();
    });
  });

  describe('Dropdown Options', () => {
    it('provides correct payment method options', () => {
      render(<MarkSoldForm {...defaultProps} />);

      const paymentSelect = screen.getByLabelText(/payment method/i);
      
      // Check that all payment methods are available
      expect(paymentSelect).toHaveTextContent('CASH');
      expect(paymentSelect).toHaveTextContent('MobilePay');
      expect(paymentSelect).toHaveTextContent('Bank Transfer');
    });

    it('provides correct delivery method options', () => {
      render(<MarkSoldForm {...defaultProps} />);

      const deliverySelect = screen.getByLabelText(/delivery method/i);
      
      // Check that all delivery methods are available
      expect(deliverySelect).toHaveTextContent('Sent');
      expect(deliverySelect).toHaveTextContent('Local Meetup');
    });

    it('provides correct source options', () => {
      render(<MarkSoldForm {...defaultProps} />);

      const sourceSelect = screen.getByLabelText(/source/i);
      
      // Check that all sources are available
      expect(sourceSelect).toHaveTextContent('Facebook');
      expect(sourceSelect).toHaveTextContent('DBA');
    });
  });
});