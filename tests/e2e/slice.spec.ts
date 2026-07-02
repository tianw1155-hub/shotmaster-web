import { test, expect } from '@playwright/test';

const MOCK_SCORE = {
  overall: 80,
  stars: 2,
  composition: 80,
  lighting: 70,
  color: 75,
  similarity: 60,
  feedback: ['加强构图'],
};

/**
 * Seed localStorage with a guest user that is logged in and has completed onboarding.
 * This bypasses the AuthGuard without needing to interact with the login UI.
 */
async function seedAuth(page: import('@playwright/test').Page) {
  const user = {
    id: 'e2e-guest',
    name: 'E2E游客',
    avatar: '\u{1F4F7}',
    level: 1,
    xp: 0,
    xpToNext: 500,
    streak: 0,
    maxStreak: 0,
    totalStars: 0,
    worksCount: 0,
    averageScore: 0,
    achievements: [],
    completedLevels: [],
    levelStars: {},
    following: [],
    votedWorks: [],
    isLoggedIn: true,
    isGuest: true,
    preferences: ['landscape'],
    hasCompletedOnboarding: true,
    hasSetNickname: true,
    phone: '',
    favoriteImageIds: [],
    imageInteractions: [],
    shootCategories: [],
    shootingPlanFeedbacks: [],
  };
  // Must be on a page from the same origin before accessing localStorage
  await page.goto('/login');
  await page.evaluate((u) => {
    localStorage.setItem('shotmaster_user', JSON.stringify(u));
    localStorage.setItem('shotmaster_current_user_id', u.id);
    localStorage.setItem(`shotmaster_user_${u.id}`, JSON.stringify(u));
  }, user);
}

test.beforeEach(async ({ page }) => {
  // Intercept the Agnes AI API call (used by aiService.compareImages)
  await page.route('**/apihub.agnes-ai.com/**', (route) => {
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        choices: [{ message: { content: JSON.stringify(MOCK_SCORE) } }],
      }),
    });
  });
  // Also intercept any local /api/* calls as a safety net
  await page.route('**/api/**', (route) => {
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(MOCK_SCORE),
    });
  });
});

test('north-star slice: map -> level -> exposure lesson -> shoot -> score', async ({ page }) => {
  // 1. Seed auth and navigate to level map
  await seedAuth(page);
  await page.goto('/');
  await page.waitForURL(/\//);
  await expect(page.getByText('摄影之路')).toBeVisible({ timeout: 10000 });

  // 2. Click the first available level (level 1)
  const firstLevel = page.locator('[id="map-node-1"]');
  await expect(firstLevel).toBeVisible({ timeout: 5000 });
  await firstLevel.click();

  // 3. Wait for level detail page to load
  await page.waitForURL(/\/level\/1/, { timeout: 10000 });
  // Wait for the AI shooting plan to finish generating
  // (the action buttons appear only after the plan is ready)
  const exposureBtn = page.getByRole('button', { name: /练习曝光/ });
  await expect(exposureBtn).toBeVisible({ timeout: 15000 });

  // 4. Enter the exposure lesson
  await exposureBtn.click();

  // 5. Wait for the lesson to render — look for the "完成练习" button
  const completeBtn = page.getByRole('button', { name: /完成练习/ });
  await expect(completeBtn).toBeVisible({ timeout: 10000 });

  // 6. Move the slider toward the target (+0.7 EV). Default is 0,
  //    step 0.05, so 14 steps reaches 0.70.
  //    Use page.keyboard on the slider-focused element.
  const slider = page.getByRole('slider');
  await slider.focus();
  for (let i = 0; i < 14; i++) {
    await page.keyboard.press('ArrowRight');
    // Small delay for Radix state updates
    await page.waitForTimeout(50);
  }

  // 7. Try to click "完成练习" — it may be disabled if slider didn't hit target
  const isEnabled = await completeBtn.isEnabled().catch(() => false);
  if (isEnabled) {
    await completeBtn.click();
  } else {
    // Try a few more ArrowRight steps
    for (let i = 0; i < 6; i++) {
      await page.keyboard.press('ArrowRight');
      await page.waitForTimeout(50);
    }
    await completeBtn.click({ force: true }).catch(() => {});
  }

  // 8. Back on level detail, click "上传作品" to enter Shoot in upload mode
  const uploadBtn = page.getByRole('button', { name: /上传作品/ });
  await expect(uploadBtn).toBeVisible({ timeout: 10000 });
  await uploadBtn.click();

  // 9. Should be on the shoot page (upload mode)
  await expect(page).toHaveURL(/\/shoot\/1/, { timeout: 10000 });

  // 10. Upload a tiny 1x1 PNG image
  const tinyPng = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    'base64',
  );
  await page.locator('input[type="file"]').setInputFiles({
    name: 'test.png',
    mimeType: 'image/png',
    buffer: tinyPng,
  });

  // 11. After upload, the app navigates to /score/1
  await page.waitForURL(/\/score\/1/, { timeout: 15000 });

  // 12. Assert the score result page renders
  // The score page may show a loading state while AI scores, then the result.
  // Wait for the scoring result to appear (either "总分" or the score headline).
  // The mock AI returns immediately, so this should be fast.
  await expect(page.getByText(/总分/)).toBeVisible({ timeout: 15000 });
});