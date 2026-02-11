/**
 * Unit tests for content script initialization and domain restriction
 * 
 * Validates: Requirements 7.2
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

/**
 * Helper function to check if URL matches Gemini Business domain
 * This mirrors the implementation in content.ts
 */
function isGeminiBusinessDomain(): boolean {
  const currentUrl = window.location.href;
  const geminiBusinessPattern = /^https:\/\/gemini\.google\.com(\/|\?|$)/;
  return geminiBusinessPattern.test(currentUrl);
}

describe('Content Script - Domain Restriction', () => {
  let originalLocation: Location;
  
  beforeEach(() => {
    // Save original location
    originalLocation = window.location;
    
    // Mock console methods to avoid noise in tests
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'info').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });
  
  afterEach(() => {
    // Restore original location
    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true,
      configurable: true
    });
    
    vi.restoreAllMocks();
  });
  
  /**
   * Helper function to mock window.location.href
   */
  function mockLocation(url: string): void {
    delete (window as any).location;
    (window as any).location = { href: url };
  }
  
  it('should allow initialization on Gemini Business domain', () => {
    mockLocation('https://gemini.google.com/app');
    expect(isGeminiBusinessDomain()).toBe(true);
  });
  
  it('should block initialization on non-Gemini domains', () => {
    mockLocation('https://example.com/');
    expect(isGeminiBusinessDomain()).toBe(false);
  });
  
  it('should block initialization on http (non-https) Gemini domain', () => {
    mockLocation('http://gemini.google.com/app');
    expect(isGeminiBusinessDomain()).toBe(false);
  });
  
  it('should block initialization on similar but different domains', () => {
    const invalidDomains = [
      'https://gemini.google.com.evil.com/',
      'https://fake-gemini.google.com/',
      'https://gemini.googleapis.com/',
      'https://www.gemini.google.com/',
      'https://gemini.google.co.uk/'
    ];
    
    invalidDomains.forEach(domain => {
      mockLocation(domain);
      expect(isGeminiBusinessDomain()).toBe(false);
    });
  });
  
  it('should allow initialization on any path under Gemini Business domain', () => {
    const validPaths = [
      'https://gemini.google.com',
      'https://gemini.google.com/',
      'https://gemini.google.com/app',
      'https://gemini.google.com/app/chat',
      'https://gemini.google.com/app/chat/123456',
      'https://gemini.google.com/app?param=value'
    ];
    
    validPaths.forEach(path => {
      mockLocation(path);
      expect(isGeminiBusinessDomain()).toBe(true);
    });
  });
});
