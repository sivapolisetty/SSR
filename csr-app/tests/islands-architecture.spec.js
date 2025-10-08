const { test, expect } = require('@playwright/test');

test.describe('Islands Architecture Demo', () => {
  test('Counter component should load SSR HTML first then hydrate for interactivity', async ({ page }) => {
    // Start capturing console logs
    const logs = [];
    page.on('console', msg => {
      logs.push({ type: msg.type(), text: msg.text() });
    });

    // Navigate to the counter demo page
    await page.goto('http://localhost:3003');
    
    // Wait for the app to load completely
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('button:has-text("🎯 Simple Counter Island")', { timeout: 10000 });
    
    // Click on the Simple Counter Island tab with force
    await page.click('button:has-text("🎯 Simple Counter Island")', { force: true });
    
    // Wait for the counter component to appear
    await page.waitForSelector('[data-island="Counter"]', { timeout: 10000 });
    
    // Check that SSR HTML is loaded first
    const ssrElement = await page.locator('[data-ssr-rendered="true"]');
    await expect(ssrElement).toBeVisible();
    
    // Verify the counter shows initial value
    const counterValue = await page.locator('[data-island="Counter"] >> text=/^\d+$/').first();
    await expect(counterValue).toHaveText('0');
    
    // Check for hydration status indicator
    const hydrationStatus = await page.locator('text=SSR HTML ONLY');
    await expect(hydrationStatus).toBeVisible();
    
    // Wait for hydration to complete (InteractiveCounter to load)
    await page.waitForSelector('text=HYDRATED & INTERACTIVE', { timeout: 15000 });
    
    // Now test interactivity - click the increase button
    await page.click('text=+ Increase');
    
    // Verify the counter value increased
    const updatedValue = await page.locator('[data-island="Counter"] >> text=/^\d+$/').first();
    await expect(updatedValue).toHaveText('1');
    
    // Test decrease button
    await page.click('text=- Decrease');
    await expect(updatedValue).toHaveText('0');
    
    // Test reset button
    await page.click('text=+ Increase');
    await page.click('text=+ Increase');
    await expect(updatedValue).toHaveText('2');
    
    await page.click('text=Reset');
    await expect(updatedValue).toHaveText('0');
    
    // Verify hydration success log
    const hydrationLog = logs.find(log => 
      log.text.includes('Interactive Counter hydrated with count')
    );
    expect(hydrationLog).toBeTruthy();
    
    console.log('✅ Islands Architecture test passed:');
    console.log('  1. SSR HTML loaded first');
    console.log('  2. Component hydrated successfully');
    console.log('  3. Interactive functionality working');
    console.log('  4. State management operational');
  });
  
  test('Should handle Module Federation loading correctly', async ({ page }) => {
    const errors = [];
    page.on('pageerror', error => {
      errors.push(error.message);
    });
    
    // Navigate to counter demo
    await page.goto('http://localhost:3003');
    await page.waitForLoadState('networkidle');
    await page.click('button:has-text("🎯 Simple Counter Island")', { force: true });
    
    // Wait for hydration
    await page.waitForSelector('text=HYDRATED & INTERACTIVE', { timeout: 15000 });
    
    // Check for Module Federation errors
    const mfErrors = errors.filter(error => 
      error.includes('Module Federation') || 
      error.includes('remoteEntry') ||
      error.includes('Cannot find module')
    );
    
    expect(mfErrors.length).toBe(0);
    
    console.log('✅ Module Federation loading test passed');
  });
  
  test('Should demonstrate true Islands Architecture principles', async ({ page }) => {
    await page.goto('http://localhost:3003');
    await page.waitForLoadState('networkidle');
    await page.click('button:has-text("🎯 Simple Counter Island")', { force: true });
    
    // 1. Verify SSR HTML is present immediately
    const ssrHTML = await page.locator('[data-ssr-rendered="true"]').first();
    await expect(ssrHTML).toBeVisible();
    
    // 2. Verify static content is visible before hydration
    const staticButtons = await page.locator('button').all();
    expect(staticButtons.length).toBeGreaterThan(0);
    
    // 3. Verify hydration enhances interactivity
    await page.waitForSelector('text=HYDRATED & INTERACTIVE');
    
    // 4. Verify buttons are now interactive
    const initialCount = await page.locator('[data-island="Counter"] >> text=/^\d+$/').first().textContent();
    await page.click('text=+ Increase');
    const newCount = await page.locator('[data-island="Counter"] >> text=/^\d+$/').first().textContent();
    
    expect(parseInt(newCount)).toBe(parseInt(initialCount) + 1);
    
    console.log('✅ True Islands Architecture principles validated:');
    console.log('  1. Server-rendered HTML delivered first');
    console.log('  2. Progressive enhancement via JavaScript hydration');
    console.log('  3. Interactive functionality post-hydration');
  });
});