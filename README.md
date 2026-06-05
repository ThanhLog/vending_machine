<h2 align="center">
    <a href="https://dainam.edu.vn/vi/khoa-cong-nghe-thong-tin">
    🎓 Faculty of Information Technology (DaiNam University)
    </a>
</h2>

# HỆ THỐNG MÁY BÁN HÀNG TỰ ĐỘNG THÔNG MINH TÍCH HỢP BLOCKCHAIN VÀ IoT

<div align="center">
    <p align="center">
        <img src="images/aiotlab_logo.png" alt="AIoTLab Logo" width="170"/>
        <img src="images/fitdnu_logo.png" alt="AIoTLab Logo" width="180"/>
        <img src="images/dnu_logo.png" alt="DaiNam University Logo" width="200"/>
    </p>

[![AIoTLab](https://img.shields.io/badge/AIoTLab-green?style=for-the-badge)](https://www.facebook.com/DNUAIoTLab)
[![Faculty of Information Technology](https://img.shields.io/badge/Faculty%20of%20Information%20Technology-blue?style=for-the-badge)](https://dainam.edu.vn/vi/khoa-cong-nghe-thong-tin)
[![DaiNam University](https://img.shields.io/badge/DaiNam%20University-orange?style=for-the-badge)](https://dainam.edu.vn)

</div>

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Blockchain](https://img.shields.io/badge/Blockchain-Sepolia%20Testnet-green)
![Platform](https://img.shields.io/badge/IoT-ESP32-orange)
![Mobile](https://img.shields.io/badge/Mobile-Flutter-blue)


</div>

---

## 📋 MỤC LỤC

1. [Tổng quan dự án](#tổng-quan-dự-án)
2. [Kiến trúc hệ thống](#kiến-trúc-hệ-thống)
3. [Công nghệ sử dụng](#công-nghệ-sử-dụng)
4. [LUỒNG HOẠT ĐỘNG BLOCKCHAIN (CHI TIẾT)](#-luồng-hoạt-động-blockchain-chi-tiết)
5. [Luồng hoạt động toàn hệ thống](#luồng-hoạt-động-toàn-hệ-thống)
6. [Cấu trúc thư mục](#cấu-trúc-thư-mục)
7. [Cài đặt và chạy](#cài-đặt-và-chạy)
8. [API Endpoints](#api-endpoints)
9. [Phần cứng IoT](#phần-cứng-iot)
10. [Kiểm thử](#kiểm-thử)

---

## Tổng quan dự án

Hệ thống máy bán hàng tự động thông minh là giải pháp kết hợp **3 lĩnh vực công nghệ**:

| Lĩnh vực       | Vai trò                                    | Công nghệ                             |
| -------------- | ------------------------------------------ | ------------------------------------- |
| **Blockchain** | Xử lý thanh toán minh bạch, chống gian lận | Ethereum Sepolia, Ethers.js, Web3Auth |
| **IoT**        | Điều khiển phần cứng máy bán hàng thực tế  | ESP32, Cảm biến IR, Động cơ DC, TFT   |
| **Mobile**     | Giao diện người dùng, ví điện tử           | Flutter, web3dart, BLoC               |

### 🎯 Mục tiêu

- **Minh bạch:** Mọi giao dịch được ghi vĩnh viễn trên blockchain, không thể thay đổi
- **Phi tập trung:** Người dùng thanh toán trực tiếp (peer-to-peer) không qua trung gian
- **Tự động hóa:** ESP32 tự động nhận lệnh và phân phối sản phẩm
- **Trải nghiệm liền mạch:** Đăng nhập Google → Ví Web3 → Mua hàng trong tích tắc

---

## Kiến trúc hệ thống

Hệ thống được thiết kế theo **kiến trúc 5 lớp (5-Layer Architecture)**:

```
┌──────────────────────────────────────────────────────────────┐
│                  LỚP 5: ỨNG DỤNG DI ĐỘNG                       │
│            Flutter App (Android / iOS / Web)                   │
│    Web3Auth (Google Login)  │  Wallet Service  │  BLoC        │
├──────────────────────────────────────────────────────────────┤
│                  LỚP 4: BLOCKCHAIN                             │
│              Ethereum Sepolia Testnet                          │
│    User Wallet ───ETH Transfer (0.001 ETH)──> Vending Wallet  │
├──────────────────────────────────────────────────────────────┤
│                  LỚP 3: BACKEND                                │
│         Node.js / Express / Socket.io / Firebase              │
│    Auth │ Queue Manager │ Tx Verifier │ Command Service       │
├──────────────────────────────────────────────────────────────┤
│                  LỚP 2: FIRMWARE (ESP32)                       │
│            PlatformIO / Arduino / C++                          │
│    WiFi AP+STA │ TFT Display │ Vending State Machine          │
├──────────────────────────────────────────────────────────────┤
│                  LỚP 1: PHẦN CỨNG                              │
│    4x Motor DC │ 5x IR Sensor │ Servo Door │ Buzzer │ GPS     │
│    ST7789 TFT 240×320 │ ESP32 DOIT DevKit V1                  │
└──────────────────────────────────────────────────────────────┘
```

### Sơ đồ giao tiếp giữa các thành phần

```
[Mobile App] <──WebSocket──> [Backend Server] <──HTTP/REST──> [ESP32]
     │                             │                              │
     │ Web3Auth + web3dart         │ Ethers.js                    │ GPIO
     │ Google Login                │ Firebase Firestore           │ SPI/I2C/UART
     │                             │                              │
     └──────────┬──────────────────┘                              │
                │                                                 │
                ▼                                                 ▼
     [Ethereum Sepolia Testnet]                    [Motor, IR, TFT, Buzzer]
      User Wallet → Vending Wallet
      (0.001 ETH per product)
```

---

## Công nghệ sử dụng

### Backend (`be/`)

| Công nghệ      | Phiên bản | Vai trò                           |
| -------------- | --------- | --------------------------------- |
| Node.js        | -         | Runtime JavaScript                |
| Express        | 5.x       | Web framework, REST API           |
| Ethers.js      | 6.x       | Tương tác với Ethereum blockchain |
| Socket.io      | 4.x       | Giao tiếp real-time WebSocket     |
| Firebase Admin | 13.x      | Firestore database, Auth          |
| bcryptjs       | 3.x       | Mã hóa mật khẩu admin             |
| jsonwebtoken   | 9.x       | JWT authentication                |
| Swagger        | 6.x       | API Documentation                 |

### IoT (`iot/`)

| Công nghệ            | Vai trò               |
| -------------------- | --------------------- |
| ESP32 DOIT DevKit V1 | Vi điều khiển chính   |
| PlatformIO           | Build system          |
| Arduino Framework    | Thư viện phần cứng    |
| WiFi (AP+STA)        | Kết nối mạng          |
| TFT ST7789 240×320   | Màn hình hiển thị     |
| HTTP Client          | Giao tiếp với Backend |

### Mobile (`mobile/`)

| Công nghệ        | Phiên bản | Vai trò                       |
| ---------------- | --------- | ----------------------------- |
| Flutter          | 3.x       | Cross-platform framework      |
| Dart             | 3.8+      | Ngôn ngữ lập trình            |
| BLoC             | 9.x       | State management              |
| web3dart         | 2.7+      | Tương tác Ethereum từ Flutter |
| Web3Auth         | 6.x       | Login Google → Tạo ví MPC     |
| Socket.io Client | 3.x       | Real-time với backend         |
| Geolocator       | 11.x      | GPS proximity                 |

---

## 🔑 LUỒNG HOẠT ĐỘNG BLOCKCHAIN (CHI TIẾT)

> ⚠️ **Đây là phần quan trọng nhất cho môn thi Blockchain.** Hãy nắm vững toàn bộ luồng bên dưới.

### 1. Blockchain là gì trong hệ thống này?

Blockchain được sử dụng như một **lớp thanh toán phi tập trung**. Thay vì thanh toán qua ngân hàng hay ví điện tử truyền thống, người dùng gửi trực tiếp **ETH** (Ether) từ ví của họ đến ví của máy bán hàng trên mạng **Ethereum Sepolia Testnet**.

**Tại sao dùng Blockchain?**

- 🛡️ **Minh bạch:** Mọi giao dịch được ghi công khai trên blockchain, ai cũng có thể xem
- 🔒 **Bất biến:** Giao dịch đã ghi không thể sửa đổi hay xóa bỏ
- 🚫 **Chống gian lận:** Không thể giả mạo giao dịch hay chi tiêu gấp đôi
- 🔑 **Tự chủ:** Người dùng kiểm soát ví riêng, không phụ thuộc bên thứ ba

### 2. Mạng Blockchain sử dụng

| Tham số                | Giá trị                                       |
| ---------------------- | --------------------------------------------- |
| **Mạng**               | Ethereum Sepolia Testnet                      |
| **Chain ID**           | `11155111`                                    |
| **RPC URL**            | `https://ethereum-sepolia-rpc.publicnode.com` |
| **Ví nhận thanh toán** | `0x94988621cDd1aCEAa0284f65cb2EBE0B40AD7c85`  |
| **Giá sản phẩm**       | `0.001 ETH`                                   |
| **Thời gian xác nhận** | Tối đa 60 giây                                |

> **Sepolia** là mạng thử nghiệm (testnet) → ETH trên này không có giá trị thực, dùng để test.

### 3. Cấu trúc một giao dịch Ethereum

Mỗi giao dịch thanh toán trong hệ thống có cấu trúc:

```
Transaction {
  from:       "0x..."     // Địa chỉ ví người mua (do Web3Auth tạo)
  to:         "0x9498..." // Địa chỉ ví máy bán hàng
  value:      0.001       // Số ETH thanh toán (= 10^15 wei)
  chainId:    11155111    // Mạng Sepolia
  gasLimit:   21000       // Gas cho giao dịch ETH đơn giản
  gasPrice:   +50%        // Backend đề xuất tăng 50% để nhanh hơn
  nonce:      N           // Số thứ tự giao dịch của người gửi
  data:       "0x"        // Không có data (giao dịch ETH thuần)
  v, r, s:    [...]       // Chữ ký số ECDSA
}
```

### 4. Các bước một giao dịch blockchain hoàn chỉnh

#### Sơ đồ tổng quan

```
NGƯỜI DÙNG (App Flutter)
    │
    │ (1) Web3Auth: Đăng nhập Google → Nhận ví Ethereum (MPC)
    │
    │ (2) Ký nonce bằng private key → Backend xác thực → Nhận JWT
    │
    │ (3) Tham gia hàng đợi → Đến lượt → Chọn sản phẩm
    │
    │ (4) Gửi 0.001 ETH đến ví máy bán hàng
    │     web3dart: sendTransaction(to, value)
    │
    ▼
ETHEREUM SEPOLIA TESTNET
    │
    │ (5) Giao dịch vào mempool (chờ xử lý)
    │ (6) Validator chọn giao dịch, đưa vào khối mới
    │ (7) Khối được xác nhận → Giao dịch hoàn tất
    │
    ▼
BACKEND (Xác minh 5 bước)
    │
    │ [Bước 1] provider.getTransaction(txHash) → Kiểm tra tồn tại
    │ [Bước 2] tx.chainId === 11155111? → Đúng mạng?
    │ [Bước 3] tx.to === VENDING_WALLET? → Đúng người nhận?
    │ [Bước 4] tx.value >= 0.001 ETH? → Đủ tiền?
    │ [Bước 5] Poll receipt mỗi 3s, tối đa 60s → Đã xác nhận?
    │
    ▼
KẾT QUẢ
    │
    ├── Hợp lệ → Tạo lệnh phân phối → ESP32 nhả hàng
    └── Không hợp lệ → Trả lỗi cho người dùng
```

#### Chi tiết từng bước xác minh (QUAN TRỌNG CHO BÀI THI)

**Bước 1: Kiểm tra giao dịch tồn tại**

```javascript
const tx = await provider.getTransaction(txHash);
if (!tx) {
  return { valid: false, reason: "Transaction not found on chain" };
}
```

- Backend dùng Ethers.js gọi RPC đến mạng Sepolia
- Nếu `tx = null`: txHash không tồn tại → có thể chưa được broadcast hoặc sai hash

**Bước 2: Kiểm tra Chain ID**

```javascript
if (tx.chainId !== BigInt(11155111)) {
  return { valid: false, reason: "Wrong chain" };
}
```

- **Mục đích:** Ngăn chặn **Replay Attack** — kẻ tấn công không thể dùng giao dịch từ mạng khác (ví dụ: Ethereum Mainnet chainId=1) để giả mạo thanh toán trên Sepolia
- Chain ID là định danh duy nhất của mỗi blockchain

**Bước 3: Kiểm tra địa chỉ nhận**

```javascript
if (tx.to.toLowerCase() !== VENDING_WALLET.toLowerCase()) {
  return { valid: false, reason: "Wrong recipient" };
}
```

- Đảm bảo ETH được gửi đến **đúng** ví của máy bán hàng
- So sánh không phân biệt hoa thường (`.toLowerCase()`)

**Bước 4: Kiểm tra số tiền**

```javascript
const expectedWei = ethers.parseEther("0.001"); // 0.001 ETH = 10^15 wei
if (tx.value < expectedWei) {
  return { valid: false, reason: "Insufficient amount" };
}
```

- **1 ETH = 10¹⁸ wei** (wei là đơn vị nhỏ nhất của ETH)
- `ethers.parseEther()` chuyển đổi ETH → wei
- Dùng `BigInt` để so sánh → tránh lỗi làm tròn của số thực JavaScript

**Bước 5: Đợi xác nhận giao dịch (Confirmation)**

```javascript
let receipt = await provider.getTransactionReceipt(txHash);
if (!receipt) {
  // Poll mỗi 3 giây, tối đa 20 lần (60 giây)
  for (let i = 0; i < 20; i++) {
    await sleep(3000);
    receipt = await provider.getTransactionReceipt(txHash);
    if (receipt) break;
  }
}
if (receipt.status === 0) {
  return { valid: false, reason: "Transaction reverted" };
}
```

- Giao dịch cần được **khai thác (mined)** vào một khối
- `receipt.status === 1` → thành công
- `receipt.status === 0` → thất bại (reverted), người dùng mất phí gas

### 5. Mô hình Oracle Pattern

Hệ thống sử dụng **Oracle Pattern** — một mẫu thiết kế quan trọng trong blockchain:

```
┌──────────────────────────────────────────────────────────────┐
│                     ORACLE PATTERN                             │
│                                                                │
│   BLOCKCHAIN (On-chain)          THẾ GIỚI THỰC (Off-chain)    │
│   ┌─────────────────────┐       ┌─────────────────────────┐   │
│   │ Giao dịch ETH       │       │ Máy bán hàng vật lý     │   │
│   │ (bất biến, công khai)│       │ (ESP32, motor, sensor)  │   │
│   └──────────┬──────────┘       └───────────┬─────────────┘   │
│              │                               │                 │
│              └───────────┬───────────────────┘                 │
│                          │                                     │
│                   ┌──────▼──────┐                              │
│                   │   BACKEND   │  ← ORACLE                    │
│                   │  (cầu nối)  │                              │
│                   └─────────────┘                              │
│                                                                │
│   Backend theo dõi blockchain → Khi phát hiện giao dịch       │
│   hợp lệ → Kích hoạt ESP32 phân phối sản phẩm thực tế         │
└──────────────────────────────────────────────────────────────┘
```

- **Oracle** là cầu nối giữa thế giới blockchain (on-chain) và thế giới thực (off-chain)
- Trong tương lai có thể nâng cấp lên **Chainlink** để tăng tính phi tập trung

### 6. Xác thực Web3 (Web3Auth + EIP-191)

Người dùng không cần tạo ví thủ công — Web3Auth cho phép đăng nhập Google để tạo ví **MPC (Multi-Party Computation)**:

```
Người dùng → Google Login → Web3Auth → Ví MPC (private key được chia thành nhiều mảnh)
                                                │
                              ┌─────────────────┬┴─────────────────┐
                              │ Device Share     │ Auth Network     │ Recovery
                              │ (thiết bị user)  │ (Web3Auth server)│ (dự phòng)
                              └─────────────────┴──────────────────┘
                               Ký giao dịch = các bên cùng tính toán
                               (không cần tái tạo khóa đầy đủ)
```

**Luồng xác thực EIP-191 (Sign-in with Ethereum):**

| #   | Hành động                | Mô tả                                                                 |
| --- | ------------------------ | --------------------------------------------------------------------- |
| 1   | `GET /api/auth/nonce`    | Backend tạo nonce ngẫu nhiên 32 bytes                                 |
| 2   | Ký nonce                 | App ký message "Sign this message to login: {nonce}" bằng private key |
| 3   | `POST /api/auth/login`   | Gửi `{ address, signature }` lên backend                              |
| 4   | `ethers.verifyMessage()` | Backend recover địa chỉ từ chữ ký, so khớp với address                |
| 5   | JWT Token                | Nếu khớp → cấp JWT (hết hạn 24h)                                      |

### 7. Các trường hợp lỗi blockchain và cách xử lý

| Lỗi                         | Nguyên nhân                                            | Cách xử lý                                           |
| --------------------------- | ------------------------------------------------------ | ---------------------------------------------------- |
| **Transaction not found**   | txHash không tồn tại trên blockchain                   | Báo lỗi, yêu cầu gửi lại giao dịch                   |
| **Wrong chain**             | Giao dịch được gửi trên mạng khác (Mainnet, Goerli...) | Báo lỗi, yêu cầu chuyển sang Sepolia                 |
| **Wrong recipient**         | ETH gửi sai địa chỉ ví                                 | Báo lỗi, ETH đã mất (blockchain không thể hoàn tiền) |
| **Insufficient amount**     | Gửi thiếu ETH (< 0.001)                                | Báo lỗi, yêu cầu gửi bổ sung                         |
| **Not confirmed after 60s** | Mạng nghẽn, gas quá thấp                               | Báo lỗi timeout, yêu cầu thử lại                     |
| **Transaction reverted**    | Giao dịch bị revert (hết gas, lỗi logic...)            | Báo lỗi, người dùng mất phí gas                      |
| **Sender mismatch**         | Người gửi tx không phải người dùng hiện tại            | Báo lỗi, từ chối (chống gian lận)                    |

---

## Luồng hoạt động toàn hệ thống

### End-to-End Flow (Người dùng → Blockchain → ESP32 → Sản phẩm)

```
NGƯỜI DÙNG                           BACKEND                    BLOCKCHAIN              ESP32
    │                                    │                          │                     │
    │① Mở app, đăng nhập Google         │                          │                     │
    │──Web3Auth──> Nhận ví MPC          │                          │                     │
    │                                    │                          │                     │
    │② GET /auth/nonce                  │                          │                     │
    │──ký nonce──> POST /auth/login     │                          │                     │
    │<────── JWT Token ─────────────────│                          │                     │
    │                                    │                          │                     │
    │③ GPS tìm máy gần nhất (≤100m)     │                          │                     │
    │──GET /vending (lat, lng)──────────>                          │                     │
    │<──Danh sách máy───────────────────│                          │                     │
    │                                    │                          │                     │
    │④ Tham gia hàng đợi                │                          │                     │
    │──POST /vending/:id/connect────────>                          │                     │
    │<──Vị trí queue, thời gian chờ─────│                          │                     │
    │                                    │                          │                     │
    │⑤ WebSocket: "turn_ready"          │                          │                     │
    │<──Đến lượt bạn!───────────────────│                          │                     │
    │                                    │                          │                     │
    │⑥ Chọn sản phẩm, gửi ETH           │                          │                     │
    │───0.001 ETH────────────────────────────────────────────────>│                     │
    │                                    │                          │                     │
    │⑦ POST /product/purchase (txHash)  │                          │                     │
    │───────────────────────────────────>│                          │                     │
    │                                    │──getTransaction()───────>│                     │
    │                                    │<──tx data────────────────│                     │
    │                                    │──verify 5 bước──────────>│                     │
    │                                    │<──receipt OK─────────────│                     │
    │                                    │                          │                     │
    │                                    │──Tạo Order + Command─────│                     │
    │<──Order created (WebSocket)───────│                          │                     │
    │                                    │                          │                     │
    │                                    │               ⑧ Poll /command/pending        │
    │                                    │<──GET /pending──────────────────────────────│
    │                                    │──Command data──────────────────────────────>│
    │                                    │                          │                     │
    │                                    │                          │    ⑨ Chạy motor 3s │
    │                                    │                          │    IR sensor check │
    │                                    │                          │    Mở cửa servo    │
    │                                    │                          │                     │
    │                                    │<──PUT /cmd/status────────│                     │
    │                                    │                          │                     │
    │<──Purchase Success! (WebSocket)───│                          │                     │
    │                                    │                          │                     │
    │⑩ Mua tiếp hoặc kết thúc           │                          │                     │
    │──POST /vending/:id/finish-shopping>                          │                     │
    │                                    │──Serve next in queue────│                     │
    │                                    │──WebSocket "turn_ready" │                     │
    │                                    │  to next user           │                     │
```

### Các trạng thái đơn hàng

```
waiting → processing → completed
                    ↘ failed → retry → completed
```

### Các trạng thái hàng đợi

```
waiting → serving → completed
                 → expired (sau 120s timeout)
                 → cancelled
```

---

## Cấu trúc thư mục

```
vending_machine/
├── README.md                          # ← File này
├── BAO_CAO_CUOI_KHOA_BLOCKCHAIN.md    # Báo cáo cuối khóa đầy đủ
│
├── be/                                # 🔧 BACKEND - Node.js/Express
│   ├── src/
│   │   ├── server.js                  # Entry point, Express + Socket.io + Swagger
│   │   ├── config/
│   │   │   ├── env.js                 # Biến môi trường (.env)
│   │   │   ├── blockchain.js          # Cấu hình Ethers.js Provider
│   │   │   └── firebase.js            # Firebase Admin SDK
│   │   ├── routes/
│   │   │   ├── auth.routes.js         # Xác thực Web3 (EIP-191)
│   │   │   ├── vending.routes.js      # Máy bán hàng + Hàng đợi
│   │   │   ├── product.routes.js      # Sản phẩm + Mua hàng
│   │   │   ├── command.routes.js      # Lệnh phân phối (ESP32)
│   │   │   ├── device.routes.js       # Đăng ký thiết bị IoT
│   │   │   ├── wallet.routes.js       # Ví + Lịch sử
│   │   │   └── admin.routes.js        # Admin Dashboard
│   │   ├── services/
│   │   │   ├── blockchain.service.js  # ⭐ Xác minh giao dịch (5 bước)
│   │   │   ├── vending.service.js     # Logic nghiệp vụ chính
│   │   │   ├── command.service.js     # Quản lý lệnh ESP32
│   │   │   ├── firebase.service.js    # CRUD Firestore
│   │   │   ├── notification.service.js# Socket.io events
│   │   │   └── wallet.service.js      # Proxy blockchain
│   │   ├── middlewares/
│   │   │   └── auth.middleware.js      # JWT Auth middleware
│   │   └── cli/index.js               # Admin CLI
│   ├── .env                           # Cấu hình môi trường
│   ├── package.json
│   └── serviceAccountKey.json         # Firebase credentials
│
├── iot/                               # 🔌 FIRMWARE - ESP32/PlatformIO
│   ├── platformio.ini                 # Cấu hình PlatformIO
│   └── src/
│       ├── main.cpp                   # Entry point, main loop (100Hz)
│       ├── config.h                   # WiFi, Backend URL, GPIO
│       ├── pins.h                     # Pin definitions
│       ├── network/                   # WiFi AP+STA, Captive DNS
│       ├── tft/                       # 6 màn hình UI (TFT ST7789)
│       ├── motor/                     # Điều khiển 4 motor DC
│       ├── buzzer/                    # Còi buzzer + nhạc
│       └── services/
│           ├── backend/               # Poll HTTP, Heartbeat
│           ├── vending/               # State machine
│           ├── time/                  # NTP sync
│           └── weather/               # Weather data
│
├── mobile/                            # 📱 MOBILE - Flutter/Dart
│   └── lib/
│       ├── main.dart                  # Entry point
│       ├── config/                    # API config, Theme
│       ├── models/                    # Data models
│       ├── services/                  # API, Wallet, Socket, GPS
│       ├── blocs/                     # BLoC state management
│       └── screens/                   # UI screens
│
└── docs_blockchain/                   # 📚 Tài liệu tham khảo Blockchain
    ├── Bai 1- Tong quan ve cong nghe Blockchain (1).pdf
    ├── Bai 1- Tong quan ve cong nghe Blockchain (2).pdf
    ├── Bai 3- Mat ma trong Blockchain.pdf
    └── Bai 4- Hop dong thong minh.pdf
```

---

## Cài đặt và chạy

### Yêu cầu hệ thống

- **Node.js** ≥ 18.x
- **Flutter SDK** ≥ 3.x
- **PlatformIO** (VS Code extension)
- **ESP32 USB Driver** (CP210x hoặc CH340)
- **Git**

### 1. Backend

```powershell
# Di chuyển vào thư mục backend
cd be

# Cài đặt dependencies
npm install

# Tạo file .env (chỉnh sửa theo cấu hình của bạn)
Copy-Item .env.example .env

# Chạy development server (hot-reload)
npm run dev

# Hoặc chạy production
npm start
```

Backend chạy tại: `http://localhost:3000`
Swagger API Docs: `http://localhost:3000/api-docs`

### 2. Firmware ESP32

```powershell
# Mở thư mục iot bằng VS Code với PlatformIO
code iot

# Build firmware
pio run

# Upload lên ESP32 (đảm bảo ESP32 đã kết nối qua USB)
pio run --target upload

# Xem Serial Monitor
pio device monitor --baud 115200
```

Cấu hình WiFi cho ESP32:

1. ESP32 tạo AP WiFi: **SSID:** `Vending_Setup`, **Password:** `12345678`
2. Kết nối vào WiFi đó → Mở trình duyệt → Vào `192.168.4.1`
3. Nhập thông tin WiFi nhà bạn → ESP32 kết nối internet

### 3. Mobile App

```powershell
# Di chuyển vào thư mục mobile
cd mobile

# Cài đặt dependencies
flutter pub get

# Tạo file .env với Web3Auth Client ID
echo "CLIENT_ID_WEB3AUTH = YOUR_WEB3AUTH_CLIENT_ID" > .env

# Chạy app (kết nối thiết bị hoặc emulator)
flutter run
```

---

## API Endpoints

| Method               | Endpoint                                         | Mô tả                         | Auth |
| -------------------- | ------------------------------------------------ | ----------------------------- | ---- |
| **Auth**             |                                                  |                               |      |
| `GET`                | `/api/auth/nonce`                                | Lấy nonce cho ví              | ❌   |
| `POST`               | `/api/auth/login`                                | Đăng nhập bằng chữ ký EIP-191 | ❌   |
| **Vending Machines** |                                                  |                               |      |
| `GET`                | `/api/vending`                                   | Danh sách máy (có GPS filter) | ✅   |
| `GET`                | `/api/vending/:id`                               | Chi tiết máy + sản phẩm       | ✅   |
| `POST`               | `/api/vending/:id/connect`                       | Tham gia hàng đợi             | ✅   |
| `GET`                | `/api/vending/:id/queue/status`                  | Vị trí hàng đợi               | ✅   |
| `POST`               | `/api/vending/:id/serve-next`                    | Phục vụ người tiếp            | ✅   |
| `POST`               | `/api/vending/:id/finish-shopping`               | Kết thúc phiên                | ✅   |
| **Products**         |                                                  |                               |      |
| `POST`               | `/api/product/purchase`                          | Mua hàng (kèm txHash)         | ✅   |
| `POST`               | `/api/product/retry`                             | Thử lại phân phối             | ✅   |
| `GET`                | `/api/product/machine/:id`                       | Danh sách sản phẩm            | ✅   |
| **Commands (ESP32)** |                                                  |                               |      |
| `GET`                | `/api/command/machine/:id/pending`               | ESP32 poll lệnh               | ✅   |
| `PUT`                | `/api/command/machine/:id/command/:cmdId/status` | Báo kết quả                   | ✅   |
| **Wallet**           |                                                  |                               |      |
| `GET`                | `/api/wallet/:address/balance`                   | Số dư ví ETH                  | ✅   |
| `GET`                | `/api/wallet/:address/history`                   | Lịch sử mua hàng              | ✅   |
| **Device**           |                                                  |                               |      |
| `POST`               | `/api/device/machine`                            | Đăng ký máy mới               | ✅   |
| `PUT`                | `/api/device/machine/:id`                        | Heartbeat cập nhật            | ✅   |

---

## Phần cứng IoT

### Linh kiện

| STT | Linh kiện             | Model                    | Số lượng |
| --- | --------------------- | ------------------------ | -------- |
| 1   | Vi điều khiển         | ESP32 DOIT DevKit V1     | 1        |
| 2   | Màn hình TFT          | ST7789 240×320 SPI       | 1        |
| 3   | Động cơ DC + H-Bridge | L9110S                   | 4        |
| 4   | Cảm biến hồng ngoại   | TCRT5000                 | 5        |
| 5   | Servo (cửa)           | SG90                     | 1        |
| 6   | Còi Buzzer            | Piezo 5V                 | 1        |
| 7   | Module GPS            | NEO-6M                   | 1        |
| 8   | Nguồn                 | 12V 5A + Mạch giảm áp 5V | 1        |

### Sơ đồ chân GPIO

| Chức năng          | GPIO               |
| ------------------ | ------------------ |
| TFT SCK            | 18                 |
| TFT MOSI           | 23                 |
| TFT RST            | 21                 |
| TFT DC             | 22                 |
| TFT CS             | 5                  |
| Motor A1 (INA/INB) | 16, 17             |
| Motor A2 (INA/INB) | 25, 26             |
| Motor A3 (INA/INB) | 27, 14             |
| Motor B1 (INA/INB) | 12, 13             |
| IR Sensor 1-5      | 32, 33, 34, 35, 39 |
| Servo              | 15                 |
| Buzzer             | 4                  |
| GPS RX/TX          | 36, 37             |

### Trạng thái màn hình TFT

| Màn hình     | Mô tả                                          |
| ------------ | ---------------------------------------------- |
| `WIFI_SETUP` | Cấu hình WiFi (hiển thị SSID, IP)              |
| `IDLE`       | Màn hình chờ (số thứ tự, đồng hồ, thời tiết)   |
| `SELECT`     | Chọn sản phẩm (lưới 4 món, giá ETH)            |
| `PROCESSING` | Đang xử lý (animation spinner)                 |
| `SUCCESS`    | Thành công (dấu tick xanh, hướng dẫn lấy hàng) |
| `ERROR`      | Lỗi (dấu X đỏ, mã lỗi)                         |

---

## Kiểm thử

Hệ thống đã vượt qua **15 test case** bao gồm:

### Blockchain Tests

- Giao dịch hợp lệ → Xác minh thành công
- txHash không tồn tại → Báo lỗi
- Sai Chain ID → Từ chối
- Sai địa chỉ nhận → Từ chối
- Thiếu tiền → Từ chối
- Giao dịch chưa confirm → Timeout sau 60s

### IoT Tests

- ESP32 kết nối WiFi → Poll lệnh thành công
- Motor chạy 3 giây → Sản phẩm rơi
- Cảm biến IR phát hiện → Xác nhận dispense
- Servo mở/đóng cửa → Đúng thời gian
- Màn hình TFT → 6 trạng thái UI hoạt động

### Integration Tests

- Đăng nhập → Nhận JWT → Tham gia hàng đợi
- Gửi ETH → Backend verify → ESP32 dispense → App nhận kết quả
- Hết hạn queue 120s → Tự động phục vụ người kế
- Race condition → Không 2 người cùng được phục vụ

---

## Hướng phát triển

### Ngắn hạn

- [ ] Triển khai Smart Contract tùy chỉnh (Solidity) thay vì ETH transfer thuần
- [ ] Hỗ trợ thanh toán bằng ERC-20 tokens (USDT, USDC...)
- [ ] Tích hợp Chainlink Oracle để tăng phi tập trung

### Trung hạn

- [ ] Chuyển sang mạng Layer 2 (Arbitrum, Optimism) để giảm phí gas
- [ ] Multi-machine support: một backend quản lý nhiều ESP32
- [ ] NFT receipt cho mỗi giao dịch mua hàng

### Dài hạn

- [ ] Chuyển sang mạng riêng (private blockchain) cho doanh nghiệp
- [ ] AI/ML dự đoán nhu cầu, tối ưu inventory
- [ ] Token loyalty program cho khách hàng thân thiết

---

## Tài liệu tham khảo

- [Ethereum Documentation](https://ethereum.org/en/developers/docs/)
- [Ethers.js v6 Documentation](https://docs.ethers.org/v6/)
- [Web3Auth Documentation](https://web3auth.io/docs/)
- [ESP32 Arduino Core](https://docs.espressif.com/projects/arduino-esp32/)
- [Flutter Documentation](https://flutter.dev/docs)
- [EIP-191: Signed Data Standard](https://eips.ethereum.org/EIPS/eip-191)

---

<div align="center">

**👨‍🎓 Đồ án cuối khóa môn Công nghệ Blockchain**

_Hà Nội, tháng 6 năm 2026_

</div>

