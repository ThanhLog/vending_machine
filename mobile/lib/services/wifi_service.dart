import 'dart:async';
import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/api_config.dart';

class WifiService {
  static const String _esp32Url = 'http://192.168.4.1/api/status';

  /// Try to reach the ESP32's local API.
  /// Returns true if the ESP32 responds (user is connected to ESP32 WiFi).
  static Future<bool> isConnectedToEsp32() async {
    try {
      final response = await http
          .get(Uri.parse(_esp32Url))
          .timeout(const Duration(seconds: 3));

      if (response.statusCode == 200) {
        final body = json.decode(response.body);
        return body['ok'] == true;
      }
      return false;
    } catch (_) {
      return false;
    }
  }

  /// Get ESP32 status info (vending status, order number, clients).
  static Future<Map<String, dynamic>?> getEsp32Status() async {
    try {
      final response = await http
          .get(Uri.parse(_esp32Url))
          .timeout(const Duration(seconds: 3));

      if (response.statusCode == 200) {
        return json.decode(response.body) as Map<String, dynamic>;
      }
      return null;
    } catch (_) {
      return null;
    }
  }
}
