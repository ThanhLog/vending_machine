import 'dart:async';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:web3dart/web3dart.dart';
import '../../models/queue_entry.dart';
import '../../services/api_service.dart';
import '../../services/socket_service.dart';
import 'queue_state.dart';

class QueueCubit extends Cubit<QueueState> {
  final ApiService _api = ApiService();
  SocketService? _socket;
  Timer? _expiryTimer;

  String _machineId = '';
  String _walletAddress = '';

  QueueCubit() : super(const QueueState());

  // ── Join queue for a machine ──────────────────────────
  Future<void> joinQueue(String machineId, String privateKey) async {
    emit(state.copyWith(isLoading: true, clearError: true));

    try {
      final credentials = EthPrivateKey.fromHex(privateKey);
      final walletAddress = credentials.address.hex;

      _machineId = machineId;
      _walletAddress = walletAddress;

      final data = await _api.connectToMachine(machineId, walletAddress);
      final entry = QueueEntry.fromJson(data);

      emit(state.copyWith(
        isLoading: false,
        queueEntry: entry,
        isMyTurn: entry.isMyTurn,
        queueNumber: entry.position,
        peopleAhead: entry.peopleAhead,
        estimatedWaitMin: entry.estimatedWaitMin,
      ));

      _connectSocket(machineId, walletAddress);

      if (entry.isMyTurn && entry.expiresAt != null) {
        _startExpiryTimer(entry.expiresAt!);
      }
    } catch (e) {
      emit(state.copyWith(
        isLoading: false,
        errorMessage: 'Cannot join queue: $e',
      ));
    }
  }

  // ── Check current queue status ────────────────────────
  Future<void> checkStatus() async {
    if (_machineId.isEmpty || _walletAddress.isEmpty) return;

    final data = await _api.getQueueStatus(_machineId, _walletAddress);
    if (data == null) {
      emit(state.copyWith(errorMessage: 'Not in queue'));
      return;
    }

    final entry = QueueEntry.fromJson(data);
    emit(state.copyWith(
      queueEntry: entry,
      isMyTurn: entry.isMyTurn,
      queueNumber: entry.position,
      peopleAhead: entry.peopleAhead,
      estimatedWaitMin: entry.estimatedWaitMin,
    ));
  }

  // ── WebSocket handlers ────────────────────────────────
  void _connectSocket(String machineId, String walletAddress) {
    _socket?.disconnect();

    _socket = SocketService(
      onTurnReady: (data) {
        emit(state.copyWith(isMyTurn: true, queueNumber: 0, peopleAhead: 0));
        if (data['expiresAt'] != null) {
          _startExpiryTimer(data['expiresAt']);
        }
      },
      onTurnExpired: (data) {
        emit(state.copyWith(
          isMyTurn: false,
          errorMessage: 'Your turn has expired. Please rejoin the queue.',
        ));
      },
      onQueueUpdate: (data) {
        checkStatus();
      },
      onPurchaseComplete: (data) {
        emit(state.copyWith(isMyTurn: false, queueEntry: null));
      },
      onConnected: () {},
      onDisconnected: () {},
    );

    _socket!.connect();
    _socket!.joinQueue(machineId);
  }

  // ── Expiry timer ──────────────────────────────────────
  void _startExpiryTimer(dynamic expiresAt) {
    _expiryTimer?.cancel();
    try {
      final expiry = DateTime.parse(expiresAt.toString());
      final remaining = expiry.difference(DateTime.now());
      if (remaining.isNegative) return;

      _expiryTimer = Timer(remaining, () {
        emit(state.copyWith(
          isMyTurn: false,
          errorMessage: 'Time expired. Please rejoin queue.',
        ));
      });
    } catch (_) {}
  }

  void setMyTurn(bool value) {
    emit(state.copyWith(isMyTurn: value));
  }

  void reset() {
    _socket?.disconnect();
    _expiryTimer?.cancel();
    emit(const QueueState());
  }

  void clearError() => emit(state.copyWith(clearError: true));

  @override
  Future<void> close() {
    _socket?.disconnect();
    _expiryTimer?.cancel();
    _api.dispose();
    return super.close();
  }
}
