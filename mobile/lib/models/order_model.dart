class Order {
  final String id;
  final String walletAddress;
  final String machineId;
  final String slot;
  final String productName;
  final double priceETH;
  final String txHash;
  final String status; // confirmed, dispensed, failed
  final String createdAt;
  final String? dispensedAt;

  const Order({
    required this.id,
    required this.walletAddress,
    required this.machineId,
    required this.slot,
    required this.productName,
    required this.priceETH,
    required this.txHash,
    required this.status,
    required this.createdAt,
    this.dispensedAt,
  });

  factory Order.fromJson(Map<String, dynamic> json) {
    return Order(
      id: json['id']?.toString() ?? '',
      walletAddress: json['walletAddress']?.toString() ?? '',
      machineId: json['machineId']?.toString() ?? '',
      slot: json['slot']?.toString() ?? '',
      productName: json['productName']?.toString() ?? '',
      priceETH: (json['priceETH'] as num?)?.toDouble() ?? 0,
      txHash: json['txHash']?.toString() ?? '',
      status: json['status']?.toString() ?? 'confirmed',
      createdAt: json['createdAt']?.toString() ?? '',
      dispensedAt: json['dispensedAt']?.toString(),
    );
  }
}
