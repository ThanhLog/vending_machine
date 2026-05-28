import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../bloc/auth/auth_cubit.dart';
import '../../bloc/auth/auth_state.dart';
import 'home/home_screen.dart';

class LoginScreen extends StatelessWidget {
  const LoginScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocConsumer<AuthCubit, AuthState>(
      listener: (context, state) {
        if (state.isLoggedIn &&
            state.privateKey != null &&
            state.walletAddress != null) {
          Navigator.of(context).pushAndRemoveUntil(
            MaterialPageRoute(
              builder: (_) => HomeScreen(
                privateKey: state.privateKey!,
                walletAddress: state.walletAddress!,
              ),
            ),
            (route) => false,
          );
        }
        if (state.errorMessage != null) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(state.errorMessage!),
              backgroundColor: Colors.red,
            ),
          );
        }
      },
      builder: (context, state) {
        return Scaffold(
          body: Center(
            child: ElevatedButton(
              onPressed: state.isLoading
                  ? null
                  : () => context.read<AuthCubit>().loginWithGoogle(),
              child: Text(state.isLoading ? 'Loading...' : 'Login Google'),
            ),
          ),
        );
      },
    );
  }
}
