const { test, expect } = require('@playwright/test');

test.describe('Simple Islands Architecture Test', () => {
  test('SSR HTML endpoint works correctly', async ({ page }) => {
    console.log('🧪 Testing SSR HTML generation...');
    
    // Test the SSR HTML API directly
    const response = await page.request.get('http://localhost:3002/api/island-html?component=Counter&props=%7B%22initialCount%22%3A42%7D');
    expect(response.status()).toBe(200);
    
    const htmlContent = await response.text();
    console.log('✅ SSR HTML API responded successfully');
    
    // Verify the HTML contains expected elements
    expect(htmlContent).toContain('data-island="Counter"');
    expect(htmlContent).toContain('data-ssr-rendered="true"');
    expect(htmlContent).toContain('42'); // Initial count value
    expect(htmlContent).toContain('SSR HTML ONLY');
    
    console.log('✅ SSR HTML contains all expected island markers and content');
  });
  
  test('Module Federation remoteEntry is accessible', async ({ page }) => {
    console.log('🧪 Testing Module Federation endpoint...');
    
    const response = await page.request.get('http://localhost:3002/_next/static/chunks/remoteEntry.js');
    expect(response.status()).toBe(200);
    
    const jsContent = await response.text();
    expect(jsContent.length).toBeGreaterThan(100); // Should contain actual JS code
    
    console.log('✅ Module Federation remoteEntry.js is accessible');
  });
  
  test('Islands Architecture principles can be validated manually', async ({ page }) => {
    console.log('🧪 Manual Islands Architecture validation...');
    
    // Step 1: Verify SSR HTML generation
    console.log('📄 Step 1: Testing SSR HTML generation');
    const ssrResponse = await page.request.get('http://localhost:3002/api/island-html?component=Counter&props=%7B%22initialCount%22%3A100%7D');
    const ssrHtml = await ssrResponse.text();
    
    // Verify SSR HTML contains static content
    expect(ssrHtml).toContain('Interactive Counter');
    expect(ssrHtml).toContain('100'); // Initial count
    expect(ssrHtml).toContain('cursor:default'); // Static buttons
    expect(ssrHtml).toContain('SSR HTML ONLY');
    console.log('✅ SSR HTML contains static, non-interactive content');
    
    // Step 2: Verify Module Federation exposes components
    console.log('🔗 Step 2: Testing Module Federation exposure');
    const mfResponse = await page.request.get('http://localhost:3002/_next/static/chunks/remoteEntry.js');
    const mfContent = await mfResponse.text();
    
    // Check that Counter is exposed in the federation
    expect(mfContent).toContain('Counter');
    expect(mfContent).toContain('InteractiveCounter');
    console.log('✅ Module Federation exposes Counter components');
    
    // Step 3: Validate island architecture principles
    console.log('🏗️ Step 3: Validating Islands Architecture principles');
    
    // Principle 1: Server-side rendering first
    expect(ssrHtml).toContain('data-ssr-rendered="true"');
    console.log('  ✓ Principle 1: Server-rendered HTML delivered first');
    
    // Principle 2: Progressive enhancement markers
    expect(ssrHtml).toContain('data-hydration-strategy');
    expect(ssrHtml).toContain('data-island="Counter"');
    console.log('  ✓ Principle 2: Progressive enhancement markers present');
    
    // Principle 3: Selective hydration capability
    expect(mfContent).toContain('InteractiveCounter'); // Interactive version available
    console.log('  ✓ Principle 3: Interactive version available for selective hydration');
    
    // Principle 4: Static-first approach
    expect(ssrHtml).toContain('cursor:default'); // Buttons are static initially
    expect(ssrHtml).toContain('SSR HTML ONLY'); // Clear state indication
    console.log('  ✓ Principle 4: Static-first approach with clear state indication');
    
    console.log('🎉 Islands Architecture principles successfully validated!');
    console.log('');
    console.log('📋 Validation Summary:');
    console.log('  ✅ SSR HTML generation working');
    console.log('  ✅ Module Federation component exposure working');
    console.log('  ✅ Island boundary markers present');
    console.log('  ✅ Static-first rendering confirmed');
    console.log('  ✅ Progressive enhancement setup ready');
    console.log('');
    console.log('🔧 Technical Implementation:');
    console.log('  • SSR App (port 3002) generates static HTML first');
    console.log('  • Module Federation exposes interactive components');
    console.log('  • Island boundaries enable selective hydration');
    console.log('  • Progressive enhancement from static → interactive');
  });
});