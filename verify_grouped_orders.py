import asyncio
from playwright.async_api import async_playwright
import json
from datetime import datetime, timedelta

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        context = await browser.new_context(viewport={'width': 1280, 'height': 800})
        page = await context.new_page()

        now = datetime.now()
        today_iso = now.isoformat() + "Z"
        yesterday_iso = (now - timedelta(days=1)).isoformat() + "Z"
        older_iso = "2024-05-10T10:00:00.000Z"

        mock_orders = [
            {"id": 100, "name": "Today Order", "phone": "0123456789", "total": 100, "status": "รอชำระเงิน", "createdAt": today_iso, "deliveryMethod": "หน้าร้าน", "cartItems": [], "paymentMethod": "เงินสด"},
            {"id": 101, "name": "Yesterday Order", "phone": "0123456789", "total": 200, "status": "ชำระแล้ว", "createdAt": yesterday_iso, "deliveryMethod": "หน้าร้าน", "cartItems": [], "paymentMethod": "เงินสด"},
            {"id": 102, "name": "Older Order", "phone": "0123456789", "total": 300, "status": "เสร็จสิ้น", "createdAt": older_iso, "deliveryMethod": "หน้าร้าน", "cartItems": [], "paymentMethod": "เงินสด"}
        ]

        await page.route("**/macros/s/*/exec?action=getProducts*", lambda route: route.fulfill(status=200, body=json.dumps([])))
        await page.route("**/macros/s/*/exec?action=getOrders*", lambda route: route.fulfill(status=200, body=json.dumps(mock_orders)))

        # Start dev server
        process = await asyncio.create_subprocess_exec(
            'npm', 'run', 'dev', '--', '--port', '5173'
        )

        await asyncio.sleep(10) # Wait for server

        try:
            # Try to connect to common ports if 5173 was taken
            for port in [5173, 5174, 5175, 5176]:
                try:
                    print(f"Trying to connect to port {port}")
                    await page.goto(f"http://localhost:{port}/admin/orders", timeout=5000)
                    break
                except:
                    continue

            await page.wait_for_selector("h1:has-text('หน้าจอแอดมิน')", timeout=10000)

            headers = await page.query_selector_all("h2")
            print(f"Found {len(headers)} date headers")
            for h in headers:
                text = await h.inner_text()
                print(f"Header: {text}")

            await page.screenshot(path="grouped_orders_verify.png")
            print("Screenshot saved to grouped_orders_verify.png")
        finally:
            process.terminate()
            await process.wait()

asyncio.run(run())
