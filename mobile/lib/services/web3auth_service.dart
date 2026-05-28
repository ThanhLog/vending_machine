import 'package:web3auth_flutter/enums.dart';
import 'package:web3auth_flutter/input.dart';
import 'package:web3auth_flutter/output.dart';
import 'package:web3auth_flutter/web3auth_flutter.dart';
import 'package:web3dart/web3dart.dart';

class Web3AuthService {
  static Future<String?> login() async {
    try {
      final Web3AuthResponse response = await Web3AuthFlutter.login(
        LoginParams(loginProvider: Provider.google),
      );

      final privateKey = response.privKey;

      if (privateKey == null) {
        return null;
      }

      final credentials = EthPrivateKey.fromHex(privateKey);

      final address = credentials.address;

      return address.toString();
    } catch (e) {
      return null;
    }
  }

  static Future<void> logout() async {
    await Web3AuthFlutter.logout();
  }
}
