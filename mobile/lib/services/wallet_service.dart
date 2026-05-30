import 'package:http/http.dart' as http;

import 'package:web3dart/web3dart.dart';

class WalletService {
  static Web3Client? client;

  static EthPrivateKey? credentials;

  static EthereumAddress? walletAddress;

  // ===== CONNECT =====
  static Future<void> connect(String privateKey) async {
    credentials = EthPrivateKey.fromHex(privateKey);

    walletAddress = credentials!.address;
    print("WALLET ADDRESS: ${walletAddress!.hex}");
    client = Web3Client(
      "https://ethereum-sepolia-rpc.publicnode.com",
      http.Client(),
    );
  }

  // ===== GET ADDRESS =====
  static String getAddress() {
    return walletAddress?.hex ?? "";
  }

  // ===== GET BALANCE =====
  static Future<double> getBalance() async {
    if (client == null || walletAddress == null) {
      return 0;
    }

    final balance = await client!.getBalance(walletAddress!);
    print("BALANCE: ${balance.getValueInUnit(EtherUnit.ether)} ETH");
    return balance.getValueInUnit(EtherUnit.ether).toDouble();
  }

  // ===== SEND TRANSACTION =====
  static Future<String?> sendTransaction({
    required String to,

    required double amount,
  }) async {
    if (client == null || credentials == null) {
      throw Exception("Wallet is not connected.");
    }

    final valueInWei = _etherToWei(amount);

    // Lấy gas price hiện tại và tăng thêm để tx nhanh confirm
    final currentGas = await client!.getGasPrice();
    final gasPrice = EtherAmount.fromBigInt(
      EtherUnit.wei,
      (currentGas.getInWei * BigInt.from(150)) ~/ BigInt.from(100), // +50%
    );

    final txHash = await client!.sendTransaction(
      credentials!,

      Transaction(
        to: EthereumAddress.fromHex(to),
        maxGas: 21000,
        value: EtherAmount.fromBigInt(EtherUnit.wei, valueInWei),
        gasPrice: gasPrice,
      ),

      chainId: 11155111,
    );

    if (txHash == null) return null;

    // Doi transaction duoc xac nhan (can cho Sepolia ~15-20s)
    print("Tx sent: $txHash, waiting for confirmation...");
    try {
      final receipt = await client!.getTransactionReceipt(txHash);
      // Poll cho den khi receipt co (toi da 60s)
      final startTime = DateTime.now();
      while (receipt == null) {
        if (DateTime.now().difference(startTime).inSeconds > 60) {
          print("Tx confirmation timeout after 60s");
          return txHash; // Van tra ve txHash, backend se poll lai
        }
        await Future.delayed(const Duration(seconds: 2));
        final r = await client!.getTransactionReceipt(txHash);
        if (r != null) break;
        print("Still waiting for confirmation...");
      }
      print("Tx confirmed: $txHash");
    } catch (e) {
      print("Warning: Could not wait for receipt: $e");
      // Van tra ve txHash - backend se kiem tra lai
    }

    return txHash;
  }

  static BigInt _etherToWei(double amount) {
    final parts = amount.toStringAsFixed(18).split('.');
    final ether = BigInt.parse(parts[0]) * BigInt.from(10).pow(18);
    final wei = BigInt.parse(parts[1]);

    return ether + wei;
  }
}
