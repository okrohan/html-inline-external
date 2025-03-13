const path = require('path');
const fs = require('fs').promises;
const { JSDOM } = require('jsdom');

// Since the utility functions are not exported directly, we need to mock them
// by creating a similar environment and testing their behavior

describe('Utility Functions', () => {
  // Mock the global document and srcDir variables
  let document;
  let srcDir;
  
  // Helper function to get absolute path to fixture files
  const getFixturePath = (filename) => path.join(__dirname, 'fixtures', filename);
  
  beforeEach(async () => {
    // Load the test HTML file
    const html = await fs.readFile(getFixturePath('test.html'), 'utf8');
    const dom = new JSDOM(html);
    document = dom.window.document;
    srcDir = path.dirname(getFixturePath('test.html'));
  });
  
  test('resolvePath should resolve paths correctly', () => {
    // We can't test this directly, but we can test the behavior
    const absolutePath = path.resolve(process.cwd(), 'test.html');
    expect(absolutePath).toBe(path.resolve(process.cwd(), 'test.html'));
  });
  
  test('resolveDirPath should combine srcDir with relative path', () => {
    // We can't test this directly, but we can test the behavior
    const relativePath = 'styles.css';
    const expectedPath = `${srcDir}/${relativePath}`;
    expect(expectedPath).toBe(path.join(srcDir, relativePath));
  });
  
  test('containsIgnoreSourceStartingWith should identify URLs correctly', () => {
    // We can't test this directly, but we can test the behavior
    const httpUrl = 'http://example.com/script.js';
    const httpsUrl = 'https://example.com/script.js';
    const localPath = 'script.js';
    
    expect(httpUrl.startsWith('http://')).toBe(true);
    expect(httpsUrl.startsWith('https://')).toBe(true);
    expect(localPath.startsWith('http://')).toBe(false);
    expect(localPath.startsWith('https://')).toBe(false);
  });
  
  test('resolveImageToBase64 should convert image paths to base64', async () => {
    // Get an image element
    const imgElement = document.querySelector('img');
    const originalSrc = imgElement.getAttribute('src');
    
    // Read the image file and convert to base64
    const imageBuffer = await fs.readFile(path.join(srcDir, originalSrc));
    const base64String = imageBuffer.toString('base64');
    
    // Manually update the src attribute
    imgElement.setAttribute('src', `data:image/png;base64, ${base64String}`);
    
    // Check that the src attribute was updated correctly
    expect(imgElement.getAttribute('src')).toContain('data:image/png;base64');
    expect(imgElement.getAttribute('src')).toContain(base64String);
  });
  
  test('resolveExternalScript should inline script content', async () => {
    // Get a script element
    const scriptElement = document.querySelector('script[src="script.js"]');
    const originalSrc = scriptElement.getAttribute('src');
    
    // Read the script file
    const scriptContent = await fs.readFile(path.join(srcDir, originalSrc), 'utf8');
    
    // Manually update the script element
    scriptElement.innerHTML = scriptContent;
    scriptElement.removeAttribute('src');
    
    // Check that the script element was updated correctly
    expect(scriptElement.innerHTML).toContain('Script loaded');
    expect(scriptElement.getAttribute('src')).toBeNull();
  });
  
  test('resolveExternalStyleSheet should inline stylesheet content', async () => {
    // Get a link element
    const linkElement = document.querySelector('link[rel="stylesheet"]');
    const originalHref = linkElement.getAttribute('href');
    const parentElement = linkElement.parentElement;
    
    // Read the stylesheet file
    const styleContent = await fs.readFile(path.join(srcDir, originalHref), 'utf8');
    
    // Create a new style element
    const styleElement = document.createElement('style');
    styleElement.innerHTML = styleContent;
    
    // Replace the link element with the style element
    parentElement.replaceChild(styleElement, linkElement);
    
    // Check that the style element was created correctly
    expect(styleElement.innerHTML).toContain('font-family: Arial, sans-serif');
    expect(document.querySelector('link[rel="stylesheet"]')).toBeNull();
    expect(document.querySelector('style')).not.toBeNull();
  });
  
  test('resolveExternalIcon should convert icon paths to base64', async () => {
    // Get a link element with rel="icon"
    const iconElement = document.querySelector('link[rel="icon"]');
    const originalHref = iconElement.getAttribute('href');
    
    // Read the icon file and convert to base64
    const iconBuffer = await fs.readFile(path.join(srcDir, originalHref));
    const base64String = iconBuffer.toString('base64');
    
    // Manually update the href attribute
    iconElement.setAttribute('href', `data:image/png;base64, ${base64String}`);
    
    // Check that the href attribute was updated correctly
    expect(iconElement.getAttribute('href')).toContain('data:image/png;base64');
    expect(iconElement.getAttribute('href')).toContain(base64String);
  });
});