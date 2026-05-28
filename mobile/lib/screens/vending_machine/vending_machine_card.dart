import 'package:flutter/material.dart';
import '../../models/vending_machine.dart';
import '../waiting_lobby/waiting_lobby.dart';

class VendingMachineCard extends StatelessWidget {
  final VendingMachine machine;
  final String? privateKey;

  const VendingMachineCard({
    super.key,
    required this.machine,
    this.privateKey,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 280,
      margin: const EdgeInsets.only(right: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        boxShadow: const [BoxShadow(blurRadius: 10, color: Colors.black12)],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                machine.name,
                style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
              ),
              Container(
                width: 10,
                height: 10,
                decoration: BoxDecoration(
                  color: machine.isOnline ? Colors.green : Colors.red,
                  shape: BoxShape.circle,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(machine.location),
          const SizedBox(height: 8),
          Text('${machine.products} products'),
          Text('${machine.distance.toStringAsFixed(1)} km away'),
          Text('Temp ${machine.temperature.toStringAsFixed(1)}°C'),
          Text('WiFi: ${machine.ssid}', style: const TextStyle(fontSize: 11, color: Colors.grey)),
          const Spacer(),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: machine.isOnline
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
              child: Text(machine.isOnline ? 'Connect' : 'Offline'),
            ),
          ),
        ],
      ),
    );
  }
}
