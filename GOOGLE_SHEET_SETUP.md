# 📊 การตั้งค่า Google Sheets API สำหรับร้านอาหาร (เวอร์ชันอัปเกรด)

คู่มือนี้จะช่วยคุณตั้งค่า Google Sheets และ Google Drive ให้ทำงานร่วมกับแอปได้โดยอัตโนมัติ

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

    // --- ระบบ Setup อัตโนมัติ ---
    if (action === 'setup') {
      setupSheets(ss);
      return createJsonResponse({ status: "success", message: "สร้างแผ่นงาน Products และ Orders เรียบร้อยแล้ว!" });
    }

    if (action === 'getProducts') {
      const sheet = ss.getSheetByName('Products');
      if (!sheet) return createJsonResponse({ status: "error", message: "ไม่พบแผ่นงาน Products กรุณารัน setup ก่อน" });
      return createJsonResponse(getSheetDataAsJson(sheet));
    }

    if (action === 'getOrders') {
      const sheet = ss.getSheetByName('Orders');
      if (!sheet) return createJsonResponse({ status: "error", message: "ไม่พบแผ่นงาน Orders กรุณารัน setup ก่อน" });
      return createJsonResponse(getSheetDataAsJson(sheet, true));
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

    if (action === 'setup') {
      setupSheets(ss);
      return createJsonResponse({ status: "success", message: "Setup complete" });
    }

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
        data.status, data.createdAt, slipUrl, data.location
      ]);
      return createJsonResponse({ status: 'success' });
    }

    if (action === 'updateOrderStatus') {
      const sheet = ss.getSheetByName('Orders');
      const dataRange = sheet.getDataRange().getValues();
      let found = false;
      for (let i = 1; i < dataRange.length; i++) {
        // ใช้ toString() เพื่อป้องกันปัญหาการเปรียบเทียบตัวเลขที่มีรูปแบบต่างกัน
        if (dataRange[i][0].toString() === data.id.toString()) {
          sheet.getRange(i + 1, 9).setValue(data.status);
          found = true;
          break;
        }
      }

      if (found) {
        SpreadsheetApp.flush(); // บังคับให้บันทึกข้อมูลลง Sheet ทันที
        return createJsonResponse({ status: 'success' });
      } else {
        return createJsonResponse({ status: 'error', message: 'ไม่พบออเดอร์ ID: ' + data.id });
      }
    }

    return createJsonResponse({ status: "error", message: "Unknown POST action: " + action });
  } catch (err) {
    return createJsonResponse({ status: "error", message: "POST Error: " + err.toString() });
  }
}

function setupSheets(ss) {
  // สร้างแผ่น Products
  let pSheet = ss.getSheetByName('Products');
  if (!pSheet) pSheet = ss.insertSheet('Products');
  pSheet.getRange(1, 1, 1, 6).setValues([['id', 'name', 'price', 'category', 'description', 'image']]);
  pSheet.getRange(1, 1, 1, 6).setFontWeight("bold").setBackground("#f3f3f3");

  // สร้างแผ่น Orders
  let oSheet = ss.getSheetByName('Orders');
  if (!oSheet) oSheet = ss.insertSheet('Orders');
  oSheet.getRange(1, 1, 1, 12).setValues([['id', 'name', 'phone', 'address', 'deliveryMethod', 'paymentMethod', 'cartItems', 'total', 'status', 'createdAt', 'slipFile', 'location']]);
  oSheet.getRange(1, 1, 1, 12).setFontWeight("bold").setBackground("#f3f3f3");
}

function getSheetDataAsJson(sheet, parseCart = false) {
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  const headers = data[0];
  return data.slice(1).map(row => {
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
    return base64Data;
  }
}
```

3. กดปุ่ม **Deploy -> New Deployment** (เลือก Web App, Execute as Me, Access Anyone)
4. เมื่อได้ URL มาแล้ว ให้คุณเปิด URL นั้นในเบราว์เซอร์โดยเติม `?action=setup` ต่อท้าย เช่น:
   `https://script.google.com/.../exec?action=setup`
5. **เพียงเท่านี้ สคริปต์จะสร้างแผ่นงานและตั้งชื่อให้คุณโดยอัตโนมัติครับ!**

---
*หมายเหตุ: อย่าลืมแก้ SPREADSHEET_ID และ FOLDER_ID ในโค้ดก่อน Deploy ครับ*
