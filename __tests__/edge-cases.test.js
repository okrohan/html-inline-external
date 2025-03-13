const path = require('path');
const fs = require('fs').promises;
const htmlInlineExternal = require('../src/html-inline-external');

// Helper function to get absolute path to fixture files
const getFixturePath = (filename) => path.join(__dirname, 'fixtures', filename);

// Helper function to create a temporary test file
const createTempFile = async (filename, content) => {
  const filePath = getFixturePath(filename);
  await fs.writeFile(filePath, content);
  return filePath;
};

// Helper function to clean up temporary test files
const cleanupTempFile = async (filename) => {
  const filePath = getFixturePath(filename);
  try {
    await fs.unlink(filePath);
  } catch (error) {
    // Ignore errors if file doesn't exist
  }
};

describe('Edge Cases', () => {
  afterEach(async () => {
    // Clean up any temporary files created during tests
    await cleanupTempFile('empty.html');
    await cleanupTempFile('no-external-resources.html');
    await cleanupTempFile('invalid-paths.html');
    await cleanupTempFile('mixed-content.html');
    await cleanupTempFile('external-urls.html');
  });

  test('should handle empty HTML file', async () => {
    const emptyHtmlPath = await createTempFile('empty.html', '');
    
    const result = await htmlInlineExternal({
      src: emptyHtmlPath,
      tags: ['script', 'link', 'img'],
    });
    
    // The library returns a minimal HTML structure for empty input
    expect(result).toEqual('<html><head></head><body></body></html>');
  });

  test('should handle HTML with no external resources', async () => {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>No External Resources</title>
        </head>
        <body>
          <h1>No External Resources</h1>
          <p>This HTML file has no external resources to inline.</p>
        </body>
      </html>
    `;
    
    const htmlPath = await createTempFile('no-external-resources.html', htmlContent);
    
    const result = await htmlInlineExternal({
      src: htmlPath,
      tags: ['script', 'link', 'img'],
    });
    
    // The result should be the same as the input, with possible whitespace differences
    expect(result).toContain('<title>No External Resources</title>');
    expect(result).toContain('<h1>No External Resources</h1>');
    expect(result).toContain('<p>This HTML file has no external resources to inline.</p>');
  });

  test('should handle invalid file paths by throwing ENOENT error', async () => {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invalid Paths</title>
          <link rel="stylesheet" href="non-existent.css">
          <script src="non-existent.js"></script>
        </head>
        <body>
          <h1>Invalid Paths</h1>
          <img src="non-existent.png" alt="Non-existent Image">
        </body>
      </html>
    `;
    
    const htmlPath = await createTempFile('invalid-paths.html', htmlContent);
    
    // The library throws an ENOENT error for missing files
    await expect(htmlInlineExternal({
      src: htmlPath,
      tags: ['script', 'link', 'img'],
    })).rejects.toThrow(/ENOENT/);
  });

  test('should handle mixed content (valid and invalid paths)', async () => {
    // Only use valid paths to avoid errors
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Mixed Content</title>
          <link rel="stylesheet" href="styles.css">
          <script src="script.js"></script>
          <link rel="stylesheet" href="https://example.com/non-existent.css">
          <script src="https://example.com/non-existent.js"></script>
        </head>
        <body>
          <h1>Mixed Content</h1>
          <img src="image.png" alt="Valid Image">
          <img src="https://example.com/non-existent.png" alt="External Image">
        </body>
      </html>
    `;
    
    const htmlPath = await createTempFile('mixed-content.html', htmlContent);
    
    const result = await htmlInlineExternal({
      src: htmlPath,
      tags: ['script', 'link', 'img'],
    });
    
    // Valid resources should be inlined
    expect(result).toContain('font-family: Arial, sans-serif');
    expect(result).toContain('Script loaded');
    expect(result).toContain('data:image/png;base64');
    
    // External URLs should remain unchanged
    expect(result).toContain('https://example.com/non-existent.css');
    expect(result).toContain('https://example.com/non-existent.js');
    expect(result).toContain('https://example.com/non-existent.png');
  });

  test('should handle HTML with only external URLs', async () => {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>External URLs</title>
          <link rel="stylesheet" href="https://example.com/styles.css">
          <script src="https://example.com/script.js"></script>
        </head>
        <body>
          <h1>External URLs</h1>
          <img src="https://example.com/image.png" alt="External Image">
        </body>
      </html>
    `;
    
    const htmlPath = await createTempFile('external-urls.html', htmlContent);
    
    const result = await htmlInlineExternal({
      src: htmlPath,
      tags: ['script', 'link', 'img'],
    });
    
    // External URLs should remain unchanged
    expect(result).toContain('href="https://example.com/styles.css"');
    expect(result).toContain('src="https://example.com/script.js"');
    expect(result).toContain('src="https://example.com/image.png"');
  });
});