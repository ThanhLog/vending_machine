import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:web3auth_flutter/enums.dart';
import 'package:web3auth_flutter/input.dart';
import 'package:web3auth_flutter/web3auth_flutter.dart';

import 'bloc/auth/auth_cubit.dart';
import 'bloc/auth/auth_state.dart';
import 'bloc/home_cubit/home_cubit.dart';
import 'bloc/vending_machine/vending_machine_cubit.dart';
import 'bloc/queue/queue_cubit.dart';
import 'bloc/purchase/purchase_cubit.dart';
import 'screens/login_screen.dart';
import 'screens/home/home_screen.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await dotenv.load(fileName: '.env');

  await Web3AuthFlutter.init(
    Web3AuthOptions(
      clientId: dotenv.get('CLIENT_ID_WEB3AUTH'),
      network: Network.sapphire_devnet,
      redirectUrl: Uri.parse('w3a://com.example.mobile'),
    ),
  );

  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiBlocProvider(
      providers: [
        BlocProvider<AuthCubit>(create: (_) => AuthCubit()),
        BlocProvider<HomeCubit>(create: (_) => HomeCubit()),
        BlocProvider<VendingMachineCubit>(create: (_) => VendingMachineCubit()),
        BlocProvider<QueueCubit>(create: (_) => QueueCubit()),
        BlocProvider<PurchaseCubit>(create: (_) => PurchaseCubit()),
      ],
      child: MaterialApp(
        debugShowCheckedModeBanner: false,
        home: BlocBuilder<AuthCubit, AuthState>(
          builder: (context, state) {
            if (state.isLoggedIn &&
                state.privateKey != null &&
                state.walletAddress != null) {
              return HomeScreen(
                privateKey: state.privateKey!,
                walletAddress: state.walletAddress!,
              );
            }
            return const LoginScreen();
          },
        ),
      ),
    );
  }
}
