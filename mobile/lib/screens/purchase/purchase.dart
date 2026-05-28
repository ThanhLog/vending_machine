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

  @override
  Widget build(BuildContext context) {
    return BlocConsumer<PurchaseCubit, PurchaseState>(
      listener: (context, state) {
        if (state.dispenseStatus == DispenseStatus.completed) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Product dispensed! Please collect from the machine.'),
              backgroundColor: Colors.green,
            ),
          );
          context.read<PurchaseCubit>().resetPurchase();
        } else if (state.dispenseStatus == DispenseStatus.failed) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(
                  'Dispense failed: ${state.dispenseError ?? "Unknown error"}'),
              backgroundColor: Colors.red,
            ),
          );
          context.read<PurchaseCubit>().resetPurchase();
        } else if (state.purchaseSuccess &&
            state.dispenseStatus == DispenseStatus.none) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Purchase successful! TX: ${state.txHash}'),
              backgroundColor: Colors.green,
            ),
          );
          context.read<PurchaseCubit>().resetPurchase();
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
