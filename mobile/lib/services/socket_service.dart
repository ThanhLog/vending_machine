import 'package:socket_io_client/socket_io_client.dart' as io;
import '../config/api_config.dart';

class SocketService {
  io.Socket? _socket;

  final void Function(Map<String, dynamic>)? onTurnReady;
  final void Function(Map<String, dynamic>)? onTurnExpired;
  final void Function(Map<String, dynamic>)? onQueueUpdate;
  final void Function(Map<String, dynamic>)? onPurchaseComplete;
  final void Function()? onConnected;
  final void Function()? onDisconnected;

  SocketService({
    this.onTurnReady,
    this.onTurnExpired,
    this.onQueueUpdate,
    this.onPurchaseComplete,
    this.onConnected,
    this.onDisconnected,
  });

  bool get isConnected => _socket?.connected ?? false;

  void connect() {
    _socket = io.io(
      ApiConfig.socketUrl,
      io.OptionBuilder()
          .setTransports(['websocket'])
          .disableAutoConnect()
          .build(),
    );

    _socket!
      ..connect()
      ..onConnect((_) => onConnected?.call())
      ..onDisconnect((_) => onDisconnected?.call())
      ..on('turn_ready', (data) => onTurnReady?.call(_toMap(data)))
      ..on('turn_expired', (data) => onTurnExpired?.call(_toMap(data)))
      ..on('queue_update', (data) => onQueueUpdate?.call(_toMap(data)))
      ..on('purchase_complete', (data) => onPurchaseComplete?.call(_toMap(data)));
  }

  void joinQueue(String machineId) {
    _socket?.emit('join_queue', machineId);
  }

  void joinMachine(String machineId) {
    _socket?.emit('join_machine', machineId);
  }

  void leaveQueue(String machineId) {
    _socket?.emit('leave_queue', machineId);
  }

  void leaveMachine(String machineId) {
    _socket?.emit('leave_machine', machineId);
  }

  void disconnect() {
    _socket?.disconnect();
    _socket?.dispose();
    _socket = null;
  }

  Map<String, dynamic> _toMap(dynamic data) {
    if (data is Map) return Map<String, dynamic>.from(data);
    return {};
  }
}
