import '../../models/product_model.dart';

enum DispenseStatus { none, pending, processing, completed, failed }

class PurchaseState {
  final bool isLoading;
  final bool isPurchasing;
  final bool purchaseSuccess;
  final List<Product> slots;
  final String machineId;
  final String? errorMessage;
  final String? txHash;
  final String? commandId;
  final DispenseStatus dispenseStatus;
  final String? dispenseError;

  const PurchaseState({
    this.isLoading = false,
    this.isPurchasing = false,
    this.purchaseSuccess = false,
    this.slots = const [],
    this.machineId = '',
    this.errorMessage,
    this.txHash,
    this.commandId,
    this.dispenseStatus = DispenseStatus.none,
    this.dispenseError,
  });

  PurchaseState copyWith({
    bool? isLoading,
    bool? isPurchasing,
    bool? purchaseSuccess,
    List<Product>? slots,
    String? machineId,
    String? errorMessage,
    String? txHash,
    String? commandId,
    DispenseStatus? dispenseStatus,
    String? dispenseError,
    bool clearError = false,
  }) {
    return PurchaseState(
      isLoading: isLoading ?? this.isLoading,
      isPurchasing: isPurchasing ?? this.isPurchasing,
      purchaseSuccess: purchaseSuccess ?? this.purchaseSuccess,
      slots: slots ?? this.slots,
      machineId: machineId ?? this.machineId,
      errorMessage: clearError ? null : (errorMessage ?? this.errorMessage),
      txHash: txHash ?? this.txHash,
      commandId: commandId ?? this.commandId,
      dispenseStatus: dispenseStatus ?? this.dispenseStatus,
      dispenseError: dispenseError ?? this.dispenseError,
    );
  }
}
