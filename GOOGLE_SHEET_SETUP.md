# 📊 การตั้งค่า Google Sheets API สำหรับร้านอาหาร

คู่มือนี้จะช่วยคุณตั้งค่า Google Sheets และ Google Drive เพื่อใช้เป็นฐานข้อมูลสำหรับแอปพลิเคชัน

## 1. เตรียม Google Sheets
1. สร้าง Google Sheets ใหม่
2. สร้าง Sheet ย่อย 2 แผ่น โดยตั้งชื่อดังนี้:
   - **Products**: สำหรับเก็บข้อมูลสินค้า
     - หัวตาราง (แถวที่ 1): `id`, `name`, `price`, `category`, `description`, `image`
   - **Orders**: สำหรับเก็บข้อมูลการสั่งซื้อ
     - หัวตาราง (แถวที่ 1): `id`, `name`, `phone`, `address`, `deliveryMethod`, `paymentMethod`, `cartItems`, `total`, `status`, `createdAt`, `slipFile`

## 2. เตรียม Google Drive
1. สร้าง Folder ใน Google Drive เพื่อเก็บรูปภาพสินค้าและสลิป
2. คลิกขวาที่ Folder -> Share -> เปลี่ยนเป็น **Anyone with the link** (Viewer) เพื่อให้แอปแสดงรูปภาพได้
3. คัดลอก **Folder ID** (ตัวอักษรหลัง `folders/` ใน URL)

## 3. ตั้งค่า Google Apps Script
1. ใน Google Sheets ไปที่เมนู **Extensions** -> **Apps Script**
2. คัดลอกโค้ดด้านล่างนี้ไปวาง:

```javascript
const SPREADSHEET_ID = 'ใส่_ID_ของ_Spreadsheet_ที่นี่';
const FOLDER_ID = 'ใส่_ID_ของ_Folder_ใน_Google_Drive_ที่นี่';

function doGet(e) {
  const action = e.parameter.action;
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

  if (action === 'getProducts') {
    const sheet = ss.getSheetByName('Products');
    return getSheetDataAsJson(sheet);
  }

  if (action === 'getOrders') {
    const sheet = ss.getSheetByName('Orders');
    return getSheetDataAsJson(sheet, true);
  }
}

function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  const action = data.action;
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

  if (action === 'addProduct') {
    const sheet = ss.getSheetByName('Products');
    let imageUrl = data.image;
    if (imageUrl && imageUrl.startsWith('data:')) {
      imageUrl = uploadToDrive(imageUrl, "Product_" + data.id);
    }
    sheet.appendRow([data.id, data.name, data.price, data.category, data.description, imageUrl]);
    return createJsonResponse({ status: 'success' });
  }

  if (action === 'updateProduct') {
    const sheet = ss.getSheetByName('Products');
    const dataRange = sheet.getDataRange().getValues();
    for (let i = 1; i < dataRange.length; i++) {
      if (dataRange[i][0] == data.id) {
        let imageUrl = data.image;
        if (imageUrl && imageUrl.startsWith('data:')) {
          imageUrl = uploadToDrive(imageUrl, "Product_" + data.id);
        }
        sheet.getRange(i + 1, 1, 1, 6).setValues([[data.id, data.name, data.price, data.category, data.description, imageUrl]]);
        break;
      }
    }
    return createJsonResponse({ status: 'success' });
  }

  if (action === 'deleteProduct') {
    const sheet = ss.getSheetByName('Products');
    const dataRange = sheet.getDataRange().getValues();
    for (let i = 1; i < dataRange.length; i++) {
      if (dataRange[i][0] == data.id) {
        sheet.deleteRow(i + 1);
        break;
      }
    }
    return createJsonResponse({ status: 'success' });
  }

  if (action === 'addOrder') {
    const sheet = ss.getSheetByName('Orders');
    let slipUrl = data.slipFile;
    if (slipUrl && slipUrl.startsWith('data:')) {
      slipUrl = uploadToDrive(slipUrl, 'Slip_' + data.id);
    }
    sheet.appendRow([
      data.id, data.name, data.phone, data.address, data.deliveryMethod,
      data.paymentMethod, JSON.stringify(data.cartItems), data.total,
      data.status, data.createdAt, slipUrl
    ]);
    return createJsonResponse({ status: 'success' });
  }

  if (action === 'updateOrderStatus') {
    const sheet = ss.getSheetByName('Orders');
    const dataRange = sheet.getDataRange().getValues();
    for (let i = 1; i < dataRange.length; i++) {
      if (dataRange[i][0] == data.id) {
        sheet.getRange(i + 1, 9).setValue(data.status);
        break;
      }
    }
    return createJsonResponse({ status: 'success' });
  }
}

function getSheetDataAsJson(sheet, parseCart = false) {
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const rows = data.slice(1).map(row => {
    let obj = {};
    headers.forEach((header, index) => {
      if (parseCart && header === 'cartItems') {
        try { obj[header] = JSON.parse(row[index]); } catch(e) { obj[header] = []; }
      } else {
        obj[header] = row[index];
      }
    });
    return obj;
  });
  return createJsonResponse(rows);
}

function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function uploadToDrive(base64Data, fileName) {
  try {
    const splitData = base64Data.split(',');
    const contentType = splitData[0].match(/:(.*?);/)[1];
    const byteCharacters = Utilities.base64Decode(splitData[1]);
    const blob = Utilities.newBlob(byteCharacters, contentType, fileName);
    const folder = DriveApp.getFolderById(FOLDER_ID);
    const file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    return file.getUrl().replace('/view?usp=drivesdk', '/thumbnail?sz=w800');
  } catch (e) {
    return base64Data; // คืนค่าเดิมถ้าอัปโหลดไม่สำเร็จ
  }
}
```

3. กดปุ่ม **Deploy** -> **New Deployment**
4. เลือกประเภทเป็น **Web App**
5. ตั้งค่า **Execute as: Me** และ **Who has access: Anyone**
6. กด Deploy และคัดลอก **Web App URL** ไปใส่ในไฟล์ `src/utils/googleSheets.js`

---
*หมายเหตุ: อย่าลืมเปลี่ยน `SPREADSHEET_ID` และ `FOLDER_ID` ให้เป็นของคุณเอง*
