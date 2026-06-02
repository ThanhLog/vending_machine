import 'package:flutter/material.dart';
import '../../models/vending_machine.dart';
import '../../config/theme.dart';
import '../login_screen.dart';
import '../waiting_lobby/waiting_lobby.dart';

class VendingMachineCard extends StatelessWidget {
  final VendingMachine machine;
  final String? privateKey;

  const VendingMachineCard({super.key, required this.machine, this.privateKey});

  void _onConnect(BuildContext context) {
    final isLoggedIn = privateKey != null && privateKey!.isNotEmpty;
    if (!isLoggedIn) {
      showDialog(
        context: context,
        builder: (ctx) => AlertDialog(
          backgroundColor: AppTheme.surface,
          title: const Text('Login Required', style: TextStyle(color: AppTheme.textPrimary)),
          content: const Text('You need to login first.', style: TextStyle(color: AppTheme.textSecondary)),
          actions: [
            TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel', style: TextStyle(color: AppTheme.textMuted))),
            ElevatedButton(
              onPressed: () { Navigator.pop(ctx); Navigator.of(context).pushAndRemoveUntil(MaterialPageRoute(builder: (_) => const LoginScreen()), (route) => false); },
              style: AppTheme.primaryBtn,
              child: const Text('Login'),
            ),
          ],
        ),
      );
      return;
    }
    Navigator.push(context, MaterialPageRoute(
      builder: (_) => VendingQueueLobby(machineId: machine.id, machineName: machine.name,
          machineSsid: machine.ssid, machinePassword: machine.password, privateKey: privateKey),
    ));
  }

  @override
  Widget build(BuildContext context) {
    final isOnline = machine.isOnline;

    return GestureDetector(
      onTap: () => _onConnect(context),
      child: Container(
        width: 260,
        margin: const EdgeInsets.only(right: 16),
        padding: const EdgeInsets.all(18),
        decoration: AppTheme.cardDecoration(
          borderColor: isOnline ? AppTheme.accent.withOpacity(0.3) : AppTheme.cardBorder,
        ),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          // Header
          Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
            Expanded(child: Text(machine.name, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: AppTheme.textPrimary))),
            Container(width: 8, height: 8,
              decoration: BoxDecoration(shape: BoxShape.circle,
                color: isOnline ? AppTheme.success : AppTheme.error,
                boxShadow: isOnline ? [BoxShadow(color: AppTheme.success.withOpacity(0.5), blurRadius: 8)] : null)),
          ]),
          const SizedBox(height: 14),
          // Info
          _info(Icons.location_on, machine.location),
          const SizedBox(height: 6),
          _info(Icons.thermostat, '${machine.temperature.toStringAsFixed(1)}C'),
          const SizedBox(height: 6),
          _info(Icons.wifi, machine.ssid),
          const SizedBox(height: 6),
          Text('${machine.distance.toStringAsFixed(1)} km away', style: AppTheme.accent_text.copyWith(fontSize: 12)),
          const SizedBox(height: 6),
          Text('${machine.products} products', style: AppTheme.caption),
          const Spacer(),
          // Connect btn
          SizedBox(width: double.infinity, height: 42,
            child: ElevatedButton(
              onPressed: isOnline ? () => _onConnect(context) : null,
              style: ElevatedButton.styleFrom(
                backgroundColor: isOnline ? AppTheme.accent : AppTheme.textMuted,
                foregroundColor: AppTheme.bg,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                elevation: 0,
              ),
              child: Text(isOnline ? 'CONNECT' : 'OFFLINE',
                style: const TextStyle(fontWeight: FontWeight.w700, letterSpacing: 2, fontSize: 13)),
            ),
          ),
        ]),
      ),
    );
  }

  Widget _info(IconData icon, String text) {
    return Row(children: [
      Icon(icon, size: 13, color: AppTheme.textMuted),
      const SizedBox(width: 6),
      Text(text, style: AppTheme.caption),
    ]);
  }
}
