import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../bloc/auth/auth_cubit.dart';
import '../bloc/auth/auth_state.dart';
import '../config/theme.dart';

class LoginScreen extends StatelessWidget {
  const LoginScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocListener<AuthCubit, AuthState>(
      listener: (context, state) {
        if (state.errorMessage != null) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(state.errorMessage!), backgroundColor: AppTheme.error),
          );
          context.read<AuthCubit>().clearError();
        }
      },
      child: Container(
        decoration: const BoxDecoration(gradient: AppTheme.gradDark),
        child: Scaffold(
          backgroundColor: Colors.transparent,
          body: SafeArea(
            child: Center(
              child: BlocBuilder<AuthCubit, AuthState>(
                builder: (context, state) {
                  return SingleChildScrollView(
                    padding: const EdgeInsets.symmetric(horizontal: 32),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const SizedBox(height: 40),
                        // Logo
                        Container(
                          width: 100,
                          height: 100,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            gradient: AppTheme.gradAccent,
                            boxShadow: AppTheme.glow(AppTheme.accent, blur: 30),
                          ),
                          child: const Icon(Icons.memory_rounded, size: 48, color: AppTheme.bg),
                        ),
                        const SizedBox(height: 32),
                        // Brand name
                        ShaderMask(
                          shaderCallback: (bounds) => AppTheme.gradAccent.createShader(bounds),
                          child: const Text('VENDX', style: TextStyle(
                            fontSize: 42, fontWeight: FontWeight.w900,
                            color: Colors.white, letterSpacing: 8,
                          )),
                        ),
                        const SizedBox(height: 8),
                        const Text('SMART VENDING MACHINE',
                          style: TextStyle(fontSize: 12, color: AppTheme.textMuted, letterSpacing: 6)),
                        const SizedBox(height: 60),
                        // Login button
                        SizedBox(
                          width: double.infinity,
                          height: 56,
                          child: ElevatedButton(
                            onPressed: state.isLoading ? null : () => context.read<AuthCubit>().loginWithGoogle(),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.white,
                              foregroundColor: Colors.black87,
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                              elevation: 0,
                            ),
                            child: state.isLoading
                                ? const SizedBox(width: 24, height: 24,
                                    child: CircularProgressIndicator(strokeWidth: 2, color: Colors.black54))
                                : Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      Image.asset('assets/icons/google.png', width: 22, height: 22,
                                          errorBuilder: (_, __, ___) => const Icon(Icons.login, size: 22)),
                                      const SizedBox(width: 12),
                                      const Text('Continue with Google',
                                          style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
                                    ],
                                  ),
                          ),
                        ),
                        const SizedBox(height: 24),
                        // Divider
                        Row(children: [
                          const Expanded(child: Divider(color: AppTheme.cardBorder)),
                          Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 16),
                            child: Text('SECURE WEB3 LOGIN', style: AppTheme.caption),
                          ),
                          const Expanded(child: Divider(color: AppTheme.cardBorder)),
                        ]),
                        const SizedBox(height: 24),
                        // Feature chips
                        Wrap(
                          spacing: 8,
                          runSpacing: 8,
                          alignment: WrapAlignment.center,
                          children: [
                            _chip(Icons.bolt, 'Fast'),
                            _chip(Icons.lock, 'Secure'),
                            _chip(Icons.language, 'Web3'),
                            _chip(Icons.qr_code_scanner, 'NFC Ready'),
                          ],
                        ),
                        const SizedBox(height: 40),
                      ],
                    ),
                  );
                },
              ),
            ),
          ),
        ),
      ),
    );
  }

  static Widget _chip(IconData icon, String label) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
      decoration: BoxDecoration(
        color: AppTheme.card,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppTheme.cardBorder),
      ),
      child: Row(mainAxisSize: MainAxisSize.min, children: [
        Icon(icon, size: 14, color: AppTheme.accent),
        const SizedBox(width: 6),
        Text(label, style: AppTheme.accent_text.copyWith(fontSize: 12)),
      ]),
    );
  }
}
