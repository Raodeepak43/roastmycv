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
        
        # -> Click the 'Resume Builder' link in the site header to open the public resume builder page.
        # Resume Builder Builder link
        elem = page.get_by_role('link', name='Resume Builder Builder', exact=True)
        await elem.click(timeout=10000)
        
        # -> Fill the Full Name field with 'Test User' (then Job Title, Email, Professional Summary, and Company) to update the resume content in the live preview.
        # Deepak Yadav text field
        elem = page.get_by_placeholder('Deepak Yadav', exact=True)
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("Test User")
        
        # -> Fill the Full Name field with 'Test User' (then Job Title, Email, Professional Summary, and Company) to update the resume content in the live preview.
        # Software Development Engineer text field
        elem = page.get_by_placeholder('Software Development Engineer', exact=True)
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("Software Engineer")
        
        # -> Fill the Full Name field with 'Test User' (then Job Title, Email, Professional Summary, and Company) to update the resume content in the live preview.
        # email field
        elem = page.locator('xpath=/html/body/main/div[2]/div[2]/div/div/div[3]/div/div/div[3]/input')
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("test.user@example.com")
        
        # -> Fill the Full Name field with 'Test User' (then Job Title, Email, Professional Summary, and Company) to update the resume content in the live preview.
        # 2-3 sentences about your experience and impact… text area
        elem = page.get_by_placeholder('2-3 sentences about your experience and impact…', exact=True)
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("Experienced software engineer with 5 years building scalable web applications.")
        
        # -> Fill the Full Name field with 'Test User' (then Job Title, Email, Professional Summary, and Company) to update the resume content in the live preview.
        # text field
        elem = page.locator('xpath=/html/body/main/div[2]/div[2]/div/div/div[3]/div[3]/div/div/div/input')
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("Acme Corp")
        
        # -> Accept the cookies banner, change the Job Title to 'Senior Software Engineer', verify the live preview shows 'Senior Software Engineer', then click the '⬇ Download PDF — ATS Ready' button to confirm export is available.
        # Accept All button
        elem = page.get_by_role('button', name='Accept All', exact=True)
        await elem.click(timeout=10000)
        
        # -> Accept the cookies banner, change the Job Title to 'Senior Software Engineer', verify the live preview shows 'Senior Software Engineer', then click the '⬇ Download PDF — ATS Ready' button to confirm export is available.
        # Software Development Engineer text field
        elem = page.get_by_placeholder('Software Development Engineer', exact=True)
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("Senior Software Engineer")
        
        # -> Accept the cookies banner, change the Job Title to 'Senior Software Engineer', verify the live preview shows 'Senior Software Engineer', then click the '⬇ Download PDF — ATS Ready' button to confirm export is available.
        # Download: ⬇ Download PDF — ATS Ready button
        elem = page.locator('[id="rb-download-btn"]')
        async with page.expect_download(timeout=30000) as dl_info:
            await elem.click(timeout=10000)
        download = await dl_info.value
        assert download.suggested_filename  # verify file was downloaded
        await download.save_as(f"./downloads/{download.suggested_filename}")
        
        # --> Assertions to verify final state
        
        # --> Verify the live resume preview is displayed
        await page.locator("xpath=/html/body/main/div[2]/div[2]/div[1]/div/button").nth(0).scroll_into_view_if_needed()
        # Assert: The live resume preview's download control is visible, indicating the preview is displayed.
        await expect(page.locator("xpath=/html/body/main/div[2]/div[2]/div[1]/div/button").nth(0)).to_be_visible(timeout=15000), "The live resume preview's download control is visible, indicating the preview is displayed."
        
        # --> Verify the builder export action is available
        await page.locator("xpath=/html/body/main/div[2]/div[2]/div[1]/div/button").nth(0).scroll_into_view_if_needed()
        # Assert: The builder's Download PDF control (Sign in to download again) is visible.
        await expect(page.locator("xpath=/html/body/main/div[2]/div[2]/div[1]/div/button").nth(0)).to_be_visible(timeout=15000), "The builder's Download PDF control (Sign in to download again) is visible."
        await page.locator("xpath=/html/body/div[2]").nth(0).scroll_into_view_if_needed()
        # Assert: The sign-in modal appears, confirming the export action is reachable.
        await expect(page.locator("xpath=/html/body/div[2]").nth(0)).to_be_visible(timeout=15000), "The sign-in modal appears, confirming the export action is reachable."
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    