/**
 * FormValidationService
 * Layer 2: Services/Hooks/Store (Business Logic & Data Orchestration)
 * 
 * Following CLAUDE.md SOLID principles:
 * - Single Responsibility: Centralized form validation logic only
 * - DRY: Eliminates validation duplication across multiple forms
 * - Interface Segregation: Focused validation methods for specific field types
 * - Open/Closed: Extensible validation rules without modification
 * - NOT over-engineered: Simple, focused validation service
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Centralized Form Validation Service
 * Extracts common validation logic from multiple forms
 * Provides static methods for type-safe field validation
 */
export class FormValidationService {
  // Email validation
  static validateEmail(email: string): ValidationResult {
    if (!email) {
      return { isValid: true }; // Allow empty for optional fields
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(email.trim());
    
    return {
      isValid,
      error: isValid ? undefined : 'Please enter a valid email address',
    };
  }
  
  // Phone validation
  static validatePhone(phone: string): ValidationResult {
    if (!phone) {
      return { isValid: true }; // Allow empty for optional fields
    }
    
    const phoneRegex = /^[\+]?[\s\-\(\)]?[\d\s\-\(\)]{10,}$/;
    const isValid = phoneRegex.test(phone.trim());
    
    return {
      isValid,
      error: isValid ? undefined : 'Please enter a valid phone number',
    };
  }
  
  // Price validation
  static validatePrice(price: string, required: boolean = false): ValidationResult {
    if (!price || price.trim() === '') {
      if (required) {
        return { isValid: false, error: 'Price is required' };
      }
      return { isValid: true };
    }
    
    const num = parseFloat(price);
    
    if (isNaN(num)) {
      return { isValid: false, error: 'Price must be a valid number' };
    }
    
    if (num < 0) {
      return { isValid: false, error: 'Price must be non-negative' };
    }
    
    return { isValid: true };
  }
  
  // Grade validation (1-10)
  static validateGrade(grade: string, required: boolean = false): ValidationResult {
    if (!grade || grade.trim() === '') {
      if (required) {
        return { isValid: false, error: 'Grade is required' };
      }
      return { isValid: true };
    }
    
    const gradeRegex = /^(1|2|3|4|5|6|7|8|9|10)$/;
    const isValid = gradeRegex.test(grade.trim());
    
    if (!isValid) {
      return { isValid: false, error: 'Grade must be between 1 and 10' };
    }
    
    return { isValid: true };
  }
  
  // Date validation
  static validateDate(date: string, required: boolean = false): ValidationResult {
    if (!date || date.trim() === '') {
      if (required) {
        return { isValid: false, error: 'Date is required' };
      }
      return { isValid: true };
    }
    
    const dateObj = new Date(date);
    const isValid = !isNaN(dateObj.getTime());
    
    return {
      isValid,
      error: isValid ? undefined : 'Please enter a valid date',
    };
  }
  
  // Postal code validation
  static validatePostalCode(postalCode: string): ValidationResult {
    if (!postalCode) {
      return { isValid: true }; // Allow empty for optional fields
    }
    
    const postalCodeRegex = /^\d{4,5}$/;
    const isValid = postalCodeRegex.test(postalCode.trim());
    
    return {
      isValid,
      error: isValid ? undefined : 'Postal code must be 4-5 digits',
    };
  }
  
  // Required field validation
  static validateRequired(value: string, fieldName: string): ValidationResult {
    const isValid = value && value.trim() !== '';
    
    return {
      isValid,
      error: isValid ? undefined : `${fieldName} is required`,
    };
  }
  
  // Availability validation (non-negative integer)
  static validateAvailability(availability: string | number, required: boolean = false): ValidationResult {
    if (availability === '' || availability === null || availability === undefined) {
      if (required) {
        return { isValid: false, error: 'Availability is required' };
      }
      return { isValid: true };
    }
    
    const num = typeof availability === 'string' ? parseInt(availability) : availability;
    
    if (isNaN(num)) {
      return { isValid: false, error: 'Availability must be a valid number' };
    }
    
    if (num < 0) {
      return { isValid: false, error: 'Availability must be non-negative' };
    }
    
    return { isValid: true };
  }
  
  // Card number validation
  static validateCardNumber(cardNumber: string): ValidationResult {
    if (!cardNumber) {
      return { isValid: true }; // Allow empty for optional fields
    }
    
    // Allow alphanumeric characters and common separators
    const cardNumberRegex = /^[a-zA-Z0-9\-\/\s]+$/;
    const isValid = cardNumberRegex.test(cardNumber.trim());
    
    return {
      isValid,
      error: isValid ? undefined : 'Card number contains invalid characters',
    };
  }
  
  // Category validation (from predefined list)
  static validateCategory(category: string, validCategories: string[], required: boolean = false): ValidationResult {
    if (!category || category.trim() === '') {
      if (required) {
        return { isValid: false, error: 'Category is required' };
      }
      return { isValid: true };
    }
    
    const isValid = validCategories.includes(category);
    
    return {
      isValid,
      error: isValid ? undefined : 'Please select a valid category',
    };
  }
  
  // Condition validation (for raw cards)
  static validateCondition(condition: string, required: boolean = false): ValidationResult {
    if (!condition || condition.trim() === '') {
      if (required) {
        return { isValid: false, error: 'Condition is required' };
      }
      return { isValid: true };
    }
    
    const validConditions = ['Mint', 'Near Mint', 'Excellent', 'Good', 'Light Played', 'Played', 'Poor'];
    const isValid = validConditions.includes(condition);
    
    return {
      isValid,
      error: isValid ? undefined : 'Please select a valid condition',
    };
  }
  
  // Bulk validation for form data
  static validateFormData(
    formData: Record<string, any>,
    validationConfig: Record<string, { type: string; required?: boolean; options?: any }>
  ): { isValid: boolean; errors: Record<string, string> } {
    const errors: Record<string, string> = {};
    let isValid = true;
    
    Object.entries(validationConfig).forEach(([fieldName, config]) => {
      const value = formData[fieldName];
      let result: ValidationResult;
      
      switch (config.type) {
        case 'email':
          result = this.validateEmail(value);
          break;
        case 'phone':
          result = this.validatePhone(value);
          break;
        case 'price':
          result = this.validatePrice(value, config.required);
          break;
        case 'grade':
          result = this.validateGrade(value, config.required);
          break;
        case 'date':
          result = this.validateDate(value, config.required);
          break;
        case 'postalCode':
          result = this.validatePostalCode(value);
          break;
        case 'availability':
          result = this.validateAvailability(value, config.required);
          break;
        case 'cardNumber':
          result = this.validateCardNumber(value);
          break;
        case 'category':
          result = this.validateCategory(value, config.options?.validCategories || [], config.required);
          break;
        case 'condition':
          result = this.validateCondition(value, config.required);
          break;
        case 'required':
          result = this.validateRequired(value, fieldName);
          break;
        default:
          // For unknown types, just check if required
          if (config.required) {
            result = this.validateRequired(value, fieldName);
          } else {
            result = { isValid: true };
          }
      }
      
      if (!result.isValid && result.error) {
        errors[fieldName] = result.error;
        isValid = false;
      }
    });
    
    return { isValid, errors };
  }
}

// Export commonly used validation configurations
export const VALIDATION_CONFIGS = {
  // PSA Card Form
  PSA_CARD: {
    setName: { type: 'required', required: true },
    cardName: { type: 'required', required: true },
    cardNumber: { type: 'cardNumber', required: false },
    grade: { type: 'grade', required: true },
    myPrice: { type: 'price', required: true },
    dateAdded: { type: 'date', required: true },
    buyerEmail: { type: 'email', required: false },
    buyerPhoneNumber: { type: 'phone', required: false },
    postnr: { type: 'postalCode', required: false },
  },
  
  // Raw Card Form
  RAW_CARD: {
    setName: { type: 'required', required: true },
    cardName: { type: 'required', required: true },
    cardNumber: { type: 'cardNumber', required: false },
    condition: { type: 'condition', required: true },
    myPrice: { type: 'price', required: true },
    dateAdded: { type: 'date', required: true },
  },
  
  // Sealed Product Form
  SEALED_PRODUCT: {
    setName: { type: 'required', required: true },
    productName: { type: 'required', required: true },
    category: { 
      type: 'category', 
      required: true,
      options: {
        validCategories: ['Booster-Boxes', 'Elite-Trainer-Boxes', 'Box-Sets', 'Boosters']
      }
    },
    availability: { type: 'availability', required: true },
    cardMarketPrice: { type: 'price', required: false },
    myPrice: { type: 'price', required: true },
    dateAdded: { type: 'date', required: true },
  },
} as const;

export default FormValidationService;