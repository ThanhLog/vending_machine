class Product {
  final String slot;
  final String name;
  final String price;
  final double priceETH;
  final String status; // available, sold, locked, empty, error
  final int quantity;

  const Product({
    required this.slot,
    required this.name,
    required this.price,
    required this.priceETH,
    required this.status,
    this.quantity = 1,
  });

  factory Product.fromJson(Map<String, dynamic> json) {
    return Product(
      slot: json['slot']?.toString() ?? '',
      name: json['name']?.toString() ?? '',
      price: json['price']?.toString() ?? '',
      priceETH: (json['priceETH'] as num?)?.toDouble() ?? 0.001,
      status: json['status']?.toString() ?? 'empty',
      quantity: (json['quantity'] as num?)?.toInt() ?? 1,
    );
  }

  bool get isLocked => status == 'empty' || status == 'error' || status == 'locked' || quantity <= 0;

  Map<String, dynamic> toJson() => {
        'slot': slot,
        'name': name,
        'price': price,
        'priceETH': priceETH,
        'status': status,
        'quantity': quantity,
      };
}
