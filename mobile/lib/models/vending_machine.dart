class VendingMachine {
  final String id;
  final String name;
  final String location;
  final bool isOnline;
  final int products;
  final double distance;
  final double temperature;
  final double latitude;
  final double longitude;
  final String mode;
  final String ssid;
  final String password;

  const VendingMachine({
    required this.id,
    required this.name,
    required this.location,
    required this.isOnline,
    required this.products,
    required this.distance,
    required this.temperature,
    this.latitude = 21.0288,
    this.longitude = 105.854,
    this.mode = 'normal',
    this.ssid = 'Vending_Setup',
    this.password = '12345678',
  });

  factory VendingMachine.fromJson(Map<String, dynamic> json) {
    return VendingMachine(
      id: json['id']?.toString() ?? '',
      name: json['name']?.toString() ?? '',
      location: json['location']?.toString() ?? '',
      isOnline: json['isOnline'] == true,
      products: (json['products'] as num?)?.toInt() ?? 0,
      distance: (json['distance'] as num?)?.toDouble() ?? 0.0,
      temperature: (json['temperature'] as num?)?.toDouble() ?? 0.0,
      latitude: (json['latitude'] as num?)?.toDouble() ?? 21.0288,
      longitude: (json['longitude'] as num?)?.toDouble() ?? 105.854,
      mode: json['mode']?.toString() ?? 'normal',
      ssid: json['ssid']?.toString() ?? 'Vending_Setup',
      password: json['password']?.toString() ?? '12345678',
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'location': location,
        'isOnline': isOnline,
        'products': products,
        'distance': distance,
        'temperature': temperature,
        'latitude': latitude,
        'longitude': longitude,
        'mode': mode,
        'ssid': ssid,
        'password': password,
      };
}
