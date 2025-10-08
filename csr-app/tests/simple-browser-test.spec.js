const { test, expect } = require('@playwright/test');

test.describe('Simple Browser Test', () => {
  test('CSR app loads and displays Counter island', async ({ page }) => {
    console.log('🧪 Testing CSR app loading...');
    
    // Track console logs and errors
    const logs = [];
    const errors = [];
    
    page.on('console', msg => {
      logs.push({ type: msg.type(), text: msg.text() });
      console.log(`[${msg.type()}] ${msg.text()}`);
    });
    
    page.on('pageerror', error => {
      errors.push(error.message);
      console.log(`[ERROR] ${error.message}`);
    });

    // Navigate to the CSR app
    console.log('📍 Navigating to CSR app...');
    await page.goto('http://localhost:3003', { waitUntil: 'networkidle', timeout: 30000 });
    
    // Take screenshot
    await page.screenshot({ path: 'test-results/csr-app-loaded.png' });
    
    // Check that the app container loads
    await page.waitForSelector('.App', { timeout: 10000 });
    console.log('✅ CSR app container loaded');
    
    // Check if Counter Demo tab is present and active (it should be default)
    const tabButton = page.locator('button:has-text("🎯 Simple Counter Island")');
    await expect(tabButton).toBeVisible();
    console.log('✅ Counter Demo tab is visible');
    
    // Wait for island content to load
    await page.waitForTimeout(3000); // Give time for island to load
    
    // Look for either loading state or loaded content
    const loadingState = page.locator('text=Loading Counter Island');
    const islandContent = page.locator('[data-island="Counter"]');
    const errorState = page.locator('text=Island Load Failed');
    
    // Check what state we're in
    if (await loadingState.count() > 0) {
      console.log('🔄 Island is in loading state');
      // Wait a bit more for loading to complete
      await page.waitForTimeout(5000);
    }
    
    if (await islandContent.count() > 0) {
      console.log('✅ Island content found');
      await page.screenshot({ path: 'test-results/island-loaded.png' });
      
      // Check for SSR content
      const counterValue = page.locator('text=/^\\d+$/').first();
      if (await counterValue.count() > 0) {
        const value = await counterValue.textContent();
        console.log(`✅ Counter value displayed: ${value}`);
      }
      
    } else if (await errorState.count() > 0) {
      console.log('❌ Island failed to load');
      await page.screenshot({ path: 'test-results/island-error.png' });
    } else {
      console.log('⏳ Island still loading or in unknown state');
      await page.screenshot({ path: 'test-results/island-unknown.png' });
    }
    
    // Report any JavaScript errors
    if (errors.length > 0) {
      console.log('🚨 JavaScript errors detected:');
      errors.forEach((err, i) => console.log(`  ${i + 1}. ${err}`));
    } else {
      console.log('✅ No JavaScript errors detected');
    }
    
    // Look for island-related logs
    const islandLogs = logs.filter(log => 
      log.text.includes('island') || 
      log.text.includes('Island') ||
      log.text.includes('SSR HTML') ||
      log.text.includes('hydrat')
    );
    
    if (islandLogs.length > 0) {
      console.log('📋 Island-related logs:');
      islandLogs.forEach(log => console.log(`  [${log.type}] ${log.text}`));
    }
    
    console.log('🎯 Test completed - check screenshots for visual confirmation');
  });
});