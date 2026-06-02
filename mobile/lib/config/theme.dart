import 'package:flutter/material.dart';

class AppTheme {
  // Core colors
  static const bg = Color(0xFF060B1A);
  static const surface = Color(0xFF0D1428);
  static const card = Color(0xFF111B33);
  static const cardBorder = Color(0xFF1E2D50);

  // Accent
  static const accent = Color(0xFF00D4FF);
  static const accentGlow = Color(0x4000D4FF);
  static const accent2 = Color(0xFF7B61FF);
  static const accent3 = Color(0xFF00FF88);

  // Status
  static const success = Color(0xFF00E676);
  static const error = Color(0xFFFF3D60);
  static const warning = Color(0xFFFFB300);

  // Text
  static const textPrimary = Color(0xFFF0F4FF);
  static const textSecondary = Color(0xFF8892B0);
  static const textMuted = Color(0xFF495670);

  // Gradients
  static const gradDark = LinearGradient(
    colors: [Color(0xFF060B1A), Color(0xFF0D1428)],
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
  );
  static const gradAccent = LinearGradient(
    colors: [Color(0xFF00D4FF), Color(0xFF7B61FF)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
  static const gradCard = LinearGradient(
    colors: [Color(0xFF111B33), Color(0xFF0F1830)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  // Shadows
  static List<BoxShadow> glow(Color color, {double blur = 20}) => [
    BoxShadow(color: color.withOpacity(0.15), blurRadius: blur, spreadRadius: -5),
  ];

  // Text styles
  static const TextStyle h1 = TextStyle(fontSize: 28, fontWeight: FontWeight.w800, color: textPrimary, letterSpacing: -0.5);
  static const TextStyle h2 = TextStyle(fontSize: 20, fontWeight: FontWeight.w700, color: textPrimary);
  static const TextStyle body = TextStyle(fontSize: 14, color: textSecondary);
  static const TextStyle caption = TextStyle(fontSize: 12, color: textMuted);
  static const TextStyle accent_text = TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: accent);

  // Card decoration
  static BoxDecoration cardDecoration({Color? borderColor}) => BoxDecoration(
    gradient: gradCard,
    borderRadius: BorderRadius.circular(16),
    border: Border.all(color: borderColor ?? cardBorder, width: 1),
    boxShadow: glow(accent, blur: 10),
  );

  // Button styles
  static ButtonStyle primaryBtn = ElevatedButton.styleFrom(
    backgroundColor: accent,
    foregroundColor: bg,
    padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
    elevation: 0,
  );

  static ButtonStyle outlineBtn = ElevatedButton.styleFrom(
    backgroundColor: Colors.transparent,
    foregroundColor: accent,
    padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12), side: const BorderSide(color: accent)),
    elevation: 0,
  );
}
