import 'package:geolocator/geolocator.dart';

class GPSService {
  // ===== GET CURRENT LOCATION =====
  static Future<Position?> getCurrentLocation() async {
    bool serviceEnabled = await Geolocator.isLocationServiceEnabled();

    if (!serviceEnabled) {
      return null;
    }

    LocationPermission permission = await Geolocator.checkPermission();

    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
    }

    return await Geolocator.getCurrentPosition();
  }

  // ===== CALCULATE DISTANCE =====
  static double calculateDistance({
    required double startLat,

    required double startLng,

    required double endLat,

    required double endLng,
  }) {
    return Geolocator.distanceBetween(startLat, startLng, endLat, endLng);
  }
}
