import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const thread = (page: Page) => page.getByTestId('chat-thread');

async function axeViolations(page: Page) {
  const results = await new AxeBuilder({ page })
    .include('[data-testid^="chat-"]')
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();
  return results.violations
    .filter((v) => v.impact === 'serious' || v.impact === 'critical')
    .flatMap((v) =>
      v.nodes.map(
        (n) =>
          `${v.id}: ${(n.any[0]?.message ?? '').slice(0, 220)} @ ${n.target.join(' ').slice(-120)}`,
      ),
    );
}

test.describe('Chat', () => {
  test('sends a message and shows the adapter reply', async ({ page }) => {
    await page.goto('/?scenario=chat');
    const input = thread(page).getByRole('textbox', { name: 'Message' });
    await input.fill('Pump 3 status?');
    await input.press('Enter');
    await expect(input).toHaveValue('');
    await expect(thread(page).getByText('Pump 3 status?', { exact: true })).toBeVisible();
    await expect(thread(page).getByText('Echo: Pump 3 status?')).toBeVisible();
  });

  test('a suggestion fills the composer without sending', async ({ page }) => {
    await page.goto('/?scenario=chat');
    const empty = page.getByTestId('chat-empty');
    await empty.getByRole('button', { name: 'Summarise the last shift' }).click();
    await expect(empty.getByRole('textbox', { name: 'Message' })).toHaveValue(
      'Summarise the last shift',
    );
  });

  test('switches conversations from the named conversation list', async ({ page }) => {
    await page.goto('/?scenario=chat');
    const inbox = page.getByTestId('chat-inbox');
    const list = inbox.getByRole('listbox', { name: 'Conversations' });
    await expect(list.getByRole('option', { name: /Operations/ })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    await list.getByRole('option', { name: /Log review/ }).click();
    await expect(list.getByRole('option', { name: /Log review/ })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    await expect(inbox.locator('.MuiChatConversation-title')).toHaveText('Log review');
  });

  test('keyboard focus shows the Tecton focus ring', async ({ page }) => {
    await page.goto('/?scenario=chat&mode=light');
    const input = thread(page).getByRole('textbox', { name: 'Message' });
    await input.fill('Hello');
    await input.focus();
    // From the text area, Tab reaches the attach button, then the (now enabled) send button.
    await page.keyboard.press('Tab');
    const attach = thread(page).locator('.MuiChatComposer-attachButton');
    await expect(attach).toBeFocused();
    const ring = await attach.evaluate((el) => {
      const s = getComputedStyle(el);
      return { color: s.outlineColor, style: s.outlineStyle, width: s.outlineWidth };
    });
    const tectonRing = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--tecton-color-focus-ring'),
    );
    expect(ring.style).toBe('solid');
    expect(ring.width).toBe('2px');
    // #ff00aa is Tecton's light-mode focus-ring token.
    expect(tectonRing.trim().toLowerCase()).toBe('#ff00aa');
    expect(ring.color).toBe('rgb(255, 0, 170)');
    await page.keyboard.press('Tab');
    await expect(thread(page).locator('.MuiChatComposer-sendButton')).toBeFocused();
  });

  test('code uses the Tecton monospace font', async ({ page }) => {
    await page.goto('/?scenario=chat');
    const code = thread(page).locator('.MuiChatCodeBlock-code');
    await expect(code).toBeVisible();
    expect(await code.evaluate((el) => getComputedStyle(el).fontFamily)).toContain('IBM Plex Mono');
  });

  test('every icon is a Tecton glyph', async ({ page }) => {
    await page.goto('/?scenario=chat');
    const parts = page.getByTestId('chat-parts');
    await expect(parts.getByText('Pressure log')).toBeVisible();
    // Scrolled up, the thread shows its scroll-to-bottom button.
    await parts.locator('.MuiChatMessageList-scroller').evaluate((el) => (el.scrollTop = 0));
    await expect(parts.getByRole('button', { name: /scroll to bottom/i })).toBeVisible();
    // The narrow layout's conversation drawer has a close button.
    await page
      .getByTestId('chat-narrow')
      .getByRole('button', { name: 'Open conversations' })
      .click();
    await expect(page.getByRole('dialog')).toBeVisible();
    const icons = await page.evaluate(() =>
      [...document.querySelectorAll('[data-testid^="chat-"] svg')]
        .map((svg) => ({
          shape: (
            svg.firstElementChild?.getAttribute('d') ??
            svg.firstElementChild?.tagName ??
            ''
          ).slice(0, 20),
          tecton: getComputedStyle(svg).maskImage.includes('data:image/svg+xml'),
        }))
        // The streaming spinner is a progress arc, not an icon.
        .filter((icon) => !icon.shape.startsWith('M12 3a9 9')),
    );
    // Send, attach, copy, read receipt, reasoning, tool states, file, source link, scroll to bottom,
    // menu, drawer close, empty state and confirmation warning.
    expect(new Set(icons.map((icon) => icon.shape)).size).toBeGreaterThanOrEqual(15);
    expect(icons.filter((icon) => !icon.tecton)).toEqual([]);
  });

  test('RTL puts own messages on the left', async ({ page }) => {
    await page.goto('/?scenario=chat&dir=rtl');
    const own = thread(page).locator('[data-message-id="m1"] .MuiChatMessage-bubble');
    const other = thread(page).locator('[data-message-id="m2"] .MuiChatMessage-bubble');
    await expect(other).toBeVisible();
    const ownBox = (await own.boundingBox())!;
    const otherBox = (await other.boundingBox())!;
    expect(ownBox.x).toBeLessThan(otherBox.x);
  });

  for (const mode of ['light', 'dark'] as const) {
    test(`every colour is a Tecton token (${mode})`, async ({ page }) => {
      await page.goto(`/?scenario=chat&mode=${mode}`);
      // No transitions: a colour must not be sampled half-way to its final value.
      await page.addStyleTag({
        content: '*, *::before, *::after { transition: none !important; }',
      });
      await expect(thread(page).getByText('Two wells are above')).toBeVisible();
      const compact = page.getByTestId('chat-compact');
      await compact.getByRole('textbox', { name: 'Message' }).fill('Status?');
      await compact.getByRole('textbox', { name: 'Message' }).press('Enter');
      await expect(compact.getByRole('alert')).toBeVisible();
      const offToken = await page.evaluate(() => {
        // Every `--tecton-color-*` value of the current mode, normalized by the browser.
        const probe = document.createElement('div');
        document.body.appendChild(probe);
        const normalize = (value: string) => {
          probe.style.color = '';
          probe.style.color = value;
          return getComputedStyle(probe).color;
        };
        const names = new Set<string>();
        for (const sheet of Array.from(document.styleSheets)) {
          let rules: CSSRuleList;
          try {
            rules = sheet.cssRules;
          } catch {
            continue;
          }
          for (const rule of Array.from(rules)) {
            const style = (rule as CSSStyleRule).style;
            if (!style) continue;
            for (const prop of Array.from(style))
              if (prop.startsWith('--tecton-color')) names.add(prop);
          }
        }
        const root = getComputedStyle(document.documentElement);
        const allowed = new Set(
          [...names].map((name) => normalize(root.getPropertyValue(name).trim())),
        );
        allowed.add('rgba(0, 0, 0, 0)');
        probe.remove();
        const found = new Set<string>();
        for (const el of Array.from(document.querySelectorAll('[data-testid^="chat-"] *'))) {
          const style = getComputedStyle(el);
          const where =
            (el.getAttribute('class') ?? '').match(/Mui[A-Za-z]+-[a-zA-Z]+/)?.[0] ?? el.tagName;
          const colours: [string, string][] = [
            ['color', style.color],
            ['background', style.backgroundColor],
          ];
          if (parseFloat(style.borderTopWidth) > 0 && style.borderTopStyle !== 'none') {
            colours.push(['border', style.borderTopColor]);
          }
          for (const [what, value] of colours) {
            if (!allowed.has(value)) found.add(`${where} ${what} ${value}`);
          }
        }
        return [...found];
      });
      expect(offToken).toEqual([]);
    });

    for (const dir of ['ltr', 'rtl'] as const) {
      test(`axe (${mode}, ${dir})`, async ({ page }) => {
        await page.goto(`/?scenario=chat&mode=${mode}${dir === 'rtl' ? '&dir=rtl' : ''}`);
        await expect(thread(page).getByText('Two wells are above')).toBeVisible();
        // A failed send, so the error card is checked as well.
        const compact = page.getByTestId('chat-compact');
        await compact.getByRole('textbox', { name: 'Message' }).fill('Status?');
        await compact.getByRole('textbox', { name: 'Message' }).press('Enter');
        await expect(compact.getByRole('alert')).toContainText('did not answer');
        expect(await axeViolations(page)).toEqual([]);
      });
    }
  }
});
