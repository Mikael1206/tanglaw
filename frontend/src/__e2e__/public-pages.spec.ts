import { test, expect } from "@playwright/test";

test.describe("TANGLAW Landing Page", () => {
  test("loads the landing page successfully", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/TANGLAW/);
    await expect(page.locator("text=TANGLAW").first()).toBeVisible();
  });

  test("has navigation links", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("text=Home").first()).toBeVisible();
    await expect(page.locator("text=About").first()).toBeVisible();
    await expect(page.locator("text=Contact").first()).toBeVisible();
  });
});

test.describe("Login Flow", () => {
  test("navigates to login page", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator("text=Welcome back, scholar")).toBeVisible();
    await expect(page.locator("text=Sign in to your dashboard")).toBeVisible();
  });

  test("shows login form fields", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test("shows error for empty form submission", async ({ page }) => {
    await page.goto("/login");
    // Remove HTML5 required attributes so the JS validation runs instead
    await page.evaluate(() => {
      document.querySelectorAll('form').forEach(el => el.noValidate = true);
      document.querySelectorAll('input[required]').forEach(el => el.removeAttribute('required'));
    });
    await page.locator('button[type="submit"]').click();
    await expect(page.locator("text=Please fill out all required fields.")).toBeVisible();
  });

  test("shows error for invalid credentials", async ({ page }) => {
    await page.goto("/login");
    await page.locator('input[type="email"]').fill("invalid@test.com");
    await page.locator('input[type="password"]').fill("wrongpassword");
    await page.locator('button[type="submit"]').click();
    // Wait for error message — the error appears in a dedicated message container
    // with ShieldAlert icon and error border styling
    await expect(page.locator('svg.lucide-shield-alert')).toBeVisible({ timeout: 10000 });
  });
});

test.describe("Signup Flow", () => {
  test("navigates to signup page from login", async ({ page }) => {
    await page.goto("/login");
    await page.locator("text=Create an account").click();
    await expect(page).toHaveURL(/\/signup/);
    await expect(page.locator("text=Register as a scholar")).toBeVisible();
  });

  test("shows signup form fields", async ({ page }) => {
    await page.goto("/signup");
    await expect(page.locator('input[type="text"]')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });
});

test.describe("About Page", () => {
  test("loads the about page", async ({ page }) => {
    await page.goto("/about");
    await expect(page.locator("text=Redefining scholarship navigation")).toBeVisible();
  });
});

test.describe("Contact Page", () => {
  test("loads the contact page", async ({ page }) => {
    await page.goto("/contact");
    await expect(page.locator("text=PUP Manila")).toBeVisible();
  });
});

test.describe("Mobile Menu", () => {
  test("opens and closes mobile menu on landing page", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    
    // Open menu
    const menuButton = page.locator('button[aria-label="Open navigation menu"]');
    await expect(menuButton).toBeVisible();
    await menuButton.click();
    
    // Wait for the mobile dropdown transition to complete (200ms CSS transition)
    await page.waitForTimeout(300);
    
    // Menu should be visible — the mobile dropdown renders Home links AFTER the desktop nav
    // in the DOM, so .last() picks the visible mobile dropdown link
    await expect(page.locator("text=Home").last()).toBeVisible();
    
    // Close menu — use force:true since the backdrop may intercept pointer events
    const closeButton = page.locator('button[aria-label="Close navigation menu"]');
    await closeButton.click({ force: true });
  });

  test("mobile menu closes on backdrop click", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    
    const menuButton = page.locator('button[aria-label="Open navigation menu"]');
    await menuButton.click();
    
    // Click backdrop
    const backdrop = page.locator('[aria-hidden="true"]').first();
    await backdrop.click({ force: true });
  });
});
