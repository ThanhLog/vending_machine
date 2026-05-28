import '../../models/vending_machine.dart';

class VendingMachineState {
  final bool isLoading;
  final List<VendingMachine> machines;
  final VendingMachine? selectedMachine;
  final String? errorMessage;

  const VendingMachineState({
    this.isLoading = false,
    this.machines = const [],
    this.selectedMachine,
    this.errorMessage,
  });

  VendingMachineState copyWith({
    bool? isLoading,
    List<VendingMachine>? machines,
    VendingMachine? selectedMachine,
    String? errorMessage,
    bool clearError = false,
  }) {
    return VendingMachineState(
      isLoading: isLoading ?? this.isLoading,
      machines: machines ?? this.machines,
      selectedMachine: selectedMachine ?? this.selectedMachine,
      errorMessage: clearError ? null : (errorMessage ?? this.errorMessage),
    );
  }
}
