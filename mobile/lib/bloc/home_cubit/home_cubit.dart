import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:geolocator/geolocator.dart';
import '../../models/order_model.dart';
import '../../services/api_service.dart';
import '../../services/wallet_service.dart';
import 'home_sate.dart';

class HomeCubit extends Cubit<HomeState> {
  final ApiService _api = ApiService();

  static const double vendingLat = 21.0288;
  static const double vendingLng = 105.854;
  static const double proximityThreshold = 100;

  HomeCubit() : super(const HomeState());

  // ── Initialize wallet data ────────────────────────────
  Future<void> initWallet(String address) async {
    emit(state.copyWith(
      isLoading: true,
      walletAddress: address,
      clearMessage: true,
    ));

    // Load balance directly from chain (fast, no backend needed)
    double balance = 0;
    try {
      balance = await WalletService.getBalance();
      print('HomeCubit: wallet connected=${WalletService.client != null}, address=${WalletService.walletAddress?.hex}');
      print('HomeCubit: balance=$balance');
    } catch (e) {
      print('HomeCubit: getBalance error: $e');
    }

    // Load history from backend
    List<Order> history = [];
    try {
      final historyData = await _api.getHistory(address);
      history = historyData.map((json) => Order.fromJson(json)).toList();
    } catch (_) {}

    emit(state.copyWith(
      isLoading: false,
      balance: balance,
      purchaseHistory: history,
    ));
  }

  // ── Refresh balance ───────────────────────────────────
  Future<void> refreshBalance() async {
    try {
      final balance = await WalletService.getBalance();
      emit(state.copyWith(balance: balance));
    } catch (_) {}
  }

  // ── Check proximity to vending machine ────────────────
  Future<void> checkProximity() async {
    emit(state.copyWith(isProximityLoading: true, clearMessage: true));

    try {
      bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        emit(state.copyWith(
          isProximityLoading: false,
          message: 'Please enable location services.',
        ));
        return;
      }

      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) {
          emit(state.copyWith(
            isProximityLoading: false,
            message: 'Location permission denied.',
          ));
          return;
        }
      }

      final position = await Geolocator.getCurrentPosition();
      final distance = Geolocator.distanceBetween(
        position.latitude,
        position.longitude,
        vendingLat,
        vendingLng,
      );

      emit(state.copyWith(
        isProximityLoading: false,
        isNearMachine: distance <= proximityThreshold,
        distanceToMachine: distance,
        message: distance <= proximityThreshold
            ? 'You are within ${proximityThreshold.toInt()}m of the vending machine.'
            : 'Too far (${distance.toStringAsFixed(0)}m). Get closer to purchase.',
      ));
    } catch (e) {
      emit(state.copyWith(
        isProximityLoading: false,
        message: 'Cannot get location: $e',
      ));
    }
  }

  void clearMessage() => emit(state.copyWith(clearMessage: true));

  @override
  Future<void> close() {
    _api.dispose();
    return super.close();
  }
}
