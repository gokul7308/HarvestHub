import asyncio
import os
import subprocess
import time
import urllib.request
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

    # Check if preview server is already running, else start it
    server_proc = None
    try:
        urllib.request.urlopen(f"{BASE_URL}/", timeout=1)
        print("Server already running at", BASE_URL)
    except Exception:
        print("Starting Vite preview server on port 4173...")
        server_proc = subprocess.Popen(["npx", "vite", "preview", "--port", "4173"], cwd="frontend")
        for _ in range(30):
            try:
                urllib.request.urlopen(f"{BASE_URL}/", timeout=1)
                print("Vite preview server is ready.")
                break
            except Exception:
                time.sleep(0.5)

    try:
        async with async_playwright() as p:
            browser = await p.chromium.launch(
                executable_path=CHROME_PATH,
                headless=True,
                args=["--no-sandbox", "--disable-gpu", "--font-render-hinting=none"]
            )

            async def get_logged_in_page(role: str):
                context = await browser.new_context(
                    viewport={"width": 1440, "height": 900},
                    device_scale_factor=1
                )
                page = await context.new_page()
                user_data = DEMO_USERS[role]
                # Seed localStorage before page scripts execute
                await page.add_init_script(f"""
                    window.localStorage.setItem('harvesthub_demo_user', JSON.stringify({json.dumps(user_data)}));
                """)
                return context, page

            # 1. Farmer Dashboard
            print("1. Capturing Farmer Dashboard...")
            ctx, page = await get_logged_in_page("farmer")
            await page.goto(f"{BASE_URL}/farmer")
            await page.wait_for_load_state("networkidle")
            await asyncio.sleep(2.5)
            await page.screenshot(path=f"{OUT_DIR}/farmer-dashboard.png")
            await ctx.close()

            # 2. AI Price Prediction Module
            print("2. Capturing AI Price Prediction Module...")
            ctx, page = await get_logged_in_page("farmer")
            await page.goto(f"{BASE_URL}/farmer")
            await page.wait_for_load_state("networkidle")
            await asyncio.sleep(2)
            prediction_card = page.locator("text=AI Price Prediction").first
            if await prediction_card.count() > 0:
                await prediction_card.scroll_into_view_if_needed()
                await page.evaluate("window.scrollBy(0, -100);")
                await asyncio.sleep(2)
                # If random simulation error occurred, click Retry to show full chart
                retry_btn = page.locator("button:has-text('Retry')").first
                if await retry_btn.count() > 0:
                    await retry_btn.click()
                    await asyncio.sleep(2)
            await page.screenshot(path=f"{OUT_DIR}/ai-prediction.png")
            await ctx.close()

            # 3. Crop Management (Listings)
            print("3. Capturing Crop Management (Listings)...")
            ctx, page = await get_logged_in_page("farmer")
            await page.goto(f"{BASE_URL}/listings")
            await page.wait_for_load_state("networkidle")
            await asyncio.sleep(2.5)
            await page.screenshot(path=f"{OUT_DIR}/crop-management.png")
            await ctx.close()

            # 4. Marketplace
            print("4. Capturing Marketplace...")
            ctx, page = await get_logged_in_page("farmer")
            await page.goto(f"{BASE_URL}/marketplace")
            await page.wait_for_load_state("networkidle")
            await asyncio.sleep(2.5)
            await page.screenshot(path=f"{OUT_DIR}/marketplace.png")
            await ctx.close()

            # 5. Merchant Dashboard
            print("5. Capturing Merchant Dashboard...")
            ctx, page = await get_logged_in_page("merchant")
            await page.goto(f"{BASE_URL}/merchant")
            await page.wait_for_load_state("networkidle")
            await asyncio.sleep(2.5)
            await page.screenshot(path=f"{OUT_DIR}/merchant-dashboard.png")
            await ctx.close()

            # 6. Admin Dashboard
            print("6. Capturing Admin Dashboard...")
            ctx, page = await get_logged_in_page("admin")
            await page.goto(f"{BASE_URL}/admin")
            await page.wait_for_load_state("networkidle")
            await asyncio.sleep(2.5)
            await page.screenshot(path=f"{OUT_DIR}/admin-dashboard.png")
            await ctx.close()

            # 7. Analytics Page
            print("7. Capturing Platform Analytics...")
            ctx, page = await get_logged_in_page("farmer")
            await page.goto(f"{BASE_URL}/analytics")
            await page.wait_for_load_state("networkidle")
            await asyncio.sleep(2.5)
            await page.screenshot(path=f"{OUT_DIR}/analytics.png")
            await ctx.close()

            # 8. AI Assistant Modal / Widget
            print("8. Capturing AI Assistant...")
            ctx, page = await get_logged_in_page("farmer")
            await page.goto(f"{BASE_URL}/farmer")
            await page.wait_for_load_state("networkidle")
            await asyncio.sleep(1.5)
            assistant_btn = page.locator("button:has(.lucide-bot), button:has-text('Assistant')").first
            if await assistant_btn.count() > 0:
                await assistant_btn.click()
                await asyncio.sleep(1.5)
            await page.screenshot(path=f"{OUT_DIR}/ai-assistant.png")
            await ctx.close()

            await browser.close()
            print("\nAll screenshots successfully captured and saved to evaluation/screenshots/!")
    finally:
        if server_proc:
            server_proc.terminate()
            server_proc.wait()

if __name__ == "__main__":
    asyncio.run(capture_all())
