import 'package:flutter/material.dart';

class BannerHome extends StatelessWidget {
  final String walletAddress;
  final double balance;

  const BannerHome({
    super.key,
    this.walletAddress = '',
    this.balance = 0.0,
  });

  @override
  Widget build(BuildContext context) {
    final shortAddress = walletAddress.length >= 10
        ? '${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}'
        : walletAddress;

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          colors: [Color(0xFF1A237E), Color(0xFF4A148C)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.only(
          bottomLeft: Radius.circular(32),
          bottomRight: Radius.circular(32),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Smart Vending Machine',
              style: TextStyle(color: Colors.white70, fontSize: 14)),
          const SizedBox(height: 8),
          Text('${balance.toStringAsFixed(4)} ETH',
              style: const TextStyle(
                  color: Colors.white,
                  fontSize: 32,
                  fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          Row(
            children: [
              const Icon(Icons.wallet, color: Colors.white54, size: 16),
              const SizedBox(width: 6),
              Text(shortAddress,
                  style: const TextStyle(color: Colors.white54, fontSize: 14)),
            ],
          ),
        ],
      ),
    );
  }
}
