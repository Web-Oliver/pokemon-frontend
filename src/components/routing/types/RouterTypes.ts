/**
 * Router Types
 * Layer 1: Core/Foundation - Type Definitions
 *
 * Type definitions for router components following SOLID principles
 * Interface Segregation: Specific interfaces for different router concerns
 *
 * Following CLAUDE.md principles:
 * - Single Responsibility: Type definitions only
 * - Interface Segregation: Separate interfaces for different concerns
 * - Dependency Inversion: Abstract interfaces for router components
 */

import { ComponentType } from 'react';

/**
 * Route Configuration Interface
 * Defines the structure for route definitions
 */
export interface RouteConfig {
  /** Route path pattern (supports :param syntax) */
  path: string;
  /** Component to render for this route */
  component: ComponentType<any>;
  /** Whether the path must match exactly */
  exact?: boolean;
  /** Optional parameter validation function */
  validateParams?: (params: RouteParams) => boolean;
  /** Optional parameter transformation handler */
  paramHandler?: (params: RouteParams) => Record<string, any>;
}

/**
 * Route Parameters Interface
 * Represents extracted parameters from route paths
 */
export interface RouteParams {
  [key: string]: string;
}

/**
 * Route Match Result Interface
 * Represents a successful route match
 */
export interface RouteMatch {
  /** Extracted parameters from the route */
  params: RouteParams;
  /** Whether this was an exact match */
  isExact: boolean;
}

/**
 * Route Handler Interface
 * Represents a matched route with its configuration and parameters
 */
export interface RouteHandler {
  /** The matched route configuration */
  route: RouteConfig;
  /** Extracted parameters from the matched route */
  params: RouteParams;
}
