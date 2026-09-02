import { test, expect } from "@playwright/test";

import type { Page, ConsoleMessage } from "@playwright/test";

function collectConsoleErrors(page: Page): string[] {
  const consoleErrors: string[] = [];
  page.on("console", (msg: ConsoleMessage) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });
  page.on("pageerror", (err: Error) => consoleErrors.push(err.message));
  return consoleErrors;
}

function assertNoTsParticlesErrors(consoleErrors: string[]) {
  const tsParticlesErrors = consoleErrors.filter(e =>
    e.toLowerCase().includes("tsparticles") ||
    e.toLowerCase().includes("particlesprovider")
  );
  expect(tsParticlesErrors).toEqual([]);
}

test("tsParticles background is visible and interactive", async ({ page }) => {
  const consoleErrors = collectConsoleErrors(page);

  // Enable test mode to bypass performance guards (idle timer, IntersectionObserver)
  await page.addInitScript(() => {
    (window as any).__TEST_MODE__ = true;
  });

  await page.goto("/", { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(3000); // allow particles to initialize

  // Wait for the particles canvas to be created (ParticlesProvider is async)
  const container = page.locator("#tanglaw-particles");
  await container.waitFor({ state: "visible", timeout: 20000 });

  // Check that canvas was created inside the div
  const canvas = page.locator("#tanglaw-particles canvas");
  await expect(canvas).toBeVisible();

  // Test hover interactivity (mouse move should not error)
  await page.mouse.move(400, 300);
  await page.waitForTimeout(500);

  // Test click interactivity
  await page.mouse.click(400, 300);
  await page.waitForTimeout(500);

  // Take screenshot for visual inspection (not a baseline comparison)
  await page.screenshot({ path: "/tmp/particles-screenshot.png", fullPage: true });

  assertNoTsParticlesErrors(consoleErrors);
});

test.describe("visual regression", () => {
  test.setTimeout(60000);

  test("tsParticles background switches correctly between light and dark themes", async ({ page }) => {
    const consoleErrors = collectConsoleErrors(page);

    // Enable test mode to bypass performance guards (idle timer, IntersectionObserver)
    await page.addInitScript(() => {
      (window as any).__TEST_MODE__ = true;
    });

    await page.goto("/", { waitUntil: "networkidle", timeout: 30000 });
    await page.waitForTimeout(3000); // allow particles to initialize

    // Verify particles are visible in light mode (default)
    const container = page.locator("#tanglaw-particles");
    await expect(container).toBeVisible({ timeout: 15000 });
    const canvas = page.locator("#tanglaw-particles canvas");
    await expect(canvas).toBeVisible();

    // Verify initial theme is light
    const html = page.locator("html");
    await expect(html).toHaveAttribute("class", /light/);

    // Take light mode screenshot and compare to baseline
    // Mask the particle canvas so random positions don't cause false positives
    await expect(page).toHaveScreenshot("particles-light.png", {
      fullPage: true,
      mask: [page.locator("#tanglaw-particles")],
      maxDiffPixels: 100,
      threshold: 0.05,
      timeout: 30000,
    });

    // Click the theme toggle button to switch to dark mode
    const themeToggle = page.locator("button[aria-label='Switch to dark theme']");
    await expect(themeToggle).toBeVisible();
    await themeToggle.click();

    // Wait for the theme to transition and particles to re-render
    await page.waitForTimeout(2000);

    // Verify the html class now contains 'dark'
    await expect(html).toHaveAttribute("class", /dark/);

    // Verify particles are still visible in dark mode
    await expect(container).toBeVisible();
    await expect(canvas).toBeVisible();

    // Take dark mode screenshot and compare to baseline
    await expect(page).toHaveScreenshot("particles-dark.png", {
      fullPage: true,
      mask: [page.locator("#tanglaw-particles")],
      maxDiffPixels: 100,
      threshold: 0.05,
      timeout: 30000,
    });

    // Toggle back to light mode
    await page.locator("button[aria-label='Switch to light theme']").click();
    await page.waitForTimeout(1000);
    await expect(html).toHaveAttribute("class", /light/);
    await expect(container).toBeVisible();

    assertNoTsParticlesErrors(consoleErrors);
  });
});
