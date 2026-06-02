import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../../config/theme.dart';

class BannerHome extends StatelessWidget {
  final String walletAddress;
  final double balance;

  const BannerHome({super.key, this.walletAddress = '', this.balance = 0.0});

  @override
  Widget build(BuildContext context) {
    final shortAddr = walletAddress.length >= 10
        ? '${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}'
        : walletAddress;

    return Container(
      width: double.infinity,
      margin: const EdgeInsets.fromLTRB(16, 12, 16, 0),
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF0A1030), Color(0xFF141E44)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: AppTheme.cardBorder, width: 1),
        boxShadow: AppTheme.glow(AppTheme.accent, blur: 20),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Status bar
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(children: [
                Container(width: 8, height: 8,
                    decoration: const BoxDecoration(shape: BoxShape.circle, color: AppTheme.success),
                ),
                const SizedBox(width: 8),
                const Text('Connected', style: TextStyle(color: AppTheme.success, fontSize: 12)),
              ]),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: AppTheme.accent.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Text('SEPOLIA', style: TextStyle(color: AppTheme.accent, fontSize: 11, fontWeight: FontWeight.w600)),
              ),
            ],
          ),
          const SizedBox(height: 24),
          // Balance
          const Text('Balance', style: TextStyle(color: AppTheme.textMuted, fontSize: 12, letterSpacing: 2)),
          const SizedBox(height: 4),
          Text('${balance.toStringAsFixed(4)} ETH',
            style: const TextStyle(color: Colors.white, fontSize: 34, fontWeight: FontWeight.w800, letterSpacing: -1)),
          const SizedBox(height: 16),
          // Wallet address with copy
          GestureDetector(
            onTap: () {
              Clipboard.setData(ClipboardData(text: walletAddress));
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text('Copied: $walletAddress'),
                    backgroundColor: AppTheme.accent, duration: const Duration(seconds: 2)),
              );
            },
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              decoration: BoxDecoration(
                color: AppTheme.bg.withOpacity(0.5),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.wallet, color: AppTheme.accent, size: 14),
                  const SizedBox(width: 8),
                  Text(shortAddr, style: AppTheme.body.copyWith(fontSize: 13)),
                  const SizedBox(width: 8),
                  const Icon(Icons.copy, color: AppTheme.textMuted, size: 12),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
