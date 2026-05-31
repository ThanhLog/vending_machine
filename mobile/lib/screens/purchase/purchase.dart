import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../bloc/purchase/purchase_cubit.dart';
import '../../bloc/purchase/purchase_state.dart';
import 'widgets/item_purchase.dart';

class Purchase extends StatefulWidget {
  final String machineId;
  final String? privateKey;

  const Purchase({super.key, required this.machineId, this.privateKey});

  @override
  State<Purchase> createState() => _PurchaseState();
}

class _PurchaseState extends State<Purchase> {
  @override
  void initState() {
    super.initState();
    context.read<PurchaseCubit>().loadSlots(widget.machineId);
  }

  void _showContinueDialog(BuildContext context) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF1E293B),
        title: const Row(
          children: [
            Icon(Icons.shopping_bag, color: Colors.cyanAccent),
            SizedBox(width: 12),
            Expanded(
              child: Text(
                'Ban co muon mua them?',
                style: TextStyle(color: Colors.white, fontSize: 18),
              ),
            ),
          ],
        ),
        content: const Text(
          'Ban co the tiep tuc chon san pham khac hoac ket thuc luot mua.',
          style: TextStyle(color: Color(0xFF94A3B8)),
        ),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.pop(ctx);
              context.read<PurchaseCubit>().finishShopping();
              Navigator.pop(context); // Go back to lobby
            },
            child: const Text(
              'Ket thuc',
              style: TextStyle(color: Colors.redAccent),
            ),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(ctx);
              context.read<PurchaseCubit>().continueShopping();
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.cyanAccent,
              foregroundColor: Colors.black,
            ),
            child: const Text('Mua them'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return BlocConsumer<PurchaseCubit, PurchaseState>(
      listener: (context, state) {
        // Show continue dialog when dispense completes
        if (state.showContinueDialog) {
          _showContinueDialog(context);
        }
        if (state.purchaseSuccess &&
            state.dispenseStatus == DispenseStatus.none) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Purchase successful! TX: ${state.txHash}'),
              backgroundColor: Colors.green,
            ),
          );
        }
        if (state.errorMessage != null) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(state.errorMessage!), backgroundColor: Colors.red),
          );
          context.read<PurchaseCubit>().clearError();
        }
      },
      builder: (context, state) {
        return Scaffold(
          appBar: AppBar(title: const Text('Select Product')),
          body: Column(
            children: [
              // ── Dispense status banner ─────────────────
              if (state.dispenseStatus == DispenseStatus.pending ||
                  state.dispenseStatus == DispenseStatus.processing)
                _DispenseBanner(status: state.dispenseStatus),

              if (state.dispenseStatus == DispenseStatus.failed)
                _DispenseErrorBanner(error: state.dispenseError),

              // ── Main content ───────────────────────────
              Expanded(
                child: state.isLoading
                    ? const Center(child: CircularProgressIndicator())
                    : Container(
                        padding: const EdgeInsets.all(16),
                        child: GridView.builder(
                          itemCount: state.slots.length,
                          gridDelegate:
                              const SliverGridDelegateWithFixedCrossAxisCount(
                            crossAxisCount: 3,
                            mainAxisSpacing: 12,
                            crossAxisSpacing: 12,
                            childAspectRatio: 0.55,
                          ),
                          itemBuilder: (context, index) {
                            final product = state.slots[index];
                            return ItemPurchase(
                              product: product,
                              isPurchasing: state.isPurchasing,
                              onBuy: state.isPurchasing
                                  ? null
                                  : () => _handleBuy(context, product),
                            );
                          },
                        ),
                      ),
              ),
            ],
          ),
        );
      },
    );
  }

  void _handleBuy(BuildContext context, product) {
    if (widget.privateKey == null || widget.privateKey!.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please login first'), backgroundColor: Colors.red),
      );
      return;
    }

    context.read<PurchaseCubit>().purchase(
          machineId: widget.machineId,
          slot: product.slot,
          productName: product.name,
          privateKey: widget.privateKey!,
          priceETH: product.priceETH,
        );
  }
}

class _DispenseBanner extends StatelessWidget {
  final DispenseStatus status;

  const _DispenseBanner({required this.status});

  @override
  Widget build(BuildContext context) {
    final isProcessing = status == DispenseStatus.processing;
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      color: isProcessing ? Colors.orange.shade900 : Colors.blue.shade900,
      child: Row(
        children: [
          SizedBox(
            width: 20,
            height: 20,
            child: CircularProgressIndicator(
              strokeWidth: 2,
              valueColor: AlwaysStoppedAnimation<Color>(
                isProcessing ? Colors.orange.shade200 : Colors.cyanAccent,
              ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              isProcessing
                  ? 'Machine is dispensing your product...'
                  : 'Waiting for machine to dispense...',
              style: TextStyle(
                color: isProcessing
                    ? Colors.orange.shade200
                    : Colors.cyanAccent,
                fontSize: 13,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _DispenseErrorBanner extends StatelessWidget {
  final String? error;

  const _DispenseErrorBanner({this.error});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(12),
      color: Colors.red.shade900,
      child: Row(
        children: [
          const Icon(Icons.error_outline, color: Colors.redAccent, size: 20),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              error ?? 'Dispense failed. Please contact staff.',
              style: const TextStyle(color: Colors.redAccent, fontSize: 13),
            ),
          ),
        ],
      ),
    );
  }
}
