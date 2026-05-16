import asyncio
from playwright.async_api import async_playwright

async def verify():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_row()

        # ไปที่หน้าแอดมิน เพื่อดู Shop Settings
        await page.goto("http://localhost:5173/admin")
        await page.wait_for_selector("text=⚙️ ตั้งค่าร้านค้า")
        await page.click("text=⚙️ ตั้งค่าร้านค้า")

        # ตรวจสอบว่ามีฟิลด์ LINE ไหม
        await page.wait_for_selector("text=ตั้งค่า LINE Notification")
        await page.screenshot(path="verification/admin_settings_line.png")
        print("Verified: Admin settings has LINE configuration fields.")

        # ไปที่หน้าลูกค้า (จำลองการมี liffId)
        # เราจะใช้วิธีเปลี่ยนหน้าติดตามออเดอร์
        await page.goto("http://localhost:5173/")
        await page.click("text=ติดตามออเดอร์")

        # ค้นหาออเดอร์ (สมมติว่ามีออเดอร์เบอร์ 0812345678)
        await page.fill("input[placeholder*='10 หลัก']", "0812345678")
        await page.click("text=ค้นหาออเดอร์")

        # เนื่องจากเราไม่มีข้อมูลจริงในระบบจำลอง เราอาจจะไม่เห็นออเดอร์
        # แต่เราสามารถตรวจสอบโค้ดใน OrderTracker ได้ว่ามัน Render ปุ่มไหมถ้ามี settings.liffId

        await browser.close()

if __name__ == "__main__":
    # เราต้องรันเซิร์ฟเวอร์ก่อน
    pass
