# 📊 การตั้งค่า Google Sheets API สำหรับร้านอาหาร (เวอร์ชันอัปเกรด - ลบสินค้าได้แน่นอน)

คู่มือนี้จะช่วยคุณตั้งค่า Google Sheets และ Google Drive ให้ทำงานร่วมกับแอปได้โดยอัตโนมัติ พร้อมระบบจัดการ ID ที่แม่นยำ

## 1. เตรียม Google Sheets & Drive
1. สร้าง Google Sheets ใหม่
2. สร้าง Folder ใน Google Drive เพื่อเก็บรูปภาพ -> Share ให้เป็น **Anyone with the link** (Viewer) -> คัดลอก **Folder ID**

## 2. ตั้งค่า Google Apps Script
1. ใน Google Sheets ไปที่เมนู **Extensions** -> **Apps Script**
2. คัดลอกโค้ดด้านล่างนี้ไปวางทั้งหมด (แทนที่ของเดิม):

```javascript
// ⚠️ แก้ไขจุดสำคัญ 2 จุดนี้ก่อนนำไปใช้งาน
const SPREADSHEET_ID = 'ใส่_ID_ของ_Spreadsheet_ที่นี่';
const FOLDER_ID = 'ใส่_ID_ของ_Folder_ใน_Google_Drive_ที่นี่';

function doGet(e) {
  try {
    const action = e.parameter.action;

    if (!SPREADSHEET_ID || SPREADSHEET_ID.includes('ใส่_ID')) {
      return createJsonResponse({ status: "error", message: "กรุณาใส่ SPREADSHEET_ID ในโค้ด Apps Script" });
    }

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

    if (action === 'setup') {
      setupSheets(ss);
      return createJsonResponse({ status: "success", message: "สร้างแผ่นงาน Products และ Orders เรียบร้อยแล้ว!" });
    }

    if (action === 'getProducts') {
      const sheet = ss.getSheetByName('Products');
      if (!sheet) return createJsonResponse({ status: "error", message: "ไม่พบแผ่นงาน Products" });
      return createJsonResponse(getSheetDataAsJson(sheet));
    }

    if (action === 'getOrders') {
      const sheet = ss.getSheetByName('Orders');
      if (!sheet) return createJsonResponse({ status: "error", message: "ไม่พบแผ่นงาน Orders" });
      return createJsonResponse(getSheetDataAsJson(sheet, true));
    }

    if (action === 'getSettings') {
      const sheet = ss.getSheetByName('Settings');
      if (!sheet) {
        return createJsonResponse({ bankName: "", accountNumber: "", accountHolder: "", qrCode: "", isShopOpen: true });
      }
      const data = getSheetDataAsJson(sheet);
      return createJsonResponse(data.length > 0 ? data[0] : { bankName: "", accountNumber: "", accountHolder: "", qrCode: "", isShopOpen: true });
    }

    return createJsonResponse({ status: "error", message: "Unknown GET action: " + action });
  } catch (err) {
    return createJsonResponse({ status: "error", message: "GET Error: " + err.toString() });
  }
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

    if (action === 'addProduct') {
      const sheet = ss.getSheetByName('Products');
      let imageUrl = data.image;
      if (imageUrl && imageUrl.startsWith('data:')) {
        imageUrl = uploadToDrive(imageUrl, "Product_" + data.id);
      }
      sheet.appendRow([
        data.id,
        data.name,
        data.price,
        data.priceM || 0,
        data.priceL || 0,
        data.category,
        data.description,
        imageUrl,
        data.isAvailable !== undefined ? data.isAvailable : true
      ]);
      SpreadsheetApp.flush();
      return createJsonResponse({ status: 'success' });
    }

    if (action === 'updateProduct') {
      const sheet = ss.getSheetByName('Products');
      const dataRange = sheet.getDataRange().getDisplayValues(); // ใช้ getDisplayValues เพื่อเลี่ยงปัญหาการปัดเศษตัวเลข
      const targetId = data.id.toString().replace(/,/g, ''); // ลบคอมม่าถ้ามี
      let found = false;
      for (let i = 1; i < dataRange.length; i++) {
        const currentId = dataRange[i][0].toString().replace(/,/g, '');
        if (currentId === targetId) {
          let imageUrl = data.image;
          if (imageUrl && imageUrl.startsWith('data:')) {
            imageUrl = uploadToDrive(imageUrl, "Product_" + data.id);
          }
          sheet.getRange(i + 1, 1, 1, 9).setValues([[
            data.id,
            data.name,
            data.price,
            data.priceM || 0,
            data.priceL || 0,
            data.category,
            data.description,
            imageUrl,
            data.isAvailable !== undefined ? data.isAvailable : true
          ]]);
          found = true;
          break;
        }
      }
      SpreadsheetApp.flush();
      return createJsonResponse({ status: found ? 'success' : 'error', message: found ? '' : 'Product not found' });
    }

    if (action === 'deleteProduct') {
      const sheet = ss.getSheetByName('Products');
      const dataRange = sheet.getDataRange().getDisplayValues();
      const targetId = data.id.toString().replace(/,/g, '');
      let found = false;
      for (let i = 1; i < dataRange.length; i++) {
        const currentId = dataRange[i][0].toString().replace(/,/g, '');
        if (currentId === targetId) {
          sheet.deleteRow(i + 1);
          found = true;
          break;
        }
      }
      SpreadsheetApp.flush();
      return createJsonResponse({ status: found ? 'success' : 'error', message: found ? '' : 'Product not found' });
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
        data.status, data.createdAt, slipUrl, data.location, data.remark
      ]);
      SpreadsheetApp.flush();
      return createJsonResponse({ status: 'success' });
    }

    if (action === 'updateOrderStatus') {
      const sheet = ss.getSheetByName('Orders');
      const dataRange = sheet.getDataRange().getDisplayValues();
      const targetId = data.id.toString().replace(/,/g, '');
      let found = false;
      for (let i = 1; i < dataRange.length; i++) {
        const currentId = dataRange[i][0].toString().replace(/,/g, '');
        if (currentId === targetId) {
          sheet.getRange(i + 1, 9).setValue(data.status);
          found = true;
          break;
        }
      }
      SpreadsheetApp.flush();
      return createJsonResponse({ status: found ? 'success' : 'error', message: found ? '' : 'Order not found' });
    }

    if (action === 'updateSettings') {
      let sheet = ss.getSheetByName('Settings');
      if (!sheet) {
        sheet = ss.insertSheet('Settings');
        sheet.getRange(1, 1, 1, 5).setValues([['bankName', 'accountNumber', 'accountHolder', 'qrCode', 'isShopOpen']]);
      }

      let qrCodeUrl = data.qrCode;
      if (qrCodeUrl && qrCodeUrl.startsWith('data:')) {
        qrCodeUrl = uploadToDrive(qrCodeUrl, "Shop_QRCode");
      }

      const settingsData = [
        data.bankName || "",
        data.accountNumber || "",
        data.accountHolder || "",
        qrCodeUrl || "",
        data.isShopOpen !== undefined ? data.isShopOpen : true
      ];

      if (sheet.getLastRow() > 1) {
        sheet.getRange(2, 1, 1, 5).setValues([settingsData]);
      } else {
        sheet.appendRow(settingsData);
      }
      SpreadsheetApp.flush();
      return createJsonResponse({ status: 'success' });
    }

    return createJsonResponse({ status: "error", message: "Unknown POST action: " + action });
  } catch (err) {
    return createJsonResponse({ status: "error", message: "POST Error: " + err.toString() });
  }
}

function setupSheets(ss) {
  let pSheet = ss.getSheetByName('Products');
  if (!pSheet) pSheet = ss.insertSheet('Products');
  pSheet.getRange(1, 1, 1, 9).setValues([['id', 'name', 'price', 'priceM', 'priceL', 'category', 'description', 'image', 'isAvailable']]);
  pSheet.getRange(1, 1, 1, 9).setFontWeight("bold").setBackground("#f3f3f3");

  let oSheet = ss.getSheetByName('Orders');
  if (!oSheet) oSheet = ss.insertSheet('Orders');
  oSheet.getRange(1, 1, 1, 13).setValues([['id', 'name', 'phone', 'address', 'deliveryMethod', 'paymentMethod', 'cartItems', 'total', 'status', 'createdAt', 'slipFile', 'location', 'remark']]);
  oSheet.getRange(1, 1, 1, 13).setFontWeight("bold").setBackground("#f3f3f3");

  let sSheet = ss.getSheetByName('Settings');
  if (!sSheet) sSheet = ss.insertSheet('Settings');
  sSheet.getRange(1, 1, 1, 5).setValues([['bankName', 'accountNumber', 'accountHolder', 'qrCode', 'isShopOpen']]);
  sSheet.getRange(1, 1, 1, 5).setFontWeight("bold").setBackground("#f3f3f3");
}

function getSheetDataAsJson(sheet, parseCart = false) {
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];

  const sheetName = sheet.getName();
  let headers = data[0];

  // มาตรฐานใหม่: บังคับใช้ header ที่ถูกต้องเพื่อป้องกันปัญหาข้อมูลเยื้องหน้าเว็บ
  if (sheetName === 'Products') {
    headers = ['id', 'name', 'price', 'priceM', 'priceL', 'category', 'description', 'image', 'isAvailable'];
  } else if (sheetName === 'Orders') {
    headers = ['id', 'name', 'phone', 'address', 'deliveryMethod', 'paymentMethod', 'cartItems', 'total', 'status', 'createdAt', 'slipFile', 'location', 'remark'];
  } else if (sheetName === 'Settings') {
    headers = ['bankName', 'accountNumber', 'accountHolder', 'qrCode', 'isShopOpen'];
  }

  return data.slice(1).map(row => {
    let obj = {};
    // วนลูปตามจำนวนคอลัมน์ที่มีจริงในแถวนั้นๆ
    row.forEach((cellValue, index) => {
      const header = headers[index] || "column" + (index + 1);
      if (parseCart && header === 'cartItems') {
        try { obj[header] = JSON.parse(cellValue); } catch(e) { obj[header] = []; }
      } else {
        obj[header] = cellValue;
      }
    });
    return obj;
  });
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
    return file.getUrl();
  } catch (e) {
    return base64Data;
  }
}
```

3. กดปุ่ม **Deploy -> New Deployment** (เลือก Web App, Execute as Me, Access **Anyone**)
4. เมื่อได้ URL มาแล้ว ให้คุณนำมาใส่ในไฟล์ `src/utils/googleSheets.js`

---
*หมายเหตุ: โค้ดเวอร์ชันนี้ใช้ `getDisplayValues()` เพื่อป้องกันปัญหาที่ Google Sheets ปัดเศษตัวเลข ID ขนาดใหญ่ (เช่น 1778036693481) ทำให้เราสามารถลบสินค้าได้ถูกต้องแม่นยำครับ*
