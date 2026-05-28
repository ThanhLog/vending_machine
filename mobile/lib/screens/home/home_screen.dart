import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../bloc/home_cubit/home_cubit.dart';
import '../../bloc/home_cubit/home_sate.dart';
import 'widgets/header_home.dart';
import 'widgets/banner_home.dart';
import 'widgets/product_tredding.dart';
import 'widgets/purchase_history.dart';
import '../vending_machine/vending_machine_list.dart';

class HomeScreen extends StatefulWidget {
  final String? privateKey;
  final String? walletAddress;

  const HomeScreen({super.key, this.privateKey, this.walletAddress});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  @override
  void initState() {
    super.initState();
    final address = widget.walletAddress;
    if (address != null && address.isNotEmpty) {
      context.read<HomeCubit>().initWallet(address);
    }
  }

  @override
  Widget build(BuildContext context) {
    final isLoggedIn =
        widget.privateKey != null && widget.privateKey!.isNotEmpty;

    return Scaffold(
      appBar: HeaderHome(context: context, isLoggedIn: isLoggedIn),
      body: BlocBuilder<HomeCubit, HomeState>(
        builder: (context, state) {
          print('HomeState: isLoading=${state.isLoading}, balance=${state.balance}, historyCount=${state.purchaseHistory.length}');
          return SingleChildScrollView(
            child: Padding(
              padding: const EdgeInsets.only(bottom: 16),
              child: Column(
                children: [
                  BannerHome(
                    walletAddress: widget.walletAddress ?? '',
                    balance: state.balance,
                  ),
                  const PurchaseHistory(),
                  const ProductTredding(),
                  VendingMachineList(privateKey: widget.privateKey),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}
