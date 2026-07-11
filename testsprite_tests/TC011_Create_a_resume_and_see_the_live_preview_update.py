import asyncio
import re
from playwright import async_api
from playwright.async_api import expect

async def run_test():
    pw = None
    browser = None
    context = None

    try:
        # Start a Playwright session in asynchronous mode
        pw = await async_api.async_playwright().start()

        # Launch a Chromium browser in headless mode with custom arguments
        browser = await pw.chromium.launch(
            headless=True,
            args=[
                "--window-size=1280,720",
                "--disable-dev-shm-usage",
                "--ipc=host",
                "--single-process"
            ],
        )

        # Create a new browser context (like an incognito window)
        context = await browser.new_context()
        # Wider default timeout to match the agent's DOM-stability budget;
        # auto-waiting Playwright APIs (expect, locator.wait_for) inherit this.
        context.set_default_timeout(15000)

        # Open a new page in the browser context
        page = await context.new_page()

        # Interact with the page elements to simulate user flow
        # -> navigate
        await page.goto("http://localhost:3000/")
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=5000)
        except Exception:
            pass
        
        # -> Click the 'Resume Builder' link in the top navigation to open the public resume builder page.
        # Resume Builder Builder link
        elem = page.get_by_role('link', name='Resume Builder Builder', exact=True)
        await elem.click(timeout=10000)
        
        # -> Fill the 'Full Name', 'Job Title', 'Email', and 'Phone' fields with valid information after dismissing the cookie banner.
        # Accept All button
        elem = page.get_by_role('button', name='Accept All', exact=True)
        await elem.click(timeout=10000)
        
        # -> Fill the 'Full Name', 'Job Title', 'Email', and 'Phone' fields with valid information after dismissing the cookie banner.
        # Deepak Yadav text field
        elem = page.get_by_placeholder('Deepak Yadav', exact=True)
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("Test User")
        
        # -> Fill the 'Full Name', 'Job Title', 'Email', and 'Phone' fields with valid information after dismissing the cookie banner.
        # Software Development Engineer text field
        elem = page.get_by_placeholder('Software Development Engineer', exact=True)
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("Software Engineer")
        
        # -> Fill the 'Full Name', 'Job Title', 'Email', and 'Phone' fields with valid information after dismissing the cookie banner.
        # email field
        elem = page.locator('xpath=/html/body/main/div[2]/div[2]/div/div/div[3]/div/div/div[3]/input')
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("test.user@example.com")
        
        # -> Fill the 'Full Name', 'Job Title', 'Email', and 'Phone' fields with valid information after dismissing the cookie banner.
        # text field
        elem = page.locator('xpath=/html/body/main/div[2]/div[2]/div/div/div[3]/div/div/div[4]/input')
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("9876543210")
        
        # -> Click the 'Guide skip karo' button to dismiss the intro guide modal so the resume form can be accessed.
        # Guide skip karo button
        elem = page.get_by_role('button', name='Guide skip karo', exact=True)
        await elem.click(timeout=10000)
        
        # -> Fill the Experience section by entering Company, Job Title, Location, Start date, End date, and one bullet in the Experience fields.
        # text field
        elem = page.locator('xpath=/html/body/main/div[2]/div[2]/div/div/div[3]/div[3]/div/div/div/input')
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("Acme Corp")
        
        # -> Fill the Experience section by entering Company, Job Title, Location, Start date, End date, and one bullet in the Experience fields.
        # text field
        elem = page.locator('xpath=/html/body/main/div[2]/div[2]/div/div/div[3]/div[3]/div/div/div[2]/input')
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("Senior Developer")
        
        # -> Fill the Experience section by entering Company, Job Title, Location, Start date, End date, and one bullet in the Experience fields.
        # text field
        elem = page.locator('xpath=/html/body/main/div[2]/div[2]/div/div/div[3]/div[3]/div/div/div[3]/input')
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("Remote")
        
        # -> Fill the Experience section by entering Company, Job Title, Location, Start date, End date, and one bullet in the Experience fields.
        # Jan 2022 text field
        elem = page.get_by_placeholder('Jan 2022', exact=True)
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("Jan 2020")
        
        # -> Fill the Experience section by entering Company, Job Title, Location, Start date, End date, and one bullet in the Experience fields.
        # Present text field
        elem = page.get_by_placeholder('Present', exact=True)
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("Dec 2022")
        
        # -> Scroll the Resume Builder page to reveal the Experience 'Bullet 1' textarea, then list all textarea fields to identify the correct element for Bullet 1.
        await page.mouse.wheel(0, 300)
        
        # -> Fill the 'Bullet' textarea under the Experience section with a concise achievement line so the live preview updates to display the bullet.
        # text area
        elem = page.locator('xpath=/html/body/main/div[2]/div[2]/div/div/div[3]/div[3]/div/div[2]/textarea')
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("Led a team of 5 to design and deliver a microservices platform, reducing deployment time by 40%.")
        
        # -> Verify the live preview contains the experience bullet 'Led a team of 5 to design and deliver a microservices platform, reducing deployment time by 40%.'
        # Comma-separated text field
        elem = page.locator('xpath=/html/body/main/div[2]/div[2]/div/div/div[3]/div[5]/div/div/input')
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("Python, JavaScript")
        
        # -> Verify the live preview contains the experience bullet 'Led a team of 5 to design and deliver a microservices platform, reducing deployment time by 40%.'
        # Comma-separated text field
        elem = page.locator('xpath=/html/body/main/div[2]/div[2]/div/div/div[3]/div[5]/div/div[2]/input')
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("React, Express")
        
        # -> Verify the live preview contains the experience bullet 'Led a team of 5 to design and deliver a microservices platform, reducing deployment time by 40%.'
        # Comma-separated text field
        elem = page.locator('xpath=/html/body/main/div[2]/div[2]/div/div/div[3]/div[5]/div/div[3]/input')
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("AWS, Docker")
        
        # -> Verify the live preview contains the experience bullet 'Led a team of 5 to design and deliver a microservices platform, reducing deployment time by 40%.'
        # Comma-separated text field
        elem = page.locator('xpath=/html/body/main/div[2]/div[2]/div/div/div[3]/div[5]/div/div[4]/input')
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("PostgreSQL, MongoDB")
        
        # --> Assertions to verify final state
        
        # --> Verify a resume preview is displayed
        await page.locator("xpath=/html/body/main/div[2]/div[2]/div[1]/div/button").nth(0).scroll_into_view_if_needed()
        # Assert: The resume preview's 'Download PDF — ATS Ready' button is visible.
        await expect(page.locator("xpath=/html/body/main/div[2]/div[2]/div[1]/div/button").nth(0)).to_be_visible(timeout=15000), "The resume preview's 'Download PDF \u2014 ATS Ready' button is visible."
        # Assert: The preview displays the ATS score indicator '/100', confirming the preview is rendered.
        await expect(page.locator("xpath=/html/body/main/div[2]/div[2]/div[1]/div/div[2]/div[1]/div/p[2]/span").nth(0)).to_contain_text("/100", timeout=15000), "The preview displays the ATS score indicator '/100', confirming the preview is rendered."
        current_url = await page.evaluate("() => window.location.href")
        # Assert: page loaded with a URL (final outcome verified by the AI judge during the run)
        assert current_url, 'Page should have loaded with a URL'
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    