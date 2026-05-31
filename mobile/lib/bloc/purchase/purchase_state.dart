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
  final bool showContinueDialog;
  final bool showRetryDialog;
  final String? walletAddress;
  final String? lastSlot;
  final String? lastProductName;
  final double lastPriceETH;

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
    this.showContinueDialog = false,
    this.showRetryDialog = false,
    this.walletAddress,
    this.lastSlot,
    this.lastProductName,
    this.lastPriceETH = 0.001,
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
    bool? showContinueDialog,
    bool? showRetryDialog,
    String? walletAddress,
    String? lastSlot,
    String? lastProductName,
    double? lastPriceETH,
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
      showContinueDialog: showContinueDialog ?? this.showContinueDialog,
      showRetryDialog: showRetryDialog ?? this.showRetryDialog,
      walletAddress: walletAddress ?? this.walletAddress,
      lastSlot: lastSlot ?? this.lastSlot,
      lastProductName: lastProductName ?? this.lastProductName,
      lastPriceETH: lastPriceETH ?? this.lastPriceETH,
    );
  }
}
