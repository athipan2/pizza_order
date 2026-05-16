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

    if (action === 'getCategories') {
      const sheet = ss.getSheetByName('Categories');
      if (!sheet) return createJsonResponse({ status: "error", message: "ไม่พบแผ่นงาน Categories" });
      return createJsonResponse(getSheetDataAsJson(sheet));
    }

    if (action === 'getSettings') {
      const sheet = ss.getSheetByName('Settings');
      if (!sheet) {
        return createJsonResponse({ bankName: "", accountNumber: "", accountHolder: "", qrCode: "", isShopOpen: true, lineChannelAccessToken: "", lineOaId: "", liffId: "", showLineNotify: true });
      }
      const data = getSheetDataAsJson(sheet);
      const settings = data.length > 0 ? data[0] : { bankName: "", accountNumber: "", accountHolder: "", qrCode: "", isShopOpen: true, lineChannelAccessToken: "", lineOaId: "", liffId: "", showLineNotify: true };

      // Mask sensitive data
      const safeSettings = { ...settings };
      if (safeSettings.lineChannelAccessToken) {
        safeSettings.lineChannelAccessToken = safeSettings.lineChannelAccessToken.substring(0, 5) + "..." + safeSettings.lineChannelAccessToken.substring(safeSettings.lineChannelAccessToken.length - 5);
      }

      return createJsonResponse(safeSettings);
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

    if (action === 'addCategory') {
      const sheet = ss.getSheetByName('Categories');
      sheet.appendRow([
        data.id,
        data.name,
        data.icon
      ]);
      SpreadsheetApp.flush();
      return createJsonResponse({ status: 'success' });
    }

    if (action === 'updateCategory') {
      const sheet = ss.getSheetByName('Categories');
      const dataRange = sheet.getDataRange().getDisplayValues();
      const targetId = data.id.toString().replace(/,/g, '');
      let found = false;
      for (let i = 1; i < dataRange.length; i++) {
        const currentId = dataRange[i][0].toString().replace(/,/g, '');
        if (currentId === targetId) {
          sheet.getRange(i + 1, 1, 1, 3).setValues([[
            data.id,
            data.name,
            data.icon
          ]]);
          found = true;
          break;
        }
      }
      SpreadsheetApp.flush();
      return createJsonResponse({ status: found ? 'success' : 'error', message: found ? '' : 'Category not found' });
    }

    if (action === 'deleteCategory') {
      const sheet = ss.getSheetByName('Categories');
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
      return createJsonResponse({ status: found ? 'success' : 'error', message: found ? '' : 'Category not found' });
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
        data.status, data.createdAt, slipUrl, data.location, data.remark,
        data.lineUserId || ""
      ]);
      SpreadsheetApp.flush();
      return createJsonResponse({ status: 'success' });
    }

    if (action === 'updateOrderStatus') {
      const sheet = ss.getSheetByName('Orders');
      const dataRange = sheet.getDataRange().getValues(); // Get raw values to get lineUserId accurately
      const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      const statusIdx = headers.indexOf('status');
      const deliveryMethodIdx = headers.indexOf('deliveryMethod');
      const lineUserIdIdx = headers.indexOf('lineUserId');

      const targetId = data.id.toString().replace(/,/g, '');
      let found = false;
      let orderData = null;

      for (let i = 1; i < dataRange.length; i++) {
        const currentId = dataRange[i][0].toString().replace(/,/g, '');
        if (currentId === targetId) {
          sheet.getRange(i + 1, statusIdx + 1).setValue(data.status);
          found = true;

          orderData = {
            id: currentId,
            status: data.status,
            deliveryMethod: dataRange[i][deliveryMethodIdx],
            lineUserId: dataRange[i][lineUserIdIdx]
          };
          break;
        }
      }

      SpreadsheetApp.flush();

      // ส่งการแจ้งเตือน LINE อัตโนมัติ
      if (found && orderData && orderData.lineUserId) {
        let message = "";
        if (data.status === "ชำระแล้ว") {
          message = "ชำระเงินเรียบร้อยแล้ว ขอบคุณครับ";
        } else if (data.status === "เสร็จสิ้น" && orderData.deliveryMethod === "รับหน้าร้าน") {
          message = "อาหารพร้อมแล้ว กรุณามารับ";
        } else if (data.status === "ส่งแล้ว" && orderData.deliveryMethod === "เดลิเวอรี่") {
          message = "สินค้ากำลังจัดส่ง กรุณาเตรียมรับ";
        }

        if (message) {
          sendLineNotification(ss, orderData.lineUserId, message);
        }
      }

      return createJsonResponse({ status: found ? 'success' : 'error', message: found ? '' : 'Order not found' });
    }

    if (action === 'updateOrderLineUserId') {
      const sheet = ss.getSheetByName('Orders');
      const dataRange = sheet.getDataRange().getDisplayValues();
      const targetId = data.id.toString().replace(/,/g, '');
      let found = false;
      for (let i = 1; i < dataRange.length; i++) {
        const currentId = dataRange[i][0].toString().replace(/,/g, '');
        if (currentId === targetId) {
          // lineUserId อยู่คอลัมน์ที่ 14
          sheet.getRange(i + 1, 14).setValue(data.lineUserId);
          found = true;
          break;
        }
      }
      SpreadsheetApp.flush();
      return createJsonResponse({ status: found ? 'success' : 'error' });
    }

    if (action === 'updateSettings') {
      let sheet = ss.getSheetByName('Settings');
      if (!sheet) {
        sheet = ss.insertSheet('Settings');
        sheet.getRange(1, 1, 1, 9).setValues([['bankName', 'accountNumber', 'accountHolder', 'qrCode', 'isShopOpen', 'lineChannelAccessToken', 'lineOaId', 'liffId', 'showLineNotify']]);
      }

      let qrCodeUrl = data.qrCode;
      if (qrCodeUrl && qrCodeUrl.startsWith('data:')) {
        qrCodeUrl = uploadToDrive(qrCodeUrl, "Shop_QRCode");
      }

      // ป้องกันการทับค่าเดิมที่ Mask ไว้
      const existingData = sheet.getLastRow() > 1 ? sheet.getRange(2, 1, 1, 9).getValues()[0] : null;
      let accessToken = data.lineChannelAccessToken || "";
      if (accessToken.includes("...") && existingData) {
        accessToken = existingData[5]; // ใช้ค่าเดิมในชีต
      }

      const settingsData = [
        data.bankName || "",
        data.accountNumber || "",
        data.accountHolder || "",
        qrCodeUrl || "",
        data.isShopOpen !== undefined ? data.isShopOpen : true,
        accessToken,
        data.lineOaId || "",
        data.liffId || "",
        data.showLineNotify !== undefined ? data.showLineNotify : true
      ];

      if (sheet.getLastRow() > 1) {
        sheet.getRange(2, 1, 1, 9).setValues([settingsData]);
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
  oSheet.getRange(1, 1, 1, 14).setValues([['id', 'name', 'phone', 'address', 'deliveryMethod', 'paymentMethod', 'cartItems', 'total', 'status', 'createdAt', 'slipFile', 'location', 'remark', 'lineUserId']]);
  oSheet.getRange(1, 1, 1, 14).setFontWeight("bold").setBackground("#f3f3f3");

  let sSheet = ss.getSheetByName('Settings');
  if (!sSheet) sSheet = ss.insertSheet('Settings');
  sSheet.getRange(1, 1, 1, 9).setValues([['bankName', 'accountNumber', 'accountHolder', 'qrCode', 'isShopOpen', 'lineChannelAccessToken', 'lineOaId', 'liffId', 'showLineNotify']]);
  sSheet.getRange(1, 1, 1, 9).setFontWeight("bold").setBackground("#f3f3f3");

  let cSheet = ss.getSheetByName('Categories');
  if (!cSheet) {
    cSheet = ss.insertSheet('Categories');
    cSheet.getRange(1, 1, 1, 3).setValues([['id', 'name', 'icon']]);
    cSheet.getRange(1, 1, 1, 3).setFontWeight("bold").setBackground("#f3f3f3");
    // ใส่หมวดหมู่เริ่มต้น
    cSheet.appendRow(['pizza', 'พิซซ่า', '🍕']);
    cSheet.appendRow(['sontam', 'ส้มตำ', '🥗']);
    cSheet.appendRow(['drink', 'เครื่องดื่ม', '🥤']);
    cSheet.appendRow(['others', 'อื่นๆ', '📦']);
  }
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
    headers = ['id', 'name', 'phone', 'address', 'deliveryMethod', 'paymentMethod', 'cartItems', 'total', 'status', 'createdAt', 'slipFile', 'location', 'remark', 'lineUserId'];
  } else if (sheetName === 'Settings') {
    headers = ['bankName', 'accountNumber', 'accountHolder', 'qrCode', 'isShopOpen', 'lineChannelAccessToken', 'lineOaId', 'liffId', 'showLineNotify'];
  } else if (sheetName === 'Categories') {
    headers = ['id', 'name', 'icon'];
  }

  return data.slice(1).map(row => {
    let obj = {};
    // วนลูปตามหัวข้อที่กำหนดไว้ (Fixed Headers) เพื่อให้แน่ใจว่าข้อมูลครบทุกฟิลด์
    headers.forEach((header, index) => {
      let cellValue = row[index];

      // จัดการค่าว่างให้เป็นค่าเริ่มต้นที่เหมาะสม
      if (cellValue === undefined || cellValue === "") {
        if (header === 'isAvailable' || header === 'isShopOpen') cellValue = true;
        else if (header.startsWith('price')) cellValue = 0;
        else cellValue = "";
      }

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

function sendLineNotification(ss, userId, message) {
  try {
    const settingsSheet = ss.getSheetByName('Settings');
    if (!settingsSheet || settingsSheet.getLastRow() < 2) return;

    const settings = getSheetDataAsJson(settingsSheet)[0];
    const token = settings.lineChannelAccessToken;

    if (!token || !userId) return;

    const url = 'https://api.line.me/v2/bot/message/push';
    const payload = {
      to: userId,
      messages: [
        {
          type: 'text',
          text: message
        }
      ]
    };

    const options = {
      method: 'post',
      contentType: 'application/json',
      headers: {
        Authorization: 'Bearer ' + token
      },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };

    UrlFetchApp.fetch(url, options);
  } catch (e) {
    console.error('Line Notification Error:', e.toString());
  }
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

⚠️ **ข้อควรระวังสำคัญ:** ทุกครั้งที่มีการแก้ไขโค้ดใน Apps Script คุณ **ต้อง** กดปุ่ม **Deploy -> New Deployment** ใหม่ทุกครั้งเพื่อให้แอปใช้งานเวอร์ชันล่าสุดได้ (ห้ามใช้ "Manage Deployments" แล้วแก้เวอร์ชันเดิม เพราะบางครั้ง URL จะไม่รับค่าที่อัปเดตทันที)

---
*หมายเหตุ: โค้ดเวอร์ชันนี้รองรับระบบสินค้าหมดและเปิด-ปิดร้าน โดยการเพิ่มคอลัมน์ใน Google Sheets ให้อัตโนมัติเมื่อสั่งรัน `?action=setup` ผ่าน URL ครับ*
