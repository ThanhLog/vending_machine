import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../bloc/home_cubit/home_cubit.dart';
import '../../../bloc/home_cubit/home_sate.dart';
import '../../login_screen.dart';

class HeaderHome extends AppBar {
  final bool isLoggedIn;
  final BuildContext context;

  HeaderHome({super.key, required this.isLoggedIn, required this.context})
    : super(
        title: const Text('Vending Machine'),
        actions: [
          if (isLoggedIn)
            // BlocBuilder<HomeCubit, HomeState>(
            //   builder: (context, state) {
            //     return Padding(
            //       padding: const EdgeInsets.only(right: 16.0),
            //       child: Row(
            //         children: [
            //           Text('${state.balance.toStringAsFixed(4)} ETH'),
            //           const SizedBox(width: 8),
            //           if (state.isLoading)
            //             const SizedBox(
            //               width: 16,
            //               height: 16,
            //               child: CircularProgressIndicator(strokeWidth: 2),
            //             )
            //           else
            //             const Icon(Icons.check_circle, color: Colors.green, size: 16),
            //         ],
            //       ),
            //     );
            //   },
            // )
            const SizedBox()
          else
            Padding(
              padding: const EdgeInsets.only(right: 8.0),
              child: ElevatedButton(
                onPressed: () {
                  Navigator.of(context).push(
                    MaterialPageRoute(builder: (_) => const LoginScreen()),
                  );
                },
                child: const Text('Login'),
              ),
            ),
        ],
      );
}
