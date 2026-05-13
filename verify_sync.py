import asyncio
from playwright.async_api import async_playwright
import os

async def run_test():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        context = await browser.new_context(viewport={'width': 1280, 'height': 800})
        page = await context.new_page()

        # Navigate to customer page
        print("Navigating to customer page...")
        await page.goto("http://localhost:5173/")
        await page.wait_for_selector("text=ร้านอาหารอร่อยใกล้บ้าน")

        # Select product "ส้มตำไทย"
        product_name = "ส้มตำไทย"
        print(f"Checking product: {product_name}")

        # Initially it should NOT be sold out
        customer_item = page.locator(".bg-white.rounded-2xl", has_text=product_name).first
        is_sold_out_initial = await customer_item.locator("text=หมดแล้ว").is_visible()
        print(f"Initial 'หมดแล้ว' badge visible: {is_sold_out_initial}")

        # Navigate to admin products page in a NEW page to simulate merchant action
        admin_page = await context.new_page()
        print("Navigating to admin products page...")
        await admin_page.goto("http://localhost:5173/admin")
        await admin_page.click("text=จัดการสินค้า")
        await admin_page.wait_for_selector("text=สินค้าทั้งหมด")

        # Toggle OOS for "ส้มตำไทย"
        admin_item = admin_page.locator(".bg-white.rounded-2xl", has_text=product_name).first
        toggle_btn = admin_item.locator("button").nth(0) # The first button is the toggle
        await toggle_btn.click()

        # Verify admin shows it's sold out
        await admin_page.wait_for_selector(f".bg-white.rounded-2xl:has-text('{product_name}') text=หมดแล้ว")
        print("Admin: Sold out badge appeared.")

        # Go back to customer page and check (it polls every 3s)
        print("Waiting for customer page to update (polling)...")
        await page.bring_to_front()

        # Wait up to 10 seconds for the UI to update via polling
        try:
            await page.wait_for_selector(f".bg-white.rounded-2xl:has-text('{product_name}') text=หมดแล้ว", timeout=15000)
            print("Customer UI updated: Sold out badge visible.")

            btn_text = await customer_item.locator("button").last.inner_text()
            print(f"Customer UI Button text: {btn_text}")

            if "ขณะนี้หมดชั่วคราว" in btn_text:
                print("SUCCESS: Product availability syncs correctly from admin to customer.")
            else:
                print("FAILURE: Button text did not update.")
        except Exception as e:
            print(f"FAILURE: Customer UI did not update within timeout. {e}")

        await page.screenshot(path="/home/jules/verification/final_sync_check.png")
        await admin_page.screenshot(path="/home/jules/verification/admin_oos_check.png")
        await browser.close()

if __name__ == "__main__":
    os.makedirs("/home/jules/verification", exist_ok=True)
    asyncio.run(run_test())
