# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: verify-particles.spec.ts >> tsParticles background is visible and interactive
- Location: src/__e2e__/verify-particles.spec.ts:22:5

# Error details

```
TimeoutError: locator.waitFor: Timeout 20000ms exceeded.
Call log:
  - waiting for locator('#tanglaw-particles') to be visible

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - banner [ref=e2]:
    - navigation [ref=e4]:
      - link "Go to home" [ref=e5] [cursor=pointer]:
        - /url: /
        - img "Owel Logo" [ref=e7]
        - generic [ref=e8]: TANGLAW
        - generic [ref=e9]: Beta
      - navigation "Main Navigation" [ref=e12]:
        - list [ref=e13]:
          - listitem [ref=e14] [cursor=pointer]:
            - link "Home" [ref=e15]:
              - /url: /
          - listitem [ref=e16] [cursor=pointer]:
            - link "About" [ref=e17]:
              - /url: /about
          - listitem [ref=e18] [cursor=pointer]:
            - link "Contact" [ref=e19]:
              - /url: /contact
          - listitem [ref=e20] [cursor=pointer]:
            - link "Log In" [ref=e21]:
              - /url: /login
      - link "Sign Up" [ref=e22] [cursor=pointer]:
        - /url: /signup
      - button "Switch to dark theme" [ref=e24]
  - main [ref=e27]:
    - main [ref=e29]:
      - generic [ref=e31]:
        - generic [ref=e32]:
          - generic [ref=e33]: TANGLAW · SCHOLARSHIP COMPASS
          - generic [ref=e34]:
            - heading "TANGLAW" [level=1] [ref=e35]
            - paragraph [ref=e36]: Scholarship access with the clarity of a guiding light.
            - generic [ref=e37]: Built specifically for tertiary students, TANGLAW unifies granular scholarship directories, natural language verification, and mock screening tools into a unified portal—streamlining localized financial aid navigation and closing information gaps across higher education.
          - generic [ref=e38]:
            - button "Begin your journey" [ref=e39] [cursor=pointer]
            - button "Explore the roadmap" [ref=e40] [cursor=pointer]
          - generic [ref=e41]:
            - generic [ref=e42]: Scholarship Finder
            - generic [ref=e43]: AI Navigator
            - generic [ref=e44]: Readiness Check
        - generic [ref=e50]:
          - img "Owel Mascot"
      - generic [ref=e52]:
        - article [ref=e54]:
          - generic [ref=e57]:
            - paragraph [ref=e58]: Scholarship Discovery
            - paragraph [ref=e59]: Browse grant opportunities, filter by academic standing, location, and program requirements.
        - article [ref=e61]:
          - generic [ref=e64]:
            - paragraph [ref=e65]: AI Guidance
            - paragraph [ref=e66]: Get contextual answers from Owel, the intelligent companion built to simplify requirements and eligibility.
        - article [ref=e68]:
          - generic [ref=e71]:
            - paragraph [ref=e72]: Exam Readiness
            - paragraph [ref=e73]: Track your preparation with interactive mock drills and analytics designed for scholarship performance.
  - contentinfo [ref=e74]:
    - generic [ref=e75]:
      - generic [ref=e76]:
        - paragraph [ref=e77]: TANGLAW RESEARCH PROJECT © 2026
        - paragraph [ref=e78]: Science, Technology, and Society (BSCS 1-2)
      - generic [ref=e79]:
        - link "The Minds Behind Us" [ref=e80] [cursor=pointer]:
          - /url: /about
        - generic [ref=e81]: "|"
        - link "PUP Manila" [ref=e82] [cursor=pointer]:
          - /url: https://pup.edu.ph
  - button "Open Next.js Dev Tools" [ref=e88] [cursor=pointer]
  - alert [ref=e92]
  - complementary [ref=e93]:
    - generic [ref=e94]:
      - list [ref=e95]:
        - listitem [ref=e96]:
          - link [ref=e97] [cursor=pointer]:
            - /url: /
            - generic [ref=e98]: Home
        - listitem [ref=e99]:
          - link [ref=e100] [cursor=pointer]:
            - /url: /about
            - generic [ref=e101]: About
        - listitem [ref=e102]:
          - link [ref=e103] [cursor=pointer]:
            - /url: /contact
            - generic [ref=e104]: Contact
        - listitem [ref=e105]:
          - link [ref=e106] [cursor=pointer]:
            - /url: /login
            - generic [ref=e107]: Log In
        - listitem [ref=e108]:
          - link [ref=e109] [cursor=pointer]:
            - /url: /signup
            - generic [ref=e110]: Sign Up
      - generic [ref=e111]:
        - heading [level=3] [ref=e112]: Socials
        - list [ref=e113]:
          - listitem [ref=e114]:
            - link [ref=e115] [cursor=pointer]:
              - /url: https://pup.edu.ph
              - text: PUP Manila
          - listitem [ref=e116]:
            - link [ref=e117] [cursor=pointer]:
              - /url: /about
              - text: About Us
```

# Test source

```ts
  1   | import { test, expect } from "@playwright/test";
  2   | 
  3   | import type { Page, ConsoleMessage } from "@playwright/test";
  4   | 
  5   | function collectConsoleErrors(page: Page): string[] {
  6   |   const consoleErrors: string[] = [];
  7   |   page.on("console", (msg: ConsoleMessage) => {
  8   |     if (msg.type() === "error") consoleErrors.push(msg.text());
  9   |   });
  10  |   page.on("pageerror", (err: Error) => consoleErrors.push(err.message));
  11  |   return consoleErrors;
  12  | }
  13  | 
  14  | function assertNoTsParticlesErrors(consoleErrors: string[]) {
  15  |   const tsParticlesErrors = consoleErrors.filter(e =>
  16  |     e.toLowerCase().includes("tsparticles") ||
  17  |     e.toLowerCase().includes("particlesprovider")
  18  |   );
  19  |   expect(tsParticlesErrors).toEqual([]);
  20  | }
  21  | 
  22  | test("tsParticles background is visible and interactive", async ({ page }) => {
  23  |   const consoleErrors = collectConsoleErrors(page);
  24  | 
  25  |   // Enable test mode to bypass performance guards (idle timer, IntersectionObserver)
  26  |   await page.addInitScript(() => {
  27  |     (window as any).__TEST_MODE__ = true;
  28  |   });
  29  | 
  30  |   await page.goto("/", { waitUntil: "networkidle", timeout: 30000 });
  31  |   await page.waitForTimeout(3000); // allow particles to initialize
  32  | 
  33  |   // Wait for the particles canvas to be created (ParticlesProvider is async)
  34  |   const container = page.locator("#tanglaw-particles");
> 35  |   await container.waitFor({ state: "visible", timeout: 20000 });
      |                   ^ TimeoutError: locator.waitFor: Timeout 20000ms exceeded.
  36  | 
  37  |   // Check that canvas was created inside the div
  38  |   const canvas = page.locator("#tanglaw-particles canvas");
  39  |   await expect(canvas).toBeVisible();
  40  | 
  41  |   // Test hover interactivity (mouse move should not error)
  42  |   await page.mouse.move(400, 300);
  43  |   await page.waitForTimeout(500);
  44  | 
  45  |   // Test click interactivity
  46  |   await page.mouse.click(400, 300);
  47  |   await page.waitForTimeout(500);
  48  | 
  49  |   // Take screenshot for visual inspection (not a baseline comparison)
  50  |   await page.screenshot({ path: "/tmp/particles-screenshot.png", fullPage: true });
  51  | 
  52  |   assertNoTsParticlesErrors(consoleErrors);
  53  | });
  54  | 
  55  | test.describe("visual regression", () => {
  56  |   test.setTimeout(60000);
  57  | 
  58  |   test("tsParticles background switches correctly between light and dark themes", async ({ page }) => {
  59  |     const consoleErrors = collectConsoleErrors(page);
  60  | 
  61  |     // Enable test mode to bypass performance guards (idle timer, IntersectionObserver)
  62  |     await page.addInitScript(() => {
  63  |       (window as any).__TEST_MODE__ = true;
  64  |     });
  65  | 
  66  |     await page.goto("/", { waitUntil: "networkidle", timeout: 30000 });
  67  |     await page.waitForTimeout(3000); // allow particles to initialize
  68  | 
  69  |     // Verify particles are visible in light mode (default)
  70  |     const container = page.locator("#tanglaw-particles");
  71  |     await expect(container).toBeVisible({ timeout: 15000 });
  72  |     const canvas = page.locator("#tanglaw-particles canvas");
  73  |     await expect(canvas).toBeVisible();
  74  | 
  75  |     // Verify initial theme is light
  76  |     const html = page.locator("html");
  77  |     await expect(html).toHaveAttribute("class", /light/);
  78  | 
  79  |     // Take light mode screenshot and compare to baseline
  80  |     // Mask the particle canvas so random positions don't cause false positives
  81  |     await expect(page).toHaveScreenshot("particles-light.png", {
  82  |       fullPage: true,
  83  |       mask: [page.locator("#tanglaw-particles")],
  84  |       maxDiffPixels: 100,
  85  |       threshold: 0.05,
  86  |       timeout: 30000,
  87  |     });
  88  | 
  89  |     // Click the theme toggle button to switch to dark mode
  90  |     const themeToggle = page.locator("button[aria-label='Switch to dark theme']");
  91  |     await expect(themeToggle).toBeVisible();
  92  |     await themeToggle.click();
  93  | 
  94  |     // Wait for the theme to transition and particles to re-render
  95  |     await page.waitForTimeout(2000);
  96  | 
  97  |     // Verify the html class now contains 'dark'
  98  |     await expect(html).toHaveAttribute("class", /dark/);
  99  | 
  100 |     // Verify particles are still visible in dark mode
  101 |     await expect(container).toBeVisible();
  102 |     await expect(canvas).toBeVisible();
  103 | 
  104 |     // Take dark mode screenshot and compare to baseline
  105 |     await expect(page).toHaveScreenshot("particles-dark.png", {
  106 |       fullPage: true,
  107 |       mask: [page.locator("#tanglaw-particles")],
  108 |       maxDiffPixels: 100,
  109 |       threshold: 0.05,
  110 |       timeout: 30000,
  111 |     });
  112 | 
  113 |     // Toggle back to light mode
  114 |     await page.locator("button[aria-label='Switch to light theme']").click();
  115 |     await page.waitForTimeout(1000);
  116 |     await expect(html).toHaveAttribute("class", /light/);
  117 |     await expect(container).toBeVisible();
  118 | 
  119 |     assertNoTsParticlesErrors(consoleErrors);
  120 |   });
  121 | });
  122 | 
```