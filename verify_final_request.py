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

        # Select the first product: "พิซซ่าฮาวายเอี้ยน"
        product_name = "พิซซ่าฮาวายเอี้ยน"
        print(f"Testing with product: {product_name}")

        # Find the card for this product
        product_card = page.locator(".bg-white.rounded-2xl.overflow-hidden", has_text=product_name)

        # Toggle OOS button (orange ban icon)
        toggle_btn = product_card.locator("button[title='ทำเครื่องหมายว่าหมด']")
        await toggle_btn.click()

        # Verify it shows "หมดแล้ว" in admin
        await page.wait_for_selector(f".bg-white.rounded-2xl.overflow-hidden:has-text('{product_name}') text=หมดแล้ว")
        print("Sold out badge appeared in admin.")

        # Go to customer page
        print("Navigating to customer page...")
        await page.goto("http://localhost:5173/")

        # Check if "หมดแล้ว" appears on the customer page for this product
        # MenuItem structure: outer div -> inner content -> name
        customer_item = page.locator(".bg-white.rounded-2xl", has_text=product_name)
        is_sold_out_customer = await customer_item.locator("text=หมดแล้ว").is_visible()
        btn_text = await customer_item.locator("button").last.inner_text()

        print(f"Customer UI - Badge visible: {is_sold_out_customer}")
        print(f"Customer UI - Button text: {btn_text}")

        if is_sold_out_customer and "ขณะนี้หมดชั่วคราว" in btn_text:
            print("Status correctly shown on customer page.")
        else:
            print("Status NOT shown correctly on customer page!")

        await page.screenshot(path="/home/jules/verification/final_check_fixed.png")
        await browser.close()

if __name__ == "__main__":
    os.makedirs("/home/jules/verification", exist_ok=True)
    asyncio.run(run_test())
