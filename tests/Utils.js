// utils.js
// Shared helpers used across the Mannai NVS Playwright specs.
//
// These are the Playwright equivalents of the small reusable methods that
// appeared in every one of the original Selenium/Java classes
// (waitForProcessingToClear, safeClick, XCOuniqueConstrain.generateXCO).

/**
 * Waits for the APEX ".u-Processing" spinner (if present) to disappear.
 * Safe to call even when it's not present - mirrors the try/catch-and-ignore
 * behaviour of the Java version.
 */
async function waitForProcessingToClear(page, timeout = 5000) {
  try {
    await page.locator('.u-Processing').first().waitFor({ state: 'hidden', timeout });
  } catch (e) {
    // no spinner present (or it never appeared) - nothing to wait for
  }
}

/**
 * Clicks a locator, scrolling it into view first and retrying with a forced
 * click if the element is intercepted, not yet interactable, or the DOM
 * re-renders underneath us (the Playwright analogue of the Java safeClick
 * helper, which retried with a JS click and re-fetched the element fresh on
 * every attempt).
 *
 * `locatorOrSelector` can be either a raw selector string (CSS or
 * "xpath=...") or an already-built Locator (including one scoped inside a
 * frameLocator), so the same helper works both on the main page and inside
 * iframes.
 */
async function safeClick(page, locatorOrSelector, options = {}) {
  const { attempts: maxAttempts = 3, timeout = 15000 } = options;
  const locator =
    typeof locatorOrSelector === 'string' ? page.locator(locatorOrSelector) : locatorOrSelector;

  let lastError;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const target = locator.first();
      await target.waitFor({ state: 'visible', timeout });
      await target.scrollIntoViewIfNeeded();
      try {
        await target.click({ timeout });
      } catch (clickError) {
        // Element click intercepted / not interactable -> force it, the
        // equivalent of the JS-click fallback in the Java version.
        await target.click({ force: true, timeout });
      }
      return;
    } catch (err) {
      lastError = err;
      console.log(
        `safeClick attempt ${attempt} failed for ${locatorOrSelector} (${
          String(err).split('\n')[0]
        }). Retrying...`
      );
      await page.waitForTimeout(500);
    }
  }
  throw new Error(`safeClick failed after ${maxAttempts} attempts for ${locatorOrSelector}: ${lastError}`);
}

// Note: generateXCO() now lives in its own module, xcoUniqueConstrain.js,
// mirroring the standalone MT.MannaiTrading.XCOuniqueConstrain class in the
// Java project rather than being folded in here.

module.exports = { waitForProcessingToClear, safeClick };