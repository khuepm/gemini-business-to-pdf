/**
 * UIInjector - Manages UI elements injection and state
 * 
 * Responsibilities:
 * - Create and inject Export Button into Gemini Business page
 * - Manage UI state (loading, disabled, enabled)
 * - Display notifications to users
 */

import { Logger } from '../utils/logger';
import { getHeaderElement } from '../utils/shadow-dom-utils';

export class UIInjector {
  private button: HTMLButtonElement | null = null;

  constructor() {
    // Logger is a static class, no need to instantiate
  }

  /**
   * Inject export button into the Gemini Business page header
   * Creates button with icon, text, and tooltip
   * Places button next to Gemini Business logo
   * 
   * Requirements: 1.1, 1.3, 1.4
   */
  injectButton(): void {
    try {
      Logger.info('Injecting export button into page');

      // Create button element
      this.button = document.createElement('button');
      this.button.className = 'gemini-pdf-export-button';
      this.button.setAttribute('title', 'Xuất cuộc trò chuyện thành PDF');
      
      // Create icon element (using SVG for PDF icon)
      const icon = this.createIcon();
      
      // Create text element
      const text = document.createElement('span');
      text.textContent = 'Xuất PDF';
      
      // Append icon and text to button
      this.button.appendChild(icon);
      this.button.appendChild(text);
      
      // Try to get header element using Shadow DOM utility
      const headerElement = getHeaderElement();
      if (headerElement) {
        headerElement.appendChild(this.button);
        Logger.info('Button injected into header element');
      } else {
        Logger.warn('Header element not found, button not injected');
      }

      Logger.info('Export button successfully injected');
    } catch (error) {
      Logger.error('Failed to inject button', error);
      throw error;
    }
  }

  /**
   * Create SVG icon for the export button
   * @returns SVG element representing a PDF/download icon
   */
  private createIcon(): SVGSVGElement {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'icon');
    svg.setAttribute('width', '16');
    svg.setAttribute('height', '16');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '2');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');

    // Download icon path
    const path1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path1.setAttribute('d', 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4');
    
    const path2 = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
    path2.setAttribute('points', '7 10 12 15 17 10');
    
    const path3 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    path3.setAttribute('x1', '12');
    path3.setAttribute('y1', '15');
    path3.setAttribute('x2', '12');
    path3.setAttribute('y2', '3');

    svg.appendChild(path1);
    svg.appendChild(path2);
    svg.appendChild(path3);

    return svg;
  }

  /**
   * Show loading state on button
   * Displays spinner and disables button
   * 
   * Requirements: 6.1
   */
  showLoading(): void {
    if (!this.button) {
      Logger.warn('Cannot show loading: button not initialized');
      return;
    }

    Logger.info('Showing loading state');
    
    // Create spinner element
    const spinner = document.createElement('div');
    spinner.className = 'spinner';
    
    // Replace icon with spinner
    const icon = this.button.querySelector('.icon');
    if (icon) {
      icon.replaceWith(spinner);
    }
    
    // Update button text
    const text = this.button.querySelector('span');
    if (text) {
      text.textContent = 'Đang xuất...';
    }
    
    // Disable button
    this.disableButton();
  }

  /**
   * Hide loading state on button
   * Removes spinner and restores original icon
   * 
   * Requirements: 6.1
   */
  hideLoading(): void {
    if (!this.button) {
      Logger.warn('Cannot hide loading: button not initialized');
      return;
    }

    Logger.info('Hiding loading state');
    
    // Replace spinner with icon
    const spinner = this.button.querySelector('.spinner');
    if (spinner) {
      const icon = this.createIcon();
      spinner.replaceWith(icon);
    }
    
    // Restore button text
    const text = this.button.querySelector('span');
    if (text) {
      text.textContent = 'Xuất PDF';
    }
  }

  /**
   * Disable the export button
   * 
   * Requirements: 6.2
   */
  disableButton(): void {
    if (!this.button) {
      Logger.warn('Cannot disable: button not initialized');
      return;
    }

    this.button.disabled = true;
    Logger.info('Button disabled');
  }

  /**
   * Enable the export button
   * 
   * Requirements: 6.5
   */
  enableButton(): void {
    if (!this.button) {
      Logger.warn('Cannot enable: button not initialized');
      return;
    }

    this.button.disabled = false;
    Logger.info('Button enabled');
  }

  /**
   * Show notification to user
   * 
   * @param message - Message to display
   * @param type - Notification type (success or error)
   * 
   * Requirements: 5.7, 6.3, 6.4
   */
  showNotification(message: string, type: 'success' | 'error'): void {
    Logger.info(`Showing ${type} notification: ${message}`);

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `gemini-pdf-notification ${type}`;
    notification.textContent = message;
    
    // Append to body
    document.body.appendChild(notification);
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      notification.remove();
      Logger.info('Notification dismissed');
    }, 5000);
  }

  /**
   * Get the button element (for testing and event binding)
   * @returns The button element or null if not initialized
   */
  getButton(): HTMLButtonElement | null {
    return this.button;
  }
}
