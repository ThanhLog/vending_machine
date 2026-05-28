import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../bloc/vending_machine/vending_machine_cubit.dart';
import '../../bloc/vending_machine/vending_machine_state.dart';
import '../all_devices/all_devices_screen.dart';
import 'vending_machine_card.dart';

class VendingMachineList extends StatefulWidget {
  final String? privateKey;
  const VendingMachineList({super.key, this.privateKey});

  @override
  State<VendingMachineList> createState() => _VendingMachineListState();
}

class _VendingMachineListState extends State<VendingMachineList> {
  @override
  void initState() {
    super.initState();
    // Load machines from backend
    context.read<VendingMachineCubit>().loadMachines(useGps: true);
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Nearby Machines',
            style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 16),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton.icon(
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) => AllDevicesScreen(privateKey: widget.privateKey),
                  ),
                );
              },
              icon: const Icon(Icons.grid_view, size: 18),
              label: const Text('See All Devices'),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.blue[50],
                foregroundColor: Colors.blue,
                elevation: 0,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ),
          ),
          const SizedBox(height: 12),
          BlocBuilder<VendingMachineCubit, VendingMachineState>(
            builder: (context, state) {
              if (state.isLoading) {
                return const SizedBox(
                  height: 230,
                  child: Center(child: CircularProgressIndicator()),
                );
              }

              if (state.errorMessage != null) {
                return SizedBox(
                  height: 230,
                  child: Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(state.errorMessage!, style: const TextStyle(color: Colors.red)),
                        const SizedBox(height: 8),
                        ElevatedButton(
                          onPressed: () => context.read<VendingMachineCubit>().loadMachines(),
                          child: const Text('Retry'),
                        ),
                      ],
                    ),
                  ),
                );
              }

              if (state.machines.isEmpty) {
                return const SizedBox(
                  height: 230,
                  child: Center(child: Text('No machines found')),
                );
              }

              return SizedBox(
                height: 230,
                child: ListView.builder(
                  scrollDirection: Axis.horizontal,
                  itemCount: state.machines.length,
                  itemBuilder: (context, index) {
                    final machine = state.machines[index];
                    return VendingMachineCard(
                      machine: machine,
                      privateKey: widget.privateKey,
                    );
                  },
                ),
              );
            },
          ),
        ],
      ),
    );
  }
}
