/**
 * OCR Matching Page - SOLID/DRY Refactored Implementation
 * 
 * This component now uses proper SOLID principles and DRY methodology:
 * - Single Responsibility: Each component has one clear purpose
 * - Open/Closed: Components are extensible through props and composition
 * - Liskov Substitution: Components can be replaced with compatible implementations
 * - Interface Segregation: Hooks provide specific, focused interfaces
 * - Dependency Inversion: Components depend on abstractions, not concretions
 * - DRY: Eliminated code duplication through reusable components and utilities
 */

import React from 'react';
import { OcrMatchingRefactored } from '../components/OcrMatchingRefactored';

const OcrMatching: React.FC = () => {
  return <OcrMatchingRefactored />;
};

export default OcrMatching;