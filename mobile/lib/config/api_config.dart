class ApiConfig {
  // 👇 Đổi thành ngrok URL sau khi chạy: npx ngrok http 3000
  // Ví dụ: static const String baseUrl = 'https://xxxx-xxx-xxx.ngrok-free.app';
  static const String baseUrl = 'https://apivendingmachine.thiephaoy.shop';

  // REST endpoints
  static const String authNonce = '/api/auth/nonce';
  static const String authLogin = '/api/auth/login';
  static const String vendingList = '/api/vending';
  static String vendingDetail(String id) => '/api/vending/$id';
  static String vendingConnect(String id) => '/api/vending/$id/connect';
  static String queueStatus(String id) => '/api/vending/$id/queue/status';
  static String serveNext(String id) => '/api/vending/$id/serve-next';
  static String finishShopping(String id) => '/api/vending/$id/finish-shopping';
  static const String purchase = '/api/product/purchase';
  static String machineSlots(String id) => '/api/product/machine/$id';
  static String walletBalance(String address) => '/api/wallet/$address/balance';
  static String walletHistory(String address) => '/api/wallet/$address/history';

  // Command (ESP32 dispense tracking)
  static String commandStatus(String machineId, String cmdId) =>
      '/api/command/machine/$machineId/command/$cmdId';

  // ESP32 local (for WiFi verification)
  static const String esp32LocalStatus = 'http://192.168.4.1/api/status';

  // WebSocket
  static const String socketUrl = baseUrl;
}
