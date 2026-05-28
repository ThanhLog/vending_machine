class QueueEntry {
  final String queueId;
  final String machineId;
  final String machineName;
  final int position;
  final int peopleAhead;
  final double estimatedWaitMin;
  final String status; // waiting, serving, completed, cancelled, expired
  final String joinedAt;
  final String? servingAt;
  final String? expiresAt;

  const QueueEntry({
    required this.queueId,
    required this.machineId,
    required this.machineName,
    required this.position,
    required this.peopleAhead,
    required this.estimatedWaitMin,
    required this.status,
    required this.joinedAt,
    this.servingAt,
    this.expiresAt,
  });

  factory QueueEntry.fromJson(Map<String, dynamic> json) {
    return QueueEntry(
      queueId: json['queueId']?.toString() ?? '',
      machineId: json['machineId']?.toString() ?? '',
      machineName: json['machineName']?.toString() ?? '',
      position: (json['position'] as num?)?.toInt() ?? 0,
      peopleAhead: (json['peopleAhead'] as num?)?.toInt() ?? 0,
      estimatedWaitMin: (json['estimatedWaitMin'] as num?)?.toDouble() ?? 0,
      status: json['status']?.toString() ?? 'waiting',
      joinedAt: json['joinedAt']?.toString() ?? '',
      servingAt: json['servingAt']?.toString(),
      expiresAt: json['expiresAt']?.toString(),
    );
  }

  bool get isServing => status == 'serving';
  bool get isWaiting => status == 'waiting';
  bool get isExpired => status == 'expired';
  bool get isMyTurn => isServing;
}
