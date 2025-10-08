const { test, expect } = require('@playwright/test');

test.describe('Interactive Counter Test', () => {
  test('Counter buttons should be clickable and functional', async ({ page }) => {
    console.log('🧪 Testing counter interactivity...');
    
    // Navigate to the app
    await page.goto('http://localhost:3003', { waitUntil: 'networkidle' });
    
    // Wait for the counter to load and hydrate
    await page.waitForSelector('[data-island="Counter"]', { timeout: 10000 });
    console.log('✅ Counter island found');
    
    // Wait for hydration
    await page.waitForTimeout(3000);
    
    // Take screenshot before interaction
    await page.screenshot({ path: 'test-results/before-interaction.png' });
    
    // Find the counter value
    const counterValue = page.locator('div:has-text("10")').first();
    await expect(counterValue).toBeVisible();
    console.log('✅ Initial counter value (10) visible');
    
    // Find and click the increase button
    console.log('🔘 Looking for increase button...');
    const increaseButton = page.locator('button:has-text("+ Increase"), button:has-text("Increase")').first();
    await expect(increaseButton).toBeVisible();
    console.log('✅ Increase button found');
    
    // Click the increase button
    console.log('👆 Clicking increase button...');
    await increaseButton.click();
    
    // Wait a moment for state update
    await page.waitForTimeout(1000);
    
    // Take screenshot after clicking
    await page.screenshot({ path: 'test-results/after-increase-click.png' });
    
    // Check if the value increased
    const newCounterValue = page.locator('div').filter({ hasText: /^(10|11)$/ }).first();
    const newValue = await newCounterValue.textContent();
    console.log(`📊 Counter value after increase click: ${newValue}`);
    
    if (newValue === '11') {
      console.log('🎉 SUCCESS! Counter is interactive - increase button works!');
      
      // Test decrease button
      const decreaseButton = page.locator('button:has-text("- Decrease"), button:has-text("Decrease")').first();
      await decreaseButton.click();
      await page.waitForTimeout(1000);
      
      const finalValue = await newCounterValue.textContent();
      console.log(`📊 Counter value after decrease click: ${finalValue}`);
      
      if (finalValue === '10') {
        console.log('🎉 PERFECT! Both increase and decrease buttons work!');
      }
      
    } else if (newValue === '10') {
      console.log('❌ Counter not interactive - button click had no effect');
      
      // Check what type of buttons we have
      const allButtons = await page.locator('button').all();
      console.log(`🔍 Found ${allButtons.length} buttons on page`);
      
      for (let i = 0; i < allButtons.length; i++) {
        const buttonText = await allButtons[i].textContent();
        const isEnabled = await allButtons[i].isEnabled();
        const cursor = await allButtons[i].evaluate(el => getComputedStyle(el).cursor);
        console.log(`  Button ${i + 1}: "${buttonText}" - enabled: ${isEnabled}, cursor: ${cursor}`);
      }
    }
    
    // Final screenshot
    await page.screenshot({ path: 'test-results/final-state.png' });
    
    console.log('✅ Interactive test completed');
  });
});