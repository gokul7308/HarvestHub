import asyncio
import os
import json
from playwright.async_api import async_playwright

CHROME_PATH = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
BASE_URL = "http://localhost:4173"
OUT_DIR = "evaluation/screenshots"

DEMO_USERS = {
    "farmer": {
        "id": "demo-farmer",
        "email": "farmer@demo.com",
        "name": "Demo Farmer",
        "role": "farmer",
        "avatar": "DF"
    },
    "merchant": {
        "id": "demo-merchant",
        "email": "merchant@demo.com",
        "name": "Demo Merchant",
        "role": "merchant",
        "avatar": "DM"
    },
    "admin": {
        "id": "demo-admin",
        "email": "admin@demo.com",
        "name": "Demo Admin",
        "role": "admin",
        "avatar": "DA"
    }
}

async def capture_all():
    os.makedirs(OUT_DIR, exist_ok=True)
    async with async_playwright() as p:
        browser = await p.chromium.launch(
            executable_path=CHROME_PATH,
            headless=True,
            args=["--no-sandbox", "--disable-gpu"]
        )
        context = await browser.new_context(viewport={"width": 1440, "height": 900})
        page = await context.new_page()

        # Helper to set role in localStorage
        async def set_role(role: str):
            user_data = DEMO_USERS[role]
            await page.goto(f"{BASE_URL}/")
            await page.evaluate(f"window.localStorage.setItem('harvesthub_demo_user', JSON.stringify({json.dumps(user_data)}));")

        # 1. Farmer Dashboard
        print("1. Capturing Farmer Dashboard...")
        await set_role("farmer")
        await page.goto(f"{BASE_URL}/farmer")
        await page.wait_for_load_state("networkidle")
        await asyncio.sleep(2)
        await page.screenshot(path=f"{OUT_DIR}/farmer-dashboard.png")

        # 2. AI Price Prediction Module
        print("2. Capturing AI Price Prediction Module...")
        prediction_el = page.locator("text=Price Forecast").first
        if await prediction_el.count() == 0:
            prediction_el = page.locator("text=Prediction").first
        if await prediction_el.count() > 0:
            await prediction_el.scroll_into_view_if_needed()
            await asyncio.sleep(1)
        await page.screenshot(path=f"{OUT_DIR}/ai-prediction.png")

        # 3. Crop Management (Listings)
        print("3. Capturing Crop Management (Listings)...")
        await page.goto(f"{BASE_URL}/listings")
        await page.wait_for_load_state("networkidle")
        await asyncio.sleep(2)
        await page.screenshot(path=f"{OUT_DIR}/crop-management.png")

        # 4. Marketplace
        print("4. Capturing Marketplace...")
        await page.goto(f"{BASE_URL}/marketplace")
        await page.wait_for_load_state("networkidle")
        await asyncio.sleep(2)
        await page.screenshot(path=f"{OUT_DIR}/marketplace.png")

        # 5. Merchant Dashboard
        print("5. Capturing Merchant Dashboard...")
        await set_role("merchant")
        await page.goto(f"{BASE_URL}/merchant")
        await page.wait_for_load_state("networkidle")
        await asyncio.sleep(2)
        await page.screenshot(path=f"{OUT_DIR}/merchant-dashboard.png")

        # 6. Admin Dashboard
        print("6. Capturing Admin Dashboard...")
        await set_role("admin")
        await page.goto(f"{BASE_URL}/admin")
        await page.wait_for_load_state("networkidle")
        await asyncio.sleep(2)
        await page.screenshot(path=f"{OUT_DIR}/admin-dashboard.png")

        # 7. Analytics Page
        print("7. Capturing Platform Analytics...")
        await page.goto(f"{BASE_URL}/analytics")
        await page.wait_for_load_state("networkidle")
        await asyncio.sleep(2)
        await page.screenshot(path=f"{OUT_DIR}/analytics.png")

        # 8. AI Assistant Modal / Widget
        print("8. Capturing AI Assistant...")
        await set_role("farmer")
        await page.goto(f"{BASE_URL}/farmer")
        await asyncio.sleep(1)
        # Click on floating AI assistant or modal trigger
        assistant_btn = page.locator("button:has-text('Assistant'), button:has-text('AI'), button:has-text('Ask')").first
        if await assistant_btn.count() > 0:
            try:
                await assistant_btn.click()
                await asyncio.sleep(1)
            except Exception:
                pass
        await page.screenshot(path=f"{OUT_DIR}/ai-assistant.png")

        await browser.close()
        print("\nAll 8 screenshots successfully captured and saved to evaluation/screenshots/!")

if __name__ == "__main__":
    asyncio.run(capture_all())
