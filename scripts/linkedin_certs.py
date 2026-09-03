import asyncio
from playwright.async_api import async_playwright

EMAIL = 'anujmhatre207@gmail.com'
PASSWORD = 'Anuj#32-31=1'

CERTS = [
    ('Python for Data Science', 'IBM', '2026'),
    ('Data Visualization with Python', 'IBM', '2026'),
    ('Claude AI Certification', 'Anthropic', '2026'),
    ('Claude Code 101', 'Anthropic', '2026'),
    ('Claude Platform 101', 'Anthropic', '2026'),
    ('Claude Cowork Certification', 'Anthropic', '2026'),
    ('Building With Claude API', 'Anthropic', '2026'),
    ('Claude AI Fluency: Frameworks & Foundations', 'Anthropic', '2026'),
    ('Claude Code in Action', 'Anthropic', '2026'),
    ('Model Context Protocol (MCP) Introduction', 'Anthropic', '2026'),
    ('Model Context Protocol (MCP) Advanced Topics', 'Anthropic', '2026'),
    ('AI Fluency for Students', 'Anthropic', '2026'),
    ('AI Fluency for Educators', 'Anthropic', '2026'),
    ('Craft Precise Prompts for AI Models', 'IBM', '2026'),
    ('Data Science Foundations Level 1', 'IBM', '2026'),
    ('Data Science 101', 'IBM', '2026'),
    ('Generative AI Essentials: Using LLMs to Work with Data', 'IBM', '2026'),
    ('Introduction to Generative AI', 'IBM', '2026'),
    ('Introduction to Large Language Models', 'IBM', '2026'),
    ('Summarizing Data Using IBM Granite Module', 'IBM', '2026'),
    ('Classifying Data Using IBM Granite Module', 'IBM', '2026'),
]

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        page = await browser.new_page(viewport={'width': 1280, 'height': 800})

        print('Step 1: Going to LinkedIn login...')
        await page.goto('https://www.linkedin.com/login')
        await page.wait_for_timeout(4000)

        # Use keyboard to type - this works with React/LinkedIn forms
        print('Step 2: Tab to email field and type...')
        await page.keyboard.press('Tab')
        await page.wait_for_timeout(300)
        await page.keyboard.type(EMAIL, delay=25)

        print('Step 3: Tab to password field and type...')
        await page.keyboard.press('Tab')
        await page.wait_for_timeout(300)
        await page.keyboard.type(PASSWORD, delay=25)

        await page.wait_for_timeout(500)
        await page.screenshot(path='C:/Users/ADMIN/anuj/li_kbd_filled.png')
        print('Form filled, screenshot saved')

        print('Step 4: Press Enter to sign in...')
        await page.keyboard.press('Enter')
        await page.wait_for_timeout(10000)
        await page.screenshot(path='C:/Users/ADMIN/anuj/li_kbd_after.png')
        print(f'URL after sign in: {page.url}')

        # Handle 2FA
        if 'checkpoint' in page.url or 'challenge' in page.url:
            print('\n*** 2FA Required ***')
            print('Complete in browser, then press Enter here...')
            input()
            await page.wait_for_timeout(5000)

        # Check login
        await page.goto('https://www.linkedin.com/feed/')
        await page.wait_for_timeout(5000)
        print(f'Feed URL: {page.url}')
        await page.screenshot(path='C:/Users/ADMIN/anuj/li_kbd_feed.png')

        if 'login' in page.url:
            print('LOGIN FAILED. Check the screenshots.')
            await browser.close()
            return

        print('\n=== LOGGED IN! Adding certifications... ===\n')

        added = 0
        for name, issuer, year in CERTS:
            try:
                print(f'[{added+1}/{len(CERTS)}] {name}')
                await page.goto('https://www.linkedin.com/in/anuj-mhatre-031807ma/edit/forms/credential-licenses-certifications/new/')
                await page.wait_for_timeout(4000)

                # Check what page we're on
                if 'login' in page.url:
                    print('  Redirected to login! Session expired.')
                    break

                # Find visible inputs
                visible_inputs = await page.evaluate('''() => {
                    const els = document.querySelectorAll('input, select');
                    const result = [];
                    els.forEach((el, i) => {
                        const rect = el.getBoundingClientRect();
                        if (rect.width > 0 && rect.height > 0) {
                            result.push({
                                tag: el.tagName,
                                type: el.type,
                                name: el.name,
                                id: el.id,
                                idx: i
                            });
                        }
                    });
                    return result;
                }''')
                print(f'  Elements: {len(visible_inputs)}')
                for el in visible_inputs:
                    print(f'    {el}')

                # Click first text input and fill name
                text_inputs = [el for el in visible_inputs if el['tag'] == 'INPUT' and el['type'] in ('text', '')]
                if text_inputs:
                    idx = text_inputs[0]['idx']
                    await page.evaluate(f'''() => {{
                        const els = document.querySelectorAll('input, select');
                        els[{idx}].click();
                        els[{idx}].focus();
                    }}''')
                    await page.wait_for_timeout(200)
                    # Clear and type
                    await page.keyboard.type(name, delay=15)
                    print(f'  Typed name')
                    await page.wait_for_timeout(500)

                    # Tab to issuer
                    await page.keyboard.press('Tab')
                    await page.wait_for_timeout(500)
                    await page.keyboard.type(issuer, delay=15)
                    print(f'  Typed issuer')
                    await page.wait_for_timeout(1500)

                    # Click suggestion
                    try:
                        await page.click('[role="option"]', timeout=3000)
                        print('  Clicked suggestion')
                    except:
                        pass

                    # Set date selects
                    selects = [el for el in visible_inputs if el['tag'] == 'SELECT']
                    if len(selects) >= 2:
                        try:
                            await page.select_option(f'select >> nth=0', '1')
                            await page.select_option(f'select >> nth=1', year)
                            print(f'  Set date: Jan {year}')
                        except Exception as e:
                            print(f'  Date select error: {e}')

                    await page.wait_for_timeout(500)
                    await page.screenshot(path=f'C:/Users/ADMIN/anuj/li_cert_{added}.png')

                    # Click Save
                    saved = await page.evaluate('''() => {
                        const btns = document.querySelectorAll('button');
                        for (const b of btns) {
                            if (b.textContent.trim() === 'Save' && b.getBoundingClientRect().width > 0) {
                                b.click();
                                return true;
                            }
                        }
                        return false;
                    }''')

                    if saved:
                        await page.wait_for_timeout(3000)
                        added += 1
                        print(f'  SAVED!')
                    else:
                        print('  No save button found')
                else:
                    print('  No text inputs found')
                    await page.screenshot(path=f'C:/Users/ADMIN/anuj/li_cert_debug_{added}.png')

            except Exception as e:
                print(f'  ERROR: {e}')

        print(f'\n=== DONE === Added {added}/{len(CERTS)} certifications')
        print('Browser stays open for 30s...')
        await page.wait_for_timeout(30000)
        await browser.close()

asyncio.run(main())
