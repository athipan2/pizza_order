import asyncio
from playwright.async_api import async_playwright
import os

async def run_test():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        context = await browser.new_context(viewport={'width': 1280, 'height': 800})
        page = await context.new_page()

        # Navigate to admin products page
        print("Navigating to admin products page...")
        await page.goto("http://localhost:5173/admin")
        await page.click("text=จัดการสินค้า")
        await page.wait_for_selector("text=สินค้าทั้งหมด")

        # Find the first product and toggle OOS
        product_card = page.locator(".bg-white.rounded-2xl.overflow-hidden").first
        product_name = await product_card.locator("h3").inner_text()
        print(f"Testing with product: {product_name}")

        # Toggle OOS button (orange ban icon)
        toggle_btn = product_card.locator("button[title='ทำเครื่องหมายว่าหมด']")
        await toggle_btn.click()

        # Verify it shows "หมดแล้ว" in admin
        # The badge in admin uses text "หมดแล้ว"
        await page.wait_for_selector("text=หมดแล้ว")
        print("Sold out badge appeared in admin.")

        # Go to customer page
        print("Navigating to customer page...")
        await page.goto("http://localhost:5173/")

        # Check if "หมดแล้ว" appears on the customer page for this product
        # The MenuItem.jsx now has "ขณะนี้หมดชั่วคราว" on the button and "หมดแล้ว" on the badge
        is_sold_out_customer = await page.locator(f"text={product_name}").locator("xpath=../../..").locator("text=หมดแล้ว").is_visible()
        btn_text = await page.locator(f"text={product_name}").locator("xpath=../../..").locator("button").last.inner_text()

        if is_sold_out_customer and "ขณะนี้หมดชั่วคราว" in btn_text:
            print("Status correctly shown on customer page with updated UI.")
        else:
            print(f"Status NOT shown correctly on customer page! (Found: {btn_text})")

        await page.screenshot(path="/home/jules/verification/final_check.png")
        await browser.close()

if __name__ == "__main__":
    os.makedirs("/home/jules/verification", exist_ok=True)
    asyncio.run(run_test())
