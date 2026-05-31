import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/api_config.dart';

class ApiService {
  final http.Client _client = http.Client();

  // ── Auth ──────────────────────────────────────────────
  Future<String> getNonce() async {
    final res = await _client.get(
      Uri.parse('${ApiConfig.baseUrl}${ApiConfig.authNonce}'),
    );
    final body = json.decode(res.body);
    return body['data']['nonce'];
  }

  Future<Map<String, dynamic>> login(
    String walletAddress,
    String signature,
    String message,
  ) async {
    final res = await _client.post(
      Uri.parse('${ApiConfig.baseUrl}${ApiConfig.authLogin}'),
      headers: {'Content-Type': 'application/json'},
      body: json.encode({
        'walletAddress': walletAddress,
        'signature': signature,
        'message': message,
      }),
    );
    return json.decode(res.body)['data'];
  }

  // ── Vending Machines ─────────────────────────────────
  Future<List<Map<String, dynamic>>> getMachines({
    double? lat,
    double? lng,
  }) async {
    print('Fetching machines with lat: $lat, lng: $lng');
    String url = '${ApiConfig.baseUrl}${ApiConfig.vendingList}';
    if (lat != null && lng != null) {
      url += '?lat=$lat&lng=$lng';
    }
    final res = await _client.get(Uri.parse(url));
    return List<Map<String, dynamic>>.from(json.decode(res.body)['data']);
  }

  Future<Map<String, dynamic>> getMachineDetail(String machineId) async {
    final res = await _client.get(
      Uri.parse('${ApiConfig.baseUrl}${ApiConfig.vendingDetail(machineId)}'),
    );
    return json.decode(res.body)['data'];
  }

  Future<Map<String, dynamic>> connectToMachine(
    String machineId,
    String walletAddress,
  ) async {
    final res = await _client.post(
      Uri.parse('${ApiConfig.baseUrl}${ApiConfig.vendingConnect(machineId)}'),
      headers: {'Content-Type': 'application/json'},
      body: json.encode({'walletAddress': walletAddress}),
    );
    return json.decode(res.body)['data'];
  }

  Future<Map<String, dynamic>?> getQueueStatus(
    String machineId,
    String walletAddress,
  ) async {
    final res = await _client.get(
      Uri.parse(
        '${ApiConfig.baseUrl}${ApiConfig.queueStatus(machineId)}?walletAddress=$walletAddress',
      ),
    );
    final body = json.decode(res.body);
    if (body['success'] == false) return null;
    return body['data'];
  }

  // ── Products / Slots ─────────────────────────────────
  Future<List<Map<String, dynamic>>> getMachineSlots(String machineId) async {
    final res = await _client.get(
      Uri.parse('${ApiConfig.baseUrl}${ApiConfig.machineSlots(machineId)}'),
    );
    return List<Map<String, dynamic>>.from(json.decode(res.body)['data']);
  }

  Future<Map<String, dynamic>> purchase({
    required String machineId,
    required String slot,
    required String productName,
    required String txHash,
    required String walletAddress,
  }) async {
    final res = await _client.post(
      Uri.parse('${ApiConfig.baseUrl}${ApiConfig.purchase}'),
      headers: {'Content-Type': 'application/json'},
      body: json.encode({
        'machineId': machineId,
        'slot': slot,
        'productName': productName,
        'txHash': txHash,
        'walletAddress': walletAddress,
      }),
    );
    final body = json.decode(res.body);
    if (body['success'] == false) throw Exception(body['message']);
    return body['data'];
  }

  // ── Command / Dispense Status ────────────────────────
  Future<Map<String, dynamic>?> getCommandStatus(
    String machineId,
    String commandId,
  ) async {
    final res = await _client.get(
      Uri.parse(
        '${ApiConfig.baseUrl}${ApiConfig.commandStatus(machineId, commandId)}',
      ),
    );
    final body = json.decode(res.body);
    if (body['success'] == false) return null;
    return body['data'];
  }

  // ── Finish Shopping ───────────────────────────────────
  Future<Map<String, dynamic>> finishShopping(
    String machineId,
    String walletAddress,
  ) async {
    final res = await _client.post(
      Uri.parse('${ApiConfig.baseUrl}${ApiConfig.finishShopping(machineId)}'),
      headers: {'Content-Type': 'application/json'},
      body: json.encode({'walletAddress': walletAddress}),
    );
    final body = json.decode(res.body);
    if (body['success'] == false) throw Exception(body['message']);
    return body['data'];
  }

  // ── Wallet ───────────────────────────────────────────
  Future<double> getBalance(String address) async {
    final res = await _client.get(
      Uri.parse('${ApiConfig.baseUrl}${ApiConfig.walletBalance(address)}'),
    );
    return double.tryParse(
          json.decode(res.body)['data']['balance'].toString(),
        ) ??
        0;
  }

  Future<List<Map<String, dynamic>>> getHistory(String address) async {
    final res = await _client.get(
      Uri.parse('${ApiConfig.baseUrl}${ApiConfig.walletHistory(address)}'),
    );
    return List<Map<String, dynamic>>.from(json.decode(res.body)['data']);
  }

  void dispose() {
    _client.close();
  }
}
