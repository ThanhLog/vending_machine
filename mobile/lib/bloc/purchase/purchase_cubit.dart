import 'dart:async';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:web3dart/web3dart.dart';
import '../../models/product_model.dart';
import '../../services/api_service.dart';
import '../../services/wallet_service.dart';
import 'purchase_state.dart';

class PurchaseCubit extends Cubit<PurchaseState> {
  final ApiService _api = ApiService();
  Timer? _dispenseTimer;

  PurchaseCubit() : super(const PurchaseState());

  static const String _vendingWallet = '0x94988621cDd1aCEAa0284f65cb2EBE0B40AD7c85';

  // ── Load slots for a machine ──────────────────────────
  Future<void> loadSlots(String machineId) async {
    emit(state.copyWith(isLoading: true, machineId: machineId, clearError: true));

    try {
      final data = await _api.getMachineSlots(machineId);
      final slots = data.map((json) => Product.fromJson(json)).toList();
      emit(state.copyWith(isLoading: false, slots: slots));
    } catch (e) {
      emit(state.copyWith(
        isLoading: false,
        errorMessage: 'Cannot load products: $e',
      ));
    }
  }

  // ── Purchase a product ────────────────────────────────
  Future<void> purchase({
    required String machineId,
    required String slot,
    required String productName,
    required String privateKey,
    required double priceETH,
  }) async {
    emit(state.copyWith(isPurchasing: true, clearError: true));

    try {
      final credentials = EthPrivateKey.fromHex(privateKey);
      final walletAddress = credentials.address.hex;

      if (WalletService.credentials == null) {
        await WalletService.connect(privateKey);
      }

      // 1. Send blockchain transaction
      final txHash = await WalletService.sendTransaction(
        to: _vendingWallet,
        amount: priceETH,
      );
      if (txHash == null) {
        emit(state.copyWith(
          isPurchasing: false,
          errorMessage: 'Transaction failed on blockchain',
        ));
        return;
      }

      // 2. Verify payment via backend
      final order = await _api.purchase(
        machineId: machineId,
        slot: slot,
        productName: productName,
        txHash: txHash,
        walletAddress: walletAddress,
      );

      final commandId = order['commandId'] as String?;

      // 3. Update slot status locally
      final updatedSlots = state.slots.map((p) {
        if (p.slot == slot) {
          return Product(
            slot: p.slot,
            name: p.name,
            price: p.price,
            priceETH: p.priceETH,
            status: 'sold',
          );
        }
        return p;
      }).toList();

      emit(state.copyWith(
        isPurchasing: false,
        purchaseSuccess: true,
        slots: updatedSlots,
        txHash: txHash,
        commandId: commandId,
        dispenseStatus: commandId != null
            ? DispenseStatus.pending
            : DispenseStatus.none,
      ));

      // 4. Start polling dispense status
      if (commandId != null) {
        _pollDispenseStatus(machineId, commandId);
      }
    } catch (e) {
      emit(state.copyWith(
        isPurchasing: false,
        errorMessage: 'Purchase failed: $e',
      ));
    }
  }

  // ── Poll ESP32 dispense status ────────────────────────
  void _pollDispenseStatus(String machineId, String commandId) {
    _dispenseTimer?.cancel();
    _dispenseTimer = Timer.periodic(const Duration(seconds: 2), (timer) async {
      try {
        final cmd = await _api.getCommandStatus(machineId, commandId);
        if (cmd == null) return;

        final status = cmd['status'] as String?;

        if (status == 'processing') {
          emit(state.copyWith(dispenseStatus: DispenseStatus.processing));
        } else if (status == 'completed') {
          emit(state.copyWith(dispenseStatus: DispenseStatus.completed));
          timer.cancel();
        } else if (status == 'failed') {
          emit(state.copyWith(
            dispenseStatus: DispenseStatus.failed,
            dispenseError: cmd['errorMessage'] as String?,
          ));
          timer.cancel();
        }
      } catch (_) {}
    });
  }

  void clearError() => emit(state.copyWith(clearError: true));
  void resetPurchase() {
    _dispenseTimer?.cancel();
    emit(state.copyWith(
      purchaseSuccess: false,
      txHash: null,
      commandId: null,
      dispenseStatus: DispenseStatus.none,
      dispenseError: null,
    ));
  }

  @override
  Future<void> close() {
    _dispenseTimer?.cancel();
    _api.dispose();
    return super.close();
  }
}
