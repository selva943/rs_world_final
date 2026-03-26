import { test, expect } from '@playwright/test';

test.describe('Checkout Flow', () => {
  test('should allow a user to add a product to cart and place an order', async ({ page }) => {
    // 1. Visit the homepage
    await page.goto('/');

    // 2. Navigate to Marketplace
    await page.click('text=Shop Fresh Now');

    // 3. Wait for products to load and select the first product
    // We assume there's at least one product with an "Add to Cart" or similar button
    await page.waitForSelector('.grid');
    
    // We look for the first clickable product card and navigate to its detail page
    const firstProduct = page.locator('.grid > div').first();
    await firstProduct.click();

    // 4. On product detail page, click "Add to Cart"
    const addToCartBtn = page.locator('button:has-text("Add to Cart")');
    await addToCartBtn.waitFor({ state: 'visible' });
    await addToCartBtn.click();

    // 5. Verify toast or cart indicator updates
    await expect(page.locator('text=Added to basket')).toBeVisible();

    // 6. Navigate to cart/checkout
    await page.locator('button:has-text("Checkout")').click();

    // 7. Verify we are on the checkout page
    await expect(page).toHaveURL(/.*checkout/);

    // 8. Fill in checkout form details
    await page.fill('input[placeholder="Enter your full name"]', 'Playwright Tester');
    await page.fill('input[placeholder="10-digit mobile number"]', '9999999999');
    await page.fill('textarea[placeholder="Enter your complete delivery address"]', '123 Automated Test Street');

    // 9. Place Order
    // (We might not want to actually place the order in production, so we just verify the button is enabled)
    const placeOrderBtn = page.locator('button:has-text("Place Order")');
    await expect(placeOrderBtn).toBeEnabled();
    
    // Optional: Actually click it if hitting a staging DB
    // await placeOrderBtn.click();
    // await expect(page.locator('text=Order Placed Successfully')).toBeVisible();
  });
});
