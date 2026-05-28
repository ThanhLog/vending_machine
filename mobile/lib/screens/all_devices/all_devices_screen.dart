import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../bloc/vending_machine/vending_machine_cubit.dart';
import '../../bloc/vending_machine/vending_machine_state.dart';
import '../../models/vending_machine.dart';
import '../waiting_lobby/waiting_lobby.dart';

class AllDevicesScreen extends StatefulWidget {
  final String? privateKey;
  const AllDevicesScreen({super.key, this.privateKey});

  @override
  State<AllDevicesScreen> createState() => _AllDevicesScreenState();
}

class _AllDevicesScreenState extends State<AllDevicesScreen> {
  String _filter = 'all';
  String _search = '';

  @override
  void initState() {
    super.initState();
    context.read<VendingMachineCubit>().loadMachines(useGps: true);
  }

  List<VendingMachine> _filtered(List<VendingMachine> machines) {
    var result = machines;
    if (_filter == 'online') {
      result = result.where((m) => m.isOnline).toList();
    } else if (_filter == 'offline') {
      result = result.where((m) => !m.isOnline).toList();
    }
    if (_search.isNotEmpty) {
      result = result
          .where(
            (m) =>
                m.name.toLowerCase().contains(_search.toLowerCase()) ||
                m.location.toLowerCase().contains(_search.toLowerCase()),
          )
          .toList();
    }
    return result;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'All Devices',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        backgroundColor: Colors.white,
        foregroundColor: Colors.black,
        elevation: 0,
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(100),
          child: Column(
            children: [
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: TextField(
                  onChanged: (v) => setState(() => _search = v),
                  decoration: InputDecoration(
                    hintText: 'Search by name or location...',
                    prefixIcon: const Icon(Icons.search),
                    filled: true,
                    fillColor: Colors.grey[100],
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide.none,
                    ),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 16),
                  ),
                ),
              ),
              const SizedBox(height: 10),
              _buildFilterChips(),
            ],
          ),
        ),
      ),
      body: BlocBuilder<VendingMachineCubit, VendingMachineState>(
        builder: (context, state) {
          if (state.isLoading) {
            return const Center(child: CircularProgressIndicator());
          }
          if (state.errorMessage != null) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.error_outline, size: 64, color: Colors.red[300]),
                  const SizedBox(height: 12),
                  Text(
                    state.errorMessage!,
                    style: const TextStyle(color: Colors.red),
                  ),
                  const SizedBox(height: 12),
                  ElevatedButton(
                    onPressed: () =>
                        context.read<VendingMachineCubit>().loadMachines(),
                    child: const Text('Retry'),
                  ),
                ],
              ),
            );
          }

          final machines = _filtered(state.machines);
          if (machines.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.coffee, size: 64, color: Colors.grey[400]),
                  const SizedBox(height: 12),
                  Text(
                    _search.isNotEmpty
                        ? 'No machines match "$_search"'
                        : 'No machines found',
                    style: TextStyle(color: Colors.grey[600], fontSize: 16),
                  ),
                ],
              ),
            );
          }

          return RefreshIndicator(
            onRefresh: () => context.read<VendingMachineCubit>().loadMachines(),
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: machines.length,
              itemBuilder: (context, index) {
                final machine = machines[index];
                return _AllDeviceCard(
                  machine: machine,
                  privateKey: widget.privateKey,
                );
              },
            ),
          );
        },
      ),
    );
  }

  Widget _buildFilterChips() {
    final filters = [
      ('all', 'All'),
      ('online', 'Online'),
      ('offline', 'Offline'),
    ];
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Row(
        children: filters.map((f) {
          final selected = _filter == f.$1;
          return Padding(
            padding: const EdgeInsets.only(right: 8),
            child: FilterChip(
              label: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  if (f.$1 == 'online')
                    Container(
                      width: 8,
                      height: 8,
                      decoration: const BoxDecoration(
                        color: Colors.green,
                        shape: BoxShape.circle,
                      ),
                    ),
                  if (f.$1 == 'offline')
                    Container(
                      width: 8,
                      height: 8,
                      decoration: const BoxDecoration(
                        color: Colors.red,
                        shape: BoxShape.circle,
                      ),
                    ),
                  if (f.$1 != 'all') const SizedBox(width: 6),
                  Text(f.$2),
                ],
              ),
              selected: selected,
              selectedColor: Colors.blue[100],
              checkmarkColor: Colors.blue,
              onSelected: (_) => setState(() => _filter = f.$1),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(20),
              ),
            ),
          );
        }).toList(),
      ),
    );
  }
}

class _AllDeviceCard extends StatelessWidget {
  final VendingMachine machine;
  final String? privateKey;

  const _AllDeviceCard({required this.machine, this.privateKey});

  Color _statusColor() {
    switch (machine.mode) {
      case 'maintenance':
        return Colors.orange;
      default:
        return machine.isOnline ? Colors.green : Colors.red;
    }
  }

  String _statusText() {
    switch (machine.mode) {
      case 'maintenance':
        return 'Maintenance';
      default:
        return machine.isOnline ? 'Online' : 'Offline';
    }
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: InkWell(
        borderRadius: BorderRadius.circular(16),
        onTap: machine.isOnline
            ? () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) => VendingQueueLobby(
                      machineId: machine.id,
                      machineName: machine.name,
                      machineSsid: machine.ssid,
                      machinePassword: machine.password,
                      privateKey: privateKey,
                    ),
                  ),
                );
              }
            : null,
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              Container(
                width: 60,
                height: 60,
                decoration: BoxDecoration(
                  color: _statusColor().withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(
                  Icons.coffee_maker,
                  size: 32,
                  color: _statusColor(),
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      machine.name,
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        Icon(
                          Icons.location_on,
                          size: 14,
                          color: Colors.grey[600],
                        ),
                        const SizedBox(width: 4),
                        Expanded(
                          child: Text(
                            machine.location,
                            style: TextStyle(
                              fontSize: 13,
                              color: Colors.grey[600],
                            ),
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Row(
                      children: [
                        _infoTag(
                          Icons.inventory_2,
                          '${machine.products} items',
                        ),
                        const SizedBox(width: 12),
                        _infoTag(
                          Icons.thermostat,
                          '${machine.temperature.toStringAsFixed(1)}°C',
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 10,
                      vertical: 4,
                    ),
                    decoration: BoxDecoration(
                      color: _statusColor().withOpacity(0.15),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      _statusText(),
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: _statusColor(),
                      ),
                    ),
                  ),
                  if (machine.distance > 0) ...[
                    const SizedBox(height: 6),
                    Text(
                      '${machine.distance.toStringAsFixed(1)} km',
                      style: TextStyle(fontSize: 13, color: Colors.grey[600]),
                    ),
                  ],
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _infoTag(IconData icon, String text) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 14, color: Colors.grey[500]),
        const SizedBox(width: 3),
        Text(text, style: TextStyle(fontSize: 12, color: Colors.grey[500])),
      ],
    );
  }
}
