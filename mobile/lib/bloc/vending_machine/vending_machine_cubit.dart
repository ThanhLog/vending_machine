import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:geolocator/geolocator.dart';
import '../../models/vending_machine.dart';
import '../../services/api_service.dart';
import 'vending_machine_state.dart';

class VendingMachineCubit extends Cubit<VendingMachineState> {
  final ApiService _api = ApiService();

  VendingMachineCubit() : super(const VendingMachineState());

  // ── Load machines with optional GPS ──────────────────
  Future<void> loadMachines({bool useGps = false}) async {
    emit(state.copyWith(isLoading: true, clearError: true));

    double? lat, lng;
    if (useGps) {
      try {
        final position = await _getCurrentPosition();
        if (position != null) {
          lat = position.latitude;
          lng = position.longitude;
          print('GPS ok: lat=$lat, lng=$lng');
        } else {
          print('GPS returned null');
        }
      } catch (e) {
        print('GPS error: $e');
      }
    }

    print('Fetching machines with lat: $lat, lng: $lng');
    try {
      final data = await _api.getMachines(lat: lat, lng: lng);
      final machines = data.map((json) => VendingMachine.fromJson(json)).toList();
      emit(state.copyWith(isLoading: false, machines: machines));
    } catch (e) {
      print('Error loading machines: $e');
      emit(state.copyWith(
        isLoading: false,
        errorMessage: 'Cannot load machines: $e',
      ));
    }
  }

  // ── Get GPS position (with permission check) ─────────
  Future<Position?> _getCurrentPosition() async {
    bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) return null;

    LocationPermission permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied ||
          permission == LocationPermission.deniedForever) {
        return null;
      }
    }

    return Geolocator.getCurrentPosition(
      desiredAccuracy: LocationAccuracy.low,
      timeLimit: const Duration(seconds: 5),
    );
  }

  // ── Select a machine ─────────────────────────────────
  void selectMachine(VendingMachine machine) {
    emit(state.copyWith(selectedMachine: machine));
  }

  void clearError() => emit(state.copyWith(clearError: true));

  @override
  Future<void> close() {
    _api.dispose();
    return super.close();
  }
}
