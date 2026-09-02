# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: src/__e2e__/public-pages.spec.ts >> Login Flow >> navigates to login page
- Location: src/__e2e__/public-pages.spec.ts:19:7

# Error details

```
Error: page.goto: Protocol error (Page.navigate): Cannot navigate to invalid URL
Call log:
  - navigating to "/login", waiting until "load"

```

# Test source

```ts
  1   | import { test, expect } from "@playwright/test";
  2   | 
  3   | test.describe("TANGLAW Landing Page", () => {
  4   |   test("loads the landing page successfully", async ({ page }) => {
  5   |     await page.goto("/");
  6   |     await expect(page).toHaveTitle(/TANGLAW/);
  7   |     await expect(page.locator("text=TANGLAW").first()).toBeVisible();
  8   |   });
  9   | 
  10  |   test("has navigation links", async ({ page }) => {
  11  |     await page.goto("/");
  12  |     await expect(page.locator("text=Home").first()).toBeVisible();
  13  |     await expect(page.locator("text=About").first()).toBeVisible();
  14  |     await expect(page.locator("text=Contact").first()).toBeVisible();
  15  |   });
  16  | });
  17  | 
  18  | test.describe("Login Flow", () => {
  19  |   test("navigates to login page", async ({ page }) => {
> 20  |     await page.goto("/login");
      |                ^ Error: page.goto: Protocol error (Page.navigate): Cannot navigate to invalid URL
  21  |     await expect(page.locator("text=Welcome back, scholar")).toBeVisible();
  22  |     await expect(page.locator("text=Sign in to your dashboard")).toBeVisible();
  23  |   });
  24  | 
  25  |   test("shows login form fields", async ({ page }) => {
  26  |     await page.goto("/login");
  27  |     await expect(page.locator('input[type="email"]')).toBeVisible();
  28  |     await expect(page.locator('input[type="password"]')).toBeVisible();
  29  |     await expect(page.locator('button[type="submit"]')).toBeVisible();
  30  |   });
  31  | 
  32  |   test("shows error for empty form submission", async ({ page }) => {
  33  |     await page.goto("/login");
  34  |     // Remove HTML5 required attributes so the JS validation runs instead
  35  |     await page.evaluate(() => {
  36  |       document.querySelectorAll('form').forEach(el => el.noValidate = true);
  37  |       document.querySelectorAll('input[required]').forEach(el => el.removeAttribute('required'));
  38  |     });
  39  |     await page.locator('button[type="submit"]').click();
  40  |     await expect(page.locator("text=Please fill out all required fields.")).toBeVisible();
  41  |   });
  42  | 
  43  |   test("shows error for invalid credentials", async ({ page }) => {
  44  |     await page.goto("/login");
  45  |     await page.locator('input[type="email"]').fill("invalid@test.com");
  46  |     await page.locator('input[type="password"]').fill("wrongpassword");
  47  |     await page.locator('button[type="submit"]').click();
  48  |     // Wait for error message — the error appears in a dedicated message container
  49  |     // with ShieldAlert icon and error border styling
  50  |     await expect(page.locator('svg.lucide-shield-alert')).toBeVisible({ timeout: 10000 });
  51  |   });
  52  | });
  53  | 
  54  | test.describe("Signup Flow", () => {
  55  |   test("navigates to signup page from login", async ({ page }) => {
  56  |     await page.goto("/login");
  57  |     await page.locator("text=Create an account").click();
  58  |     await expect(page).toHaveURL(/\/signup/);
  59  |     await expect(page.locator("text=Register as a scholar")).toBeVisible();
  60  |   });
  61  | 
  62  |   test("shows signup form fields", async ({ page }) => {
  63  |     await page.goto("/signup");
  64  |     await expect(page.locator('input[type="text"]')).toBeVisible();
  65  |     await expect(page.locator('input[type="email"]')).toBeVisible();
  66  |     await expect(page.locator('input[type="password"]')).toBeVisible();
  67  |     await expect(page.locator('button[type="submit"]')).toBeVisible();
  68  |   });
  69  | });
  70  | 
  71  | test.describe("About Page", () => {
  72  |   test("loads the about page", async ({ page }) => {
  73  |     await page.goto("/about");
  74  |     await expect(page.locator("text=Redefining scholarship navigation")).toBeVisible();
  75  |   });
  76  | });
  77  | 
  78  | test.describe("Contact Page", () => {
  79  |   test("loads the contact page", async ({ page }) => {
  80  |     await page.goto("/contact");
  81  |     await expect(page.locator("text=PUP Manila")).toBeVisible();
  82  |   });
  83  | });
  84  | 
  85  | test.describe("Mobile Menu", () => {
  86  |   test("opens and closes mobile menu on landing page", async ({ page }) => {
  87  |     await page.setViewportSize({ width: 375, height: 812 });
  88  |     await page.goto("/");
  89  |     
  90  |     // Open menu
  91  |     const menuButton = page.locator('button[aria-label="Open navigation menu"]');
  92  |     await expect(menuButton).toBeVisible();
  93  |     await menuButton.click();
  94  |     
  95  |     // Wait for the mobile dropdown transition to complete (200ms CSS transition)
  96  |     await page.waitForTimeout(300);
  97  |     
  98  |     // Menu should be visible — the mobile dropdown renders Home links AFTER the desktop nav
  99  |     // in the DOM, so .last() picks the visible mobile dropdown link
  100 |     await expect(page.locator("text=Home").last()).toBeVisible();
  101 |     
  102 |     // Close menu — use force:true since the backdrop may intercept pointer events
  103 |     const closeButton = page.locator('button[aria-label="Close navigation menu"]');
  104 |     await closeButton.click({ force: true });
  105 |   });
  106 | 
  107 |   test("mobile menu closes on backdrop click", async ({ page }) => {
  108 |     await page.setViewportSize({ width: 375, height: 812 });
  109 |     await page.goto("/");
  110 |     
  111 |     const menuButton = page.locator('button[aria-label="Open navigation menu"]');
  112 |     await menuButton.click();
  113 |     
  114 |     // Click backdrop
  115 |     const backdrop = page.locator('[aria-hidden="true"]').first();
  116 |     await backdrop.click({ force: true });
  117 |   });
  118 | });
  119 | 
```