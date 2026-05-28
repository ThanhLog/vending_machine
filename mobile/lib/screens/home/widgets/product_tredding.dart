import 'package:flutter/material.dart';

class ProductTredding extends StatelessWidget {
  const ProductTredding({super.key});
  static const List<Map<String, dynamic>> trendingProducts = [
    {'top': true, 'name': 'Product 1', 'price': '1.50 ETH'},
    {'top': false, 'name': 'Product 2', 'price': '0.75 ETH'},
    {'top': false, 'name': 'Product 3', 'price': '0.50 ETH'},
    {'top': false, 'name': 'Product 4', 'price': '2.00 ETH'},
    {'top': false, 'name': 'Product 5', 'price': '1.25 ETH'},
  ];
  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Product Trendding', style: TextStyle(fontSize: 24)),
          SizedBox(height: 16),
          SizedBox(
            height: 90,
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              itemCount: trendingProducts.length,
              itemBuilder: (context, index) {
                final product = trendingProducts[index];
                return Container(
                  width: 150,
                  padding: EdgeInsets.symmetric(horizontal: 12),
                  margin: EdgeInsets.symmetric(horizontal: 8),
                  decoration: BoxDecoration(
                    color: product['top'] ? Colors.amber : Colors.grey[800],
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Row(
                    children: [
                      const Icon(
                        Icons.shopping_bag,
                        size: 30,
                        color: Colors.white,
                      ),
                      const SizedBox(width: 12),
                      Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(
                            product['name'],
                            style: TextStyle(fontSize: 16, color: Colors.white),
                          ),
                          SizedBox(height: 8),
                          Text(
                            product['price'],
                            style: TextStyle(
                              fontSize: 14,
                              color: Colors.white70,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
