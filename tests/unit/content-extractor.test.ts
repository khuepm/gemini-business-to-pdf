/**
 * Unit tests for ContentExtractor
 * Tests specific examples, edge cases, and error conditions
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ContentExtractor, Message, ChatContent } from '../../src/content/content-extractor';
import { DOMError } from '../../src/utils/error-handler';

describe('ContentExtractor', () => {
  let extractor: ContentExtractor;
  let originalDOM: string;

  beforeEach(() => {
    extractor = new ContentExtractor();
    // Save original DOM
    originalDOM = document.body.innerHTML;
  });

  afterEach(() => {
    // Restore original DOM
    document.body.innerHTML = originalDOM;
  });

  describe('extractChatContent', () => {
    it('should extract all messages from chat container', () => {
      // Setup DOM with chat container and messages
      document.body.innerHTML = `
        <div class="chat-container">
          <div class="message user-message">Hello</div>
          <div class="message gemini-message">Hi there!</div>
          <div class="message user-message">How are you?</div>
        </div>
      `;

      const result = extractor.extractChatContent();

      expect(result.messages).toHaveLength(3);
      expect(result.messages[0].sender).toBe('user');
      expect(result.messages[0].content).toContain('Hello');
      expect(result.messages[1].sender).toBe('gemini');
      expect(result.messages[1].content).toContain('Hi there!');
      expect(result.messages[2].sender).toBe('user');
      expect(result.messages[2].content).toContain('How are you?');
    });

    it('should handle empty chat container', () => {
      document.body.innerHTML = `
        <div class="chat-container">
        </div>
      `;

      const result = extractor.extractChatContent();

      expect(result.messages).toHaveLength(0);
      expect(result.metadata?.totalMessages).toBe(0);
      expect(result.metadata?.userMessages).toBe(0);
      expect(result.metadata?.geminiMessages).toBe(0);
    });

    it('should throw DOMError when chat container not found', () => {
      document.body.innerHTML = '<div>No chat here</div>';

      expect(() => extractor.extractChatContent()).toThrow(DOMError);
    });

    it('should include metadata with message counts', () => {
      document.body.innerHTML = `
        <div class="chat-container">
          <div class="message user-message">User 1</div>
          <div class="message user-message">User 2</div>
          <div class="message gemini-message">Gemini 1</div>
        </div>
      `;

      const result = extractor.extractChatContent();

      expect(result.metadata?.totalMessages).toBe(3);
      expect(result.metadata?.userMessages).toBe(2);
      expect(result.metadata?.geminiMessages).toBe(1);
    });

    it('should include timestamp in result', () => {
      document.body.innerHTML = `
        <div class="chat-container">
          <div class="message user-message">Test</div>
        </div>
      `;

      const beforeTime = new Date();
      const result = extractor.extractChatContent();
      const afterTime = new Date();

      expect(result.timestamp).toBeInstanceOf(Date);
      expect(result.timestamp.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime());
      expect(result.timestamp.getTime()).toBeLessThanOrEqual(afterTime.getTime());
    });
  });

  describe('extractMessage', () => {
    it('should extract message with HTML content preserved', () => {
      const messageElement = document.createElement('div');
      messageElement.className = 'message user-message';
      messageElement.innerHTML = '<p>Hello <strong>world</strong>!</p>';

      const message = extractor.extractMessage(messageElement);

      expect(message.sender).toBe('user');
      expect(message.content).toContain('<p>Hello <strong>world</strong>!</p>');
    });

    it('should detect code blocks in content', () => {
      const messageElement = document.createElement('div');
      messageElement.className = 'message gemini-message';
      messageElement.innerHTML = '<pre><code>const x = 1;</code></pre>';

      const message = extractor.extractMessage(messageElement);

      expect(message.metadata?.hasCodeBlock).toBe(true);
      expect(message.metadata?.hasTable).toBe(false);
      expect(message.metadata?.hasList).toBe(false);
    });

    it('should detect tables in content', () => {
      const messageElement = document.createElement('div');
      messageElement.className = 'message gemini-message';
      messageElement.innerHTML = `
        <table>
          <tr><th>Name</th><th>Age</th></tr>
          <tr><td>John</td><td>30</td></tr>
        </table>
      `;

      const message = extractor.extractMessage(messageElement);

      expect(message.metadata?.hasTable).toBe(true);
      expect(message.metadata?.hasCodeBlock).toBe(false);
      expect(message.metadata?.hasList).toBe(false);
    });

    it('should detect lists in content', () => {
      const messageElement = document.createElement('div');
      messageElement.className = 'message user-message';
      messageElement.innerHTML = `
        <ul>
          <li>Item 1</li>
          <li>Item 2</li>
        </ul>
      `;

      const message = extractor.extractMessage(messageElement);

      expect(message.metadata?.hasList).toBe(true);
      expect(message.metadata?.hasCodeBlock).toBe(false);
      expect(message.metadata?.hasTable).toBe(false);
    });

    it('should extract timestamp if available', () => {
      const messageElement = document.createElement('div');
      messageElement.className = 'message user-message';
      messageElement.innerHTML = `
        <span class="timestamp">2024-01-15 10:30</span>
        <p>Message content</p>
      `;

      const message = extractor.extractMessage(messageElement);

      expect(message.timestamp).toBe('2024-01-15 10:30');
    });

    it('should handle message without timestamp', () => {
      const messageElement = document.createElement('div');
      messageElement.className = 'message user-message';
      messageElement.innerHTML = '<p>Message content</p>';

      const message = extractor.extractMessage(messageElement);

      expect(message.timestamp).toBeUndefined();
    });

    it('should preserve complex HTML structure', () => {
      const messageElement = document.createElement('div');
      messageElement.className = 'message gemini-message';
      messageElement.innerHTML = `
        <div class="content">
          <p>Here's some <em>formatted</em> text with <a href="https://example.com">a link</a>.</p>
          <ul>
            <li>Item 1</li>
            <li>Item 2</li>
          </ul>
          <pre><code>function test() { return true; }</code></pre>
        </div>
      `;

      const message = extractor.extractMessage(messageElement);

      expect(message.content).toContain('<em>formatted</em>');
      expect(message.content).toContain('<a href="https://example.com">a link</a>');
      expect(message.content).toContain('<ul>');
      expect(message.content).toContain('<pre><code>');
      expect(message.metadata?.hasCodeBlock).toBe(true);
      expect(message.metadata?.hasList).toBe(true);
    });
  });

  describe('identifySender', () => {
    it('should identify user message by class', () => {
      const messageElement = document.createElement('div');
      messageElement.className = 'message user-message';

      const sender = extractor.identifySender(messageElement);

      expect(sender).toBe('user');
    });

    it('should identify gemini message by class', () => {
      const messageElement = document.createElement('div');
      messageElement.className = 'message gemini-message';

      const sender = extractor.identifySender(messageElement);

      expect(sender).toBe('gemini');
    });

    it('should identify user message by data-sender attribute', () => {
      const messageElement = document.createElement('div');
      messageElement.className = 'message';
      messageElement.setAttribute('data-sender', 'user');

      const sender = extractor.identifySender(messageElement);

      expect(sender).toBe('user');
    });

    it('should identify gemini message by data-sender attribute', () => {
      const messageElement = document.createElement('div');
      messageElement.className = 'message';
      messageElement.setAttribute('data-sender', 'gemini');

      const sender = extractor.identifySender(messageElement);

      expect(sender).toBe('gemini');
    });

    it('should identify model message as gemini', () => {
      const messageElement = document.createElement('div');
      messageElement.className = 'message model-message';

      const sender = extractor.identifySender(messageElement);

      expect(sender).toBe('gemini');
    });

    it('should identify assistant message as gemini', () => {
      const messageElement = document.createElement('div');
      messageElement.className = 'message';
      messageElement.setAttribute('data-sender', 'assistant');

      const sender = extractor.identifySender(messageElement);

      expect(sender).toBe('gemini');
    });

    it('should default to gemini when sender cannot be determined', () => {
      const messageElement = document.createElement('div');
      messageElement.className = 'message unknown';

      const sender = extractor.identifySender(messageElement);

      expect(sender).toBe('gemini');
    });

    it('should identify user by class pattern containing "user"', () => {
      const messageElement = document.createElement('div');
      messageElement.className = 'chat-message-user-container';

      const sender = extractor.identifySender(messageElement);

      expect(sender).toBe('user');
    });

    it('should identify gemini by class pattern containing "ai"', () => {
      const messageElement = document.createElement('div');
      messageElement.className = 'chat-message-ai-response';

      const sender = extractor.identifySender(messageElement);

      expect(sender).toBe('gemini');
    });
  });

  // Task 6.6: Specific test scenarios
  describe('Task 6.6: Content Extractor Test Scenarios', () => {
    describe('Empty chat', () => {
      it('should handle completely empty chat container', () => {
        document.body.innerHTML = `<div class="chat-container"></div>`;

        const result = extractor.extractChatContent();

        expect(result.messages).toHaveLength(0);
        expect(result.metadata?.totalMessages).toBe(0);
        expect(result.metadata?.userMessages).toBe(0);
        expect(result.metadata?.geminiMessages).toBe(0);
        expect(result.timestamp).toBeInstanceOf(Date);
      });

      it('should handle chat container with only whitespace', () => {
        document.body.innerHTML = `
          <div class="chat-container">
            
            
          </div>
        `;

        const result = extractor.extractChatContent();

        expect(result.messages).toHaveLength(0);
      });
    });

    describe('Messages with code blocks', () => {
      it('should extract message with inline code', () => {
        document.body.innerHTML = `
          <div class="chat-container">
            <div class="message gemini-message">
              <p>Use the <code>console.log()</code> function to debug.</p>
            </div>
          </div>
        `;

        const result = extractor.extractChatContent();

        expect(result.messages).toHaveLength(1);
        expect(result.messages[0].content).toContain('<code>console.log()</code>');
        expect(result.messages[0].metadata?.hasCodeBlock).toBe(true);
      });

      it('should extract message with code block', () => {
        document.body.innerHTML = `
          <div class="chat-container">
            <div class="message gemini-message">
              <p>Here's an example:</p>
              <pre><code>function greet(name) {
  return "Hello, " + name;
}</code></pre>
            </div>
          </div>
        `;

        const result = extractor.extractChatContent();

        expect(result.messages).toHaveLength(1);
        expect(result.messages[0].content).toContain('<pre>');
        expect(result.messages[0].content).toContain('<code>');
        expect(result.messages[0].content).toContain('function greet');
        expect(result.messages[0].metadata?.hasCodeBlock).toBe(true);
      });

      it('should extract message with multiple code blocks', () => {
        document.body.innerHTML = `
          <div class="chat-container">
            <div class="message gemini-message">
              <p>First example:</p>
              <pre><code>const x = 1;</code></pre>
              <p>Second example:</p>
              <pre><code>const y = 2;</code></pre>
            </div>
          </div>
        `;

        const result = extractor.extractChatContent();

        expect(result.messages).toHaveLength(1);
        expect(result.messages[0].content).toContain('const x = 1');
        expect(result.messages[0].content).toContain('const y = 2');
        expect(result.messages[0].metadata?.hasCodeBlock).toBe(true);
      });

      it('should preserve code block formatting and indentation', () => {
        const codeContent = `function example() {
  if (true) {
    console.log("indented");
  }
}`;
        document.body.innerHTML = `
          <div class="chat-container">
            <div class="message gemini-message">
              <pre><code>${codeContent}</code></pre>
            </div>
          </div>
        `;

        const result = extractor.extractChatContent();

        expect(result.messages[0].content).toContain(codeContent);
      });
    });

    describe('Messages with tables', () => {
      it('should extract message with simple table', () => {
        document.body.innerHTML = `
          <div class="chat-container">
            <div class="message gemini-message">
              <table>
                <tr>
                  <th>Name</th>
                  <th>Age</th>
                </tr>
                <tr>
                  <td>Alice</td>
                  <td>30</td>
                </tr>
                <tr>
                  <td>Bob</td>
                  <td>25</td>
                </tr>
              </table>
            </div>
          </div>
        `;

        const result = extractor.extractChatContent();

        expect(result.messages).toHaveLength(1);
        expect(result.messages[0].content).toContain('<table>');
        expect(result.messages[0].content).toContain('<th>Name</th>');
        expect(result.messages[0].content).toContain('<th>Age</th>');
        expect(result.messages[0].content).toContain('<td>Alice</td>');
        expect(result.messages[0].content).toContain('<td>Bob</td>');
        expect(result.messages[0].metadata?.hasTable).toBe(true);
      });

      it('should extract message with table containing formatted content', () => {
        document.body.innerHTML = `
          <div class="chat-container">
            <div class="message gemini-message">
              <table>
                <tr>
                  <th>Feature</th>
                  <th>Status</th>
                </tr>
                <tr>
                  <td><strong>Authentication</strong></td>
                  <td><em>Complete</em></td>
                </tr>
                <tr>
                  <td><code>API</code></td>
                  <td><a href="#">Link</a></td>
                </tr>
              </table>
            </div>
          </div>
        `;

        const result = extractor.extractChatContent();

        expect(result.messages[0].content).toContain('<strong>Authentication</strong>');
        expect(result.messages[0].content).toContain('<em>Complete</em>');
        expect(result.messages[0].content).toContain('<code>API</code>');
        expect(result.messages[0].content).toContain('<a href="#">Link</a>');
        expect(result.messages[0].metadata?.hasTable).toBe(true);
      });

      it('should extract message with multiple tables', () => {
        document.body.innerHTML = `
          <div class="chat-container">
            <div class="message gemini-message">
              <p>First table:</p>
              <table>
                <tr><td>Data 1</td></tr>
              </table>
              <p>Second table:</p>
              <table>
                <tr><td>Data 2</td></tr>
              </table>
            </div>
          </div>
        `;

        const result = extractor.extractChatContent();

        expect(result.messages[0].content).toContain('Data 1');
        expect(result.messages[0].content).toContain('Data 2');
        expect(result.messages[0].metadata?.hasTable).toBe(true);
      });
    });

    describe('Messages with lists', () => {
      it('should extract message with unordered list', () => {
        document.body.innerHTML = `
          <div class="chat-container">
            <div class="message gemini-message">
              <p>Here are the steps:</p>
              <ul>
                <li>First step</li>
                <li>Second step</li>
                <li>Third step</li>
              </ul>
            </div>
          </div>
        `;

        const result = extractor.extractChatContent();

        expect(result.messages).toHaveLength(1);
        expect(result.messages[0].content).toContain('<ul>');
        expect(result.messages[0].content).toContain('<li>First step</li>');
        expect(result.messages[0].content).toContain('<li>Second step</li>');
        expect(result.messages[0].content).toContain('<li>Third step</li>');
        expect(result.messages[0].content).toContain('</ul>');
        expect(result.messages[0].metadata?.hasList).toBe(true);
      });

      it('should extract message with ordered list', () => {
        document.body.innerHTML = `
          <div class="chat-container">
            <div class="message user-message">
              <p>My priorities:</p>
              <ol>
                <li>Learn TypeScript</li>
                <li>Build a project</li>
                <li>Deploy to production</li>
              </ol>
            </div>
          </div>
        `;

        const result = extractor.extractChatContent();

        expect(result.messages).toHaveLength(1);
        expect(result.messages[0].content).toContain('<ol>');
        expect(result.messages[0].content).toContain('<li>Learn TypeScript</li>');
        expect(result.messages[0].content).toContain('<li>Build a project</li>');
        expect(result.messages[0].content).toContain('<li>Deploy to production</li>');
        expect(result.messages[0].content).toContain('</ol>');
        expect(result.messages[0].metadata?.hasList).toBe(true);
      });

      it('should extract message with nested lists', () => {
        document.body.innerHTML = `
          <div class="chat-container">
            <div class="message gemini-message">
              <ul>
                <li>Parent item 1
                  <ul>
                    <li>Child item 1.1</li>
                    <li>Child item 1.2</li>
                  </ul>
                </li>
                <li>Parent item 2</li>
              </ul>
            </div>
          </div>
        `;

        const result = extractor.extractChatContent();

        expect(result.messages[0].content).toContain('Parent item 1');
        expect(result.messages[0].content).toContain('Child item 1.1');
        expect(result.messages[0].content).toContain('Child item 1.2');
        expect(result.messages[0].content).toContain('Parent item 2');
        expect(result.messages[0].metadata?.hasList).toBe(true);
      });

      it('should extract message with list containing formatted content', () => {
        document.body.innerHTML = `
          <div class="chat-container">
            <div class="message gemini-message">
              <ul>
                <li><strong>Bold item</strong></li>
                <li><em>Italic item</em></li>
                <li><code>Code item</code></li>
                <li><a href="#">Link item</a></li>
              </ul>
            </div>
          </div>
        `;

        const result = extractor.extractChatContent();

        expect(result.messages[0].content).toContain('<strong>Bold item</strong>');
        expect(result.messages[0].content).toContain('<em>Italic item</em>');
        expect(result.messages[0].content).toContain('<code>Code item</code>');
        expect(result.messages[0].content).toContain('<a href="#">Link item</a>');
        expect(result.messages[0].metadata?.hasList).toBe(true);
      });
    });

    describe('Sender identification', () => {
      it('should correctly identify user messages in a conversation', () => {
        document.body.innerHTML = `
          <div class="chat-container">
            <div class="message user-message">Hello!</div>
            <div class="message gemini-message">Hi there!</div>
            <div class="message user-message">How are you?</div>
          </div>
        `;

        const result = extractor.extractChatContent();

        expect(result.messages).toHaveLength(3);
        expect(result.messages[0].sender).toBe('user');
        expect(result.messages[1].sender).toBe('gemini');
        expect(result.messages[2].sender).toBe('user');
      });

      it('should correctly identify gemini messages in a conversation', () => {
        document.body.innerHTML = `
          <div class="chat-container">
            <div class="message gemini-message">Hello! How can I help?</div>
            <div class="message user-message">I need help</div>
            <div class="message gemini-message">Sure, what do you need?</div>
          </div>
        `;

        const result = extractor.extractChatContent();

        expect(result.messages).toHaveLength(3);
        expect(result.messages[0].sender).toBe('gemini');
        expect(result.messages[1].sender).toBe('user');
        expect(result.messages[2].sender).toBe('gemini');
      });

      it('should identify sender using data-sender attribute', () => {
        document.body.innerHTML = `
          <div class="chat-container">
            <div class="message" data-sender="user">User message</div>
            <div class="message" data-sender="gemini">Gemini message</div>
            <div class="message" data-sender="assistant">Assistant message</div>
          </div>
        `;

        const result = extractor.extractChatContent();

        expect(result.messages[0].sender).toBe('user');
        expect(result.messages[1].sender).toBe('gemini');
        expect(result.messages[2].sender).toBe('gemini'); // assistant is treated as gemini
      });

      it('should identify sender using class patterns', () => {
        document.body.innerHTML = `
          <div class="chat-container">
            <div class="message chat-message-user-container">User via pattern</div>
            <div class="message chat-message-ai-response">AI via pattern</div>
            <div class="message message-from-user">Another user pattern</div>
            <div class="message model-message">Model message</div>
          </div>
        `;

        const result = extractor.extractChatContent();

        expect(result.messages).toHaveLength(4);
        expect(result.messages[0].sender).toBe('user');
        expect(result.messages[1].sender).toBe('gemini');
        expect(result.messages[2].sender).toBe('user');
        expect(result.messages[3].sender).toBe('gemini');
      });

      it('should maintain sender identification with complex content', () => {
        document.body.innerHTML = `
          <div class="chat-container">
            <div class="message user-message">
              <p>Can you show me a table?</p>
            </div>
            <div class="message gemini-message">
              <p>Sure! Here's a table:</p>
              <table>
                <tr><th>Column</th></tr>
                <tr><td>Data</td></tr>
              </table>
              <p>And here's some code:</p>
              <pre><code>const x = 1;</code></pre>
            </div>
          </div>
        `;

        const result = extractor.extractChatContent();

        expect(result.messages).toHaveLength(2);
        expect(result.messages[0].sender).toBe('user');
        expect(result.messages[0].content).toContain('Can you show me a table?');
        expect(result.messages[1].sender).toBe('gemini');
        expect(result.messages[1].content).toContain('<table>');
        expect(result.messages[1].content).toContain('<pre><code>');
      });
    });

    describe('Combined scenarios', () => {
      it('should handle conversation with all content types', () => {
        document.body.innerHTML = `
          <div class="chat-container">
            <div class="message user-message">
              <p>Show me examples of:</p>
              <ul>
                <li>Code</li>
                <li>Tables</li>
                <li>Lists</li>
              </ul>
            </div>
            <div class="message gemini-message">
              <p>Here's a code example:</p>
              <pre><code>function test() { return true; }</code></pre>
              <p>Here's a table:</p>
              <table>
                <tr><th>Header</th></tr>
                <tr><td>Data</td></tr>
              </table>
              <p>And a list:</p>
              <ol>
                <li>First</li>
                <li>Second</li>
              </ol>
            </div>
          </div>
        `;

        const result = extractor.extractChatContent();

        expect(result.messages).toHaveLength(2);
        
        // User message
        expect(result.messages[0].sender).toBe('user');
        expect(result.messages[0].metadata?.hasList).toBe(true);
        
        // Gemini message with all content types
        expect(result.messages[1].sender).toBe('gemini');
        expect(result.messages[1].metadata?.hasCodeBlock).toBe(true);
        expect(result.messages[1].metadata?.hasTable).toBe(true);
        expect(result.messages[1].metadata?.hasList).toBe(true);
        expect(result.messages[1].content).toContain('<pre><code>');
        expect(result.messages[1].content).toContain('<table>');
        expect(result.messages[1].content).toContain('<ol>');
      });
    });
  });

  describe('edge cases', () => {
    it('should handle messages with only whitespace', () => {
      document.body.innerHTML = `
        <div class="chat-container">
          <div class="message user-message">   </div>
        </div>
      `;

      const result = extractor.extractChatContent();

      expect(result.messages).toHaveLength(1);
      expect(result.messages[0].content.trim()).toBe('');
    });

    it('should handle messages with special characters', () => {
      const messageElement = document.createElement('div');
      messageElement.className = 'message user-message';
      messageElement.innerHTML = '<p>&lt;script&gt;alert("test")&lt;/script&gt;</p>';

      const message = extractor.extractMessage(messageElement);

      expect(message.content).toContain('&lt;script&gt;');
    });

    it('should handle deeply nested HTML', () => {
      const messageElement = document.createElement('div');
      messageElement.className = 'message gemini-message';
      messageElement.innerHTML = `
        <div>
          <div>
            <div>
              <p>Deeply <strong>nested <em>content</em></strong></p>
            </div>
          </div>
        </div>
      `;

      const message = extractor.extractMessage(messageElement);

      expect(message.content).toContain('Deeply');
      expect(message.content).toContain('<strong>');
      expect(message.content).toContain('<em>');
    });

    it('should not modify original DOM when extracting', () => {
      const messageElement = document.createElement('div');
      messageElement.className = 'message user-message';
      messageElement.innerHTML = '<p>Original content</p>';
      const originalHTML = messageElement.innerHTML;

      extractor.extractMessage(messageElement);

      expect(messageElement.innerHTML).toBe(originalHTML);
    });

    it('should handle multiple content types in one message', () => {
      const messageElement = document.createElement('div');
      messageElement.className = 'message gemini-message';
      messageElement.innerHTML = `
        <p>Here's a response with everything:</p>
        <ul>
          <li>A list item</li>
        </ul>
        <pre><code>const code = true;</code></pre>
        <table>
          <tr><td>Data</td></tr>
        </table>
      `;

      const message = extractor.extractMessage(messageElement);

      expect(message.metadata?.hasCodeBlock).toBe(true);
      expect(message.metadata?.hasTable).toBe(true);
      expect(message.metadata?.hasList).toBe(true);
    });
  });
});
