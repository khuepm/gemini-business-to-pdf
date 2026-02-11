/**
 * MarkdownGenerator - Handles Markdown generation from chat content
 * 
 * This module is responsible for:
 * - Converting chat content to Markdown format
 * - Preserving formatting (code blocks, tables, lists)
 * - Triggering Markdown file downloads
 */

import { ChatContent } from './content-extractor';
import { Logger } from '../utils/logger';

/**
 * MarkdownGenerator class
 * Converts chat content to Markdown format
 */
export class MarkdownGenerator {
  /**
   * Generate Markdown from chat content
   * 
   * @param content - ChatContent object containing messages
   * @param title - Chat title for the header
   * @returns Markdown string
   */
  generateMarkdown(content: ChatContent, title: string): string {
    Logger.info('Generating Markdown');
    
    const exportDate = new Date().toLocaleString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    // Build markdown header
    let markdown = `# ${title}\n\n`;
    markdown += `**Xuất ngày:** ${exportDate}\n\n`;
    markdown += `**Tổng số tin nhắn:** ${content.messages.length}\n\n`;
    markdown += `---\n\n`;

    // Build messages
    content.messages.forEach((message) => {
      const sender = message.sender === 'user' ? '👤 Bạn' : '🤖 Gemini';
      
      markdown += `## ${sender}\n\n`;
      
      // Convert HTML to Markdown-friendly format
      let messageContent = this.htmlToMarkdown(message.content);
      
      markdown += messageContent + '\n\n';
      markdown += `---\n\n`;
    });

    Logger.info(`Markdown generated: ${markdown.length} characters`);
    return markdown;
  }

  /**
   * Convert HTML content to Markdown format
   * 
   * @param html - HTML string
   * @returns Markdown string
   */
  private htmlToMarkdown(html: string): string {
    let markdown = html;

    // Remove data-markdown-start-index attributes
    markdown = markdown.replace(/data-markdown-start-index="\d+"/g, '');
    
    // Convert code blocks
    markdown = markdown.replace(/<pre><code[^>]*>([\s\S]*?)<\/code><\/pre>/g, (_match, code) => {
      const decodedCode = this.decodeHtml(code);
      return '\n```\n' + decodedCode + '\n```\n';
    });
    
    // Convert inline code
    markdown = markdown.replace(/<code[^>]*>(.*?)<\/code>/g, '`$1`');
    
    // Convert headers
    markdown = markdown.replace(/<h1[^>]*>(.*?)<\/h1>/g, '# $1\n');
    markdown = markdown.replace(/<h2[^>]*>(.*?)<\/h2>/g, '## $1\n');
    markdown = markdown.replace(/<h3[^>]*>(.*?)<\/h3>/g, '### $1\n');
    markdown = markdown.replace(/<h4[^>]*>(.*?)<\/h4>/g, '#### $1\n');
    
    // Convert bold and italic
    markdown = markdown.replace(/<strong[^>]*>(.*?)<\/strong>/g, '**$1**');
    markdown = markdown.replace(/<b[^>]*>(.*?)<\/b>/g, '**$1**');
    markdown = markdown.replace(/<em[^>]*>(.*?)<\/em>/g, '*$1*');
    markdown = markdown.replace(/<i[^>]*>(.*?)<\/i>/g, '*$1*');
    
    // Convert lists
    markdown = markdown.replace(/<ul[^>]*>([\s\S]*?)<\/ul>/g, (_match, content) => {
      return this.convertList(content, '-');
    });
    markdown = markdown.replace(/<ol[^>]*>([\s\S]*?)<\/ol>/g, (_match, content) => {
      return this.convertList(content, '1.');
    });
    
    // Convert paragraphs
    markdown = markdown.replace(/<p[^>]*>(.*?)<\/p>/g, '$1\n\n');
    
    // Convert line breaks
    markdown = markdown.replace(/<br\s*\/?>/g, '\n');
    
    // Remove remaining HTML tags
    markdown = markdown.replace(/<[^>]+>/g, '');
    
    // Decode HTML entities
    markdown = this.decodeHtml(markdown);
    
    // Clean up extra whitespace
    markdown = markdown.replace(/\n{3,}/g, '\n\n');
    markdown = markdown.trim();
    
    return markdown;
  }

  /**
   * Convert HTML list to Markdown
   */
  private convertList(content: string, marker: string): string {
    const items = content.match(/<li[^>]*>(.*?)<\/li>/g) || [];
    let markdown = '\n';
    
    items.forEach((item, index) => {
      const text = item.replace(/<li[^>]*>(.*?)<\/li>/, '$1').trim();
      const cleanText = text.replace(/<[^>]+>/g, '');
      const itemMarker = marker === '1.' ? `${index + 1}.` : marker;
      markdown += `${itemMarker} ${cleanText}\n`;
    });
    
    return markdown + '\n';
  }

  /**
   * Decode HTML entities
   */
  private decodeHtml(html: string): string {
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
  }

  /**
   * Download Markdown file
   * 
   * @param markdown - Markdown content
   * @param filename - Filename (should include .md extension)
   */
  downloadMarkdown(markdown: string, filename: string): void {
    Logger.info(`Downloading Markdown: ${filename}`);
    
    // Create blob
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
    
    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Cleanup
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 100);
    
    Logger.info('Markdown download triggered');
  }
}
