# Frontend - FB AI Content Manager

Frontend ที่แยกออกจาก Backend ให้ติดต่อผ่าน API เท่านั้น

## 📁 โครงสร้าง

```
frontend/
├── index.html          # หน้าล็อกอิน
├── dashboard.html      # หน้าแดชบอร์ด
├── config.js           # ตั้งค่า API (สำคัญ!)
└── README.md          # ไฟล์นี้
```

## 🚀 วิธีรัน Frontend

### Option 1: ใช้ Python SimpleHTTPServer (ง่ายที่สุด)

```bash
cd frontend
python -m http.server 8080
```

จากนั้นเปิด: `http://localhost:8080`

### Option 2: ใช้ Node.js http-server

```bash
npm install -g http-server
cd frontend
http-server -p 8080
```

### Option 3: ใช้ Apache หรือ Nginx

นำ folder `frontend` ไปวาง DocumentRoot ของ web server

## ⚙️ ตั้งค่า API URL

เปิดไฟล์ **`config.js`** แล้วแก้ค่า `API_BASE`:

```javascript
const CONFIG = {
    // เปลี่ยนค่านี้ให้ตรงกับ Backend URL
    API_BASE: "http://127.0.0.1:8000",
    // ...
};
```

ถ้า Backend รันที่ URL อื่น ให้แก้ค่า `API_BASE` ให้ตรงกัน เช่น:
- Local: `http://127.0.0.1:8000`
- Remote: `http://your-server.com:8000`

## 🔐 การเข้าสู่ระบบ

1. เปิด `index.html` (login page)
2. ใส่ชื่อผู้ใช้: `admin`
3. ใส่รหัสผ่าน: `admin123`
4. กด "เข้าสู่ระบบ"

Token จะเก็บใน localStorage และส่งไปกับ API requests ทั้งหมด

## 📝 ไฟล์ config.js

ไฟล์นี้ควบคุม:
- `API_BASE` - URL ของ Backend API
- `TOKEN_KEY` - ชื่อ key ใน localStorage
- `REQUEST_TIMEOUT` - Timeout สำหรับ API calls
- Helper functions สำหรับการทำงาน

### Helper Functions ที่มี:

```javascript
// ดึง API URL
getApiUrl(path)

// บันทึก token
saveToken(token, username)

// ดึง token
getToken()

// ลบ token
clearToken()

// ตรวจสอบล็อกอิน
isLoggedIn()

// API call พร้อม Authorization header
apiCall(endpoint, options)
```

## 🔗 API Endpoints

Frontend ใช้ API endpoints เหล่านี้:

### Authentication
- `POST /auth/login` - เข้าสู่ระบบ
- `GET /auth/me` - ดึงข้อมูลผู้ใช้ปัจจุบัน

### Data
- `GET /pages` - ดึงรายชื่อเพจ
- `GET /stats/job-summary` - ดึงสถิติงาน

เพิ่มเติมให้ดู Backend [README.md](../README.md)

## 🌐 CORS Configuration

Backend ยอมรับ CORS จากทุกแหล่ง (`allow_origins=["*"]`)

ถ้าต้องการเปลี่ยน ให้แก้ในไฟล์ `main.py` ของ Backend:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080"],  # เปลี่ยนที่นี่
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## ⚠️ Troubleshooting

### ❌ "Cannot connect to API"

- ตรวจสอบว่า Backend กำลังรัน
- ตรวจสอบ `API_BASE` ใน `config.js` ถูกต้อง
- ลองเปิด Browser Console (F12) ดูข้อมูลเพิ่มเติม

### ❌ "Login failed"

- ตรวจสอบชื่อผู้ใช้ (admin) และรหัสผ่าน (admin123)
- ตรวจสอบว่า Backend API กำลังรัน

### ❌ CORS Error

- ตรวจสอบว่า Backend มี CORS enabled
- ดู Browser Console เพื่อหา error details

## 📚 โครงสร้าง Page

### index.html (Login Page)
- Form ล็อกอิน
- ส่งข้อมูล ไป `POST /auth/login`
- บันทึก token ใน localStorage
- Redirect ไป `dashboard.html`

### dashboard.html (Main Dashboard)
- Sidebar Navigation
- ตรวจสอบ Authentication ตอน load
- ดึงข้อมูล API เพื่อแสดง stats
- รองรับการเปลี่ยนหน้า (section)

## 🎨 Styling

ทั้งหมดใช้ **Tailwind CSS** + inline styles
- ไม่ต้อง build ใดๆ
- ไม่ต้องติดตั้ง dependency
- ใช้ CDN

## 🚢 Deploy

เพื่อ deploy ไป production:

1. เปลี่ยน `API_BASE` ใน `config.js` เป็น production URL
2. Copy folder `frontend` ไป web server
3. ตั้งค่า DocumentRoot ให้ชี้ไป `frontend` folder

---

**หมายเหตุ**: Frontend นี้แยกออกจาก Backend โดยสมบูรณ์ สามารถรันบน web server ใดๆ ได้
