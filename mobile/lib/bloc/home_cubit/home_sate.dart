import '../../models/order_model.dart';

class HomeState {
  final String walletAddress;
  final double balance;
  final bool isLoading;
  final bool isPaymentLoading;
  final bool isProximityLoading;
  final bool isNearMachine;
  final double distanceToMachine;
  final List<Order> purchaseHistory;
  final String? message;

  const HomeState({
    this.walletAddress = '',
    this.balance = 0.0,
    this.isLoading = false,
    this.isPaymentLoading = false,
    this.isProximityLoading = false,
    this.isNearMachine = false,
    this.distanceToMachine = 0,
    this.purchaseHistory = const [],
    this.message,
  });

  HomeState copyWith({
    String? walletAddress,
    double? balance,
    bool? isLoading,
    bool? isPaymentLoading,
    bool? isProximityLoading,
    bool? isNearMachine,
    double? distanceToMachine,
    List<Order>? purchaseHistory,
    String? message,
    bool clearMessage = false,
  }) {
    return HomeState(
      walletAddress: walletAddress ?? this.walletAddress,
      balance: balance ?? this.balance,
      isLoading: isLoading ?? this.isLoading,
      isPaymentLoading: isPaymentLoading ?? this.isPaymentLoading,
      isProximityLoading: isProximityLoading ?? this.isProximityLoading,
      isNearMachine: isNearMachine ?? this.isNearMachine,
      distanceToMachine: distanceToMachine ?? this.distanceToMachine,
      purchaseHistory: purchaseHistory ?? this.purchaseHistory,
      message: clearMessage ? null : (message ?? this.message),
    );
  }
}
