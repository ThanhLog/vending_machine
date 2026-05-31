import 'package:flutter/material.dart';
import '../../../models/product_model.dart';

class ItemPurchase extends StatelessWidget {
  final Product product;
  final bool isPurchasing;
  final VoidCallback? onBuy;

  const ItemPurchase({
    super.key,
    required this.product,
    required this.isPurchasing,
    this.onBuy,
  });

  Color get _statusColor {
    switch (product.status) {
      case 'available':
        return Colors.green;
      case 'sold':
        return Colors.orange;
      case 'error':
        return Colors.red;
      case 'locked':
        return Colors.black54;
      case 'empty':
        return Colors.grey;
      default:
        return Colors.blueGrey;
    }
  }

  IconData get _statusIcon {
    switch (product.status) {
      case 'available':
        return Icons.check_circle;
      case 'sold':
        return Icons.remove_shopping_cart;
      case 'error':
        return Icons.error;
      case 'locked':
        return Icons.lock;
      case 'empty':
        return Icons.block;
      default:
        return Icons.device_unknown;
    }
  }

  String get _buttonText {
    if (isPurchasing) return '...';
    switch (product.status) {
      case 'available':
        return 'BUY';
      case 'sold':
        return 'SOLD OUT';
      case 'error':
        return 'ERROR';
      case 'locked':
        return 'LOCKED';
      case 'empty':
        return 'EMPTY';
      default:
        return 'UNKNOWN';
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: _statusColor, width: 2),
        boxShadow: const [BoxShadow(blurRadius: 8, color: Colors.black12)],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(product.slot, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
              Icon(_statusIcon, color: _statusColor, size: 20),
            ],
          ),
          const Spacer(),
          Center(child: Icon(_statusIcon, size: 40, color: _statusColor)),
          const SizedBox(height: 12),
          Text(
            product.isLocked ? product.status.toUpperCase() : product.name,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
          ),
          const SizedBox(height: 4),
          Text(
            product.isLocked ? '-' : product.price,
            style: const TextStyle(color: Colors.grey, fontSize: 12),
          ),
          if (!product.isLocked && product.quantity > 0)
            Text(
              'Con: ${product.quantity}',
              style: const TextStyle(color: Colors.green, fontSize: 11, fontWeight: FontWeight.w500),
            ),
          const SizedBox(height: 10),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: (product.isLocked || isPurchasing) ? null : onBuy,
              style: ElevatedButton.styleFrom(
                backgroundColor: _statusColor,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              child: Text(_buttonText),
            ),
          ),
        ],
      ),
    );
  }
}
