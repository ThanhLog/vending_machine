import 'dart:convert';
import 'dart:typed_data';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:web3auth_flutter/enums.dart';
import 'package:web3auth_flutter/input.dart';
import 'package:web3auth_flutter/web3auth_flutter.dart';
import 'package:web3dart/web3dart.dart';
import 'package:web3dart/crypto.dart';
import '../../services/api_service.dart';
import '../../services/wallet_service.dart';
import 'auth_state.dart';

class AuthCubit extends Cubit<AuthState> {
  final ApiService _api = ApiService();

  AuthCubit() : super(const AuthState());

  // ── Google Login via Web3Auth ────────────────────────
  Future<void> loginWithGoogle() async {
    emit(state.copyWith(isLoading: true, clearError: true));

    try {
      final response = await Web3AuthFlutter.login(
        LoginParams(loginProvider: Provider.google),
      );

      final privateKey = response.privKey;
      if (privateKey == null) {
        emit(
          state.copyWith(
            isLoading: false,
            errorMessage: 'Login failed: No private key returned',
          ),
        );
        return;
      }

      // Derive wallet address from private key
      final credentials = EthPrivateKey.fromHex(privateKey);
      final walletAddress = credentials.address.hex;

      // Connect wallet to blockchain RPC
      await WalletService.connect(privateKey);

      // Authenticate with backend
      try {
        final nonce = await _api.getNonce();
        final signature = await _signPersonalMessage(privateKey, nonce);
        print('Signature: $signature');
        print('Wallet: $walletAddress');
        print('Nonce: $nonce');
        await _api.login(walletAddress, signature, nonce);
      } catch (_) {
        // Backend auth is optional for offline usage
      }

      // Get initial balance
      double balance = 0;
      try {
        balance = await WalletService.getBalance();
      } catch (_) {}

      emit(
        state.copyWith(
          isLoading: false,
          isLoggedIn: true,
          privateKey: privateKey,
          walletAddress: walletAddress,
          balance: balance,
        ),
      );
    } catch (e) {
      emit(state.copyWith(isLoading: false, errorMessage: 'Login error: $e'));
    }
  }

  // ── Sign personal message (EIP-191) ──────────────────
  Future<String> _signPersonalMessage(
    String privateKeyHex,
    String message,
  ) async {
    final credentials = EthPrivateKey.fromHex(privateKeyHex);
    final prefix = '\x19Ethereum Signed Message:\n${message.length}';
    final bytes = Uint8List.fromList(utf8.encode(prefix + message));
    final hash = keccak256(bytes);
    final sig = await credentials.signToSignature(hash);

    final r = sig.r.toRadixString(16).padLeft(64, '0');
    final s = sig.s.toRadixString(16).padLeft(64, '0');
    final v = (sig.v + 27).toRadixString(16).padLeft(2, '0');
    return '0x$r$s$v';
  }

  // ── Logout ───────────────────────────────────────────
  Future<void> logout() async {
    await Web3AuthFlutter.logout();
    emit(const AuthState());
  }

  // ── Restore from stored key (skip re-login) ──────────
  void restoreSession(String privateKey) {
    try {
      final credentials = EthPrivateKey.fromHex(privateKey);
      emit(
        state.copyWith(
          isLoggedIn: true,
          privateKey: privateKey,
          walletAddress: credentials.address.hex,
        ),
      );
    } catch (_) {
      emit(state.copyWith(errorMessage: 'Invalid stored key'));
    }
  }

  // ── Refresh balance ──────────────────────────────────
  Future<void> refreshBalance() async {
    try {
      final balance = await WalletService.getBalance();
      emit(state.copyWith(balance: balance));
    } catch (_) {}
  }

  void clearError() => emit(state.copyWith(clearError: true));

  @override
  Future<void> close() {
    _api.dispose();
    return super.close();
  }
}
