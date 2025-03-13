const path = require('path');
const fs = require('fs').promises;
const htmlInlineExternal = require('../src/html-inline-external');

// Helper function to get absolute path to fixture files
const getFixturePath = (filename) => path.join(__dirname, 'fixtures', filename);

describe('htmlInlineExternal', () => {
  test('should inline external scripts', async () => {
    const result = await htmlInlineExternal({
      src: getFixturePath('test.html'),
      tags: ['script'],
    });
    
    // The result should contain the script content
    expect(result).toContain('Script loaded');
    expect(result).toContain('Heading clicked');
    
    // The result should not contain the script src attribute for local scripts
    expect(result).not.toMatch(/<script[^>]*src="script\.js"/);
    
    // External scripts (http/https) should remain untouched
    expect(result).toMatch(/<script[^>]*src="https:\/\/example\.com\/external-script\.js"/);
  });
  
  test('should inline external stylesheets', async () => {
    const result = await htmlInlineExternal({
      src: getFixturePath('test.html'),
      tags: ['link'],
    });
    
    // The result should contain the stylesheet content
    expect(result).toContain('font-family: Arial, sans-serif');
    expect(result).toContain('color: #333');
    
    // The result should not contain the link tag for stylesheets
    expect(result).not.toMatch(/<link[^>]*rel="stylesheet"/);
    
    // The result should contain a style tag instead
    expect(result).toMatch(/<style>/);
  });
  
  test('should convert images to base64', async () => {
    const result = await htmlInlineExternal({
      src: getFixturePath('test.html'),
      tags: ['img'],
    });
    
    // The result should contain base64 encoded image data
    expect(result).toContain('data:image/png;base64');
    
    // The result should not contain the original image src
    expect(result).not.toMatch(/<img[^>]*src="image\.png"/);
  });
  
  test('should convert favicon to base64', async () => {
    const result = await htmlInlineExternal({
      src: getFixturePath('test.html'),
      tags: ['link'],
    });
    
    // The result should contain base64 encoded favicon data
    expect(result).toContain('data:image/png;base64');
    
    // The result should not contain the original favicon href
    expect(result).not.toMatch(/<link[^>]*href="favicon\.png"/);
  });
  
  test('should process all specified tags', async () => {
    const result = await htmlInlineExternal({
      src: getFixturePath('test.html'),
      tags: ['script', 'link', 'img'],
    });
    
    // Check for script content
    expect(result).toContain('Script loaded');
    
    // Check for stylesheet content
    expect(result).toContain('font-family: Arial, sans-serif');
    
    // Check for base64 encoded image
    expect(result).toContain('data:image/png;base64');
    
    // External scripts should remain untouched
    expect(result).toMatch(/<script[^>]*src="https:\/\/example\.com\/external-script\.js"/);
  });
  
  test('should prettify output when pretty option is true', async () => {
    const result = await htmlInlineExternal({
      src: getFixturePath('test.html'),
      tags: ['script', 'link', 'img'],
      pretty: true,
    });
    
    // Prettified HTML should have consistent indentation
    const lines = result.split('\n');
    const indentedLines = lines.filter(line => line.startsWith('  '));
    expect(indentedLines.length).toBeGreaterThan(0);
  });
  
  test('should minify output when minify option is true', async () => {
    const result = await htmlInlineExternal({
      src: getFixturePath('test.html'),
      tags: ['script', 'link', 'img'],
      minify: true,
    });
    
    // Minified HTML should have reduced whitespace
    // Check for minification characteristics
    expect(result).toContain('<!DOCTYPE html><html'); // Tags are combined
    
    // The output should be more compact than non-minified
    const regularResult = await htmlInlineExternal({
      src: getFixturePath('test.html'),
      tags: ['script', 'link', 'img'],
    });
    expect(result.length).toBeLessThan(regularResult.length);
  });
});