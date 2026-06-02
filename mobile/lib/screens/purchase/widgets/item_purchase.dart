import 'package:flutter/material.dart';
import '../../../models/product_model.dart';
import '../../../config/theme.dart';

class ItemPurchase extends StatelessWidget {
  final Product product;
  final bool isPurchasing;
  final VoidCallback? onBuy;

  const ItemPurchase({super.key, required this.product, required this.isPurchasing, this.onBuy});

  Color get _statusColor {
    switch (product.status) {
      case 'available': return AppTheme.success;
      case 'sold': return AppTheme.warning;
      case 'error': return AppTheme.error;
      default: return AppTheme.textMuted;
    }
  }

  IconData get _statusIcon {
    switch (product.status) {
      case 'available': return Icons.check_circle;
      case 'sold': return Icons.remove_shopping_cart;
      case 'error': return Icons.error;
      default: return Icons.block;
    }
  }

  @override
  Widget build(BuildContext context) {
    final isAvail = product.status == 'available' && product.quantity > 0;

    return Container(
      decoration: BoxDecoration(
        color: AppTheme.card,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: isAvail ? _statusColor.withOpacity(0.5) : AppTheme.cardBorder, width: 1.5),
        boxShadow: isAvail ? AppTheme.glow(_statusColor, blur: 8) : null,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header: slot + status
          Padding(
            padding: const EdgeInsets.fromLTRB(14, 12, 14, 0),
            child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  color: AppTheme.accent.withOpacity(0.15),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(product.slot, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 14, color: AppTheme.accent)),
              ),
              Icon(_statusIcon, color: _statusColor, size: 16),
            ]),
          ),
          // Product icon
          Center(
            child: Container(
              margin: const EdgeInsets.symmetric(vertical: 8),
              width: 44, height: 44,
              decoration: BoxDecoration(shape: BoxShape.circle,
                color: _statusColor.withOpacity(0.1)),
              child: Icon(_statusIcon, size: 24, color: _statusColor),
            ),
          ),
          // Product name
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 12),
            child: Text(product.isLocked ? product.status.toUpperCase() : product.name,
              maxLines: 1, overflow: TextOverflow.ellipsis,
              style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13, color: AppTheme.textPrimary)),
          ),
          const SizedBox(height: 2),
          // Price
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 12),
            child: Text(product.isLocked ? '-' : product.price,
              style: AppTheme.caption.copyWith(fontSize: 11)),
          ),
          // Quantity
          if (isAvail)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 12),
              child: Text('${product.quantity} left',
                style: const TextStyle(color: AppTheme.success, fontSize: 10, fontWeight: FontWeight.w600)),
            ),
          const SizedBox(height: 10),
          // Buy button
          Padding(
            padding: const EdgeInsets.fromLTRB(8, 0, 8, 10),
            child: SizedBox(
              width: double.infinity, height: 34,
              child: ElevatedButton(
                onPressed: (isAvail && !isPurchasing) ? onBuy : null,
                style: ElevatedButton.styleFrom(
                  backgroundColor: isAvail ? _statusColor : AppTheme.textMuted,
                  foregroundColor: AppTheme.bg,
                  padding: EdgeInsets.zero,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  elevation: 0,
                ),
                child: Text(isPurchasing ? '...' : 'BUY',
                  style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 13)),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
