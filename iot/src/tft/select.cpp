#include "tft.h"
#include "colors.h"

// Biến bên ngoài
extern int selected;
extern int currentOrderNum; // Số thứ tự mua nước (VD: 001, 002...)

static void drawProductIcon(int x, int y, String type) {
  if (type == "Nuoc" || type == "Pepsi") {
    tft.fillRect(x + 6, y + 2, 8, 16, COLOR_TEXT);
    tft.fillRect(x + 8, y, 4, 3, COLOR_ACCENT);
  } else if (type == "Cafe") {
    tft.fillRoundRect(x + 2, y + 5, 14, 12, 3, COLOR_PRICE);
    tft.drawCircle(x + 16, y + 10, 3, COLOR_PRICE);
  } else { // Snack
    tft.fillTriangle(x, y + 16, x + 10, y, x + 20, y + 16, COLOR_SUBTEXT);
  }
}

// Vẽ thẻ sản phẩm chuyên nghiệp
static void drawProductCard(int x, int y, String name, int price, bool active,
                            String type) {
  uint16_t borderColor = active ? COLOR_ACCENT : COLOR_CARD;

  // Vẽ hiệu ứng đổ bóng/viền sáng
  if (active) {
    tft.drawRoundRect(x - 2, y - 2, 104, 84, 12, COLOR_ACCENT);
    tft.fillRoundRect(x, y, 100, 80, 10, COLOR_CARD);
  } else {
    tft.drawRoundRect(x - 2, y - 2, 104, 84, 12, COLOR_BG);
    tft.fillRoundRect(x, y, 100, 80, 10, COLOR_CARD);
  }

  // Vẽ Icon ở góc phải
  drawProductIcon(x + 72, y + 10, type);

  // Tên sản phẩm
  tft.setTextColor(COLOR_TEXT);
  tft.setTextSize(2);
  tft.setCursor(x + 10, y + 12);
  tft.print(name);

  // Giá tiền
  tft.setTextColor(COLOR_PRICE);
  tft.setTextSize(2);
  tft.setCursor(x + 10, y + 42);
  tft.print(price);
  tft.setTextSize(1);
  tft.print(" .000d");

  // Nút trạng thái "CHỌN" nếu đang active
  if (active) {
    tft.fillRoundRect(x + 25, y + 62, 50, 14, 4, COLOR_ACCENT);
    tft.setTextColor(COLOR_BG);
    tft.setTextSize(1);
    tft.setCursor(x + 35, y + 65);
    tft.print("SELECTED");
  }
}

// ==========================================
// HÀM CHÍNH: DRAW SELECT SCREEN
// ==========================================

void drawSelect() {
  static int lastSelected = -1;
  static bool needsFullRedraw = true;

  if (uiStateChanged) {
    lastSelected = -1;
    needsFullRedraw = true;
  }

  // 1. Vẽ khung cố định (Chỉ vẽ 1 lần khi vào màn hình)
  if (needsFullRedraw) {
    tft.fillScreen(COLOR_BG);

    // Header bar
    tft.fillRoundRect(5, 5, 230, 50, 12, COLOR_CARD);

    tft.setTextColor(COLOR_TEXT);
    tft.setTextSize(2);
    tft.setCursor(15, 22);
    tft.print("MENU");

    // KHU VỰC STT (SỐ THỨ TỰ) - Làm nổi bật
    tft.fillRoundRect(120, 12, 105, 36, 8, COLOR_STT_BG);
    tft.setTextColor(COLOR_SUBTEXT);
    tft.setTextSize(1);
    tft.setCursor(128, 18);
    tft.print("STT MUA:");

    tft.setTextColor(COLOR_TEXT);
    tft.setTextSize(2);
    tft.setCursor(135, 28);
    tft.print("#");
    if (currentOrderNum < 100)
      tft.print("0");
    if (currentOrderNum < 10)
      tft.print("0");
    tft.print(currentOrderNum);

    // Footer hướng dẫn nhỏ bên dưới
    tft.setTextColor(COLOR_SUBTEXT);
    tft.setTextSize(1);
    tft.setCursor(45, 260);
    tft.print("Bam nut de di chuyen");
    tft.setCursor(55, 275);
    tft.print("Giu lau de Xac nhan");

    needsFullRedraw = false;
  }

  // 2. Cập nhật Grid sản phẩm khi thay đổi lựa chọn
  if (selected != lastSelected) {
    // Tọa độ grid 2x2 cân đối trên màn hình 240x320
    drawProductCard(15, 70, "Nuoc", 10, selected == 0, "Nuoc");
    drawProductCard(125, 70, "Pepsi", 12, selected == 1, "Pepsi");
    drawProductCard(15, 165, "Snack", 8, selected == 2, "Snack");
    drawProductCard(125, 165, "Cafe", 15, selected == 3, "Cafe");

    lastSelected = selected;
  }
}
