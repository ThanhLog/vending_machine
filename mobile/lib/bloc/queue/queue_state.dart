import '../../models/queue_entry.dart';

class QueueState {
  final bool isLoading;
  final QueueEntry? queueEntry;
  final bool isMyTurn;
  final int queueNumber;
  final int peopleAhead;
  final double estimatedWaitMin;
  final String? errorMessage;

  const QueueState({
    this.isLoading = false,
    this.queueEntry,
    this.isMyTurn = false,
    this.queueNumber = 0,
    this.peopleAhead = 0,
    this.estimatedWaitMin = 0,
    this.errorMessage,
  });

  QueueState copyWith({
    bool? isLoading,
    QueueEntry? queueEntry,
    bool? isMyTurn,
    int? queueNumber,
    int? peopleAhead,
    double? estimatedWaitMin,
    String? errorMessage,
    bool clearError = false,
  }) {
    return QueueState(
      isLoading: isLoading ?? this.isLoading,
      queueEntry: queueEntry ?? this.queueEntry,
      isMyTurn: isMyTurn ?? this.isMyTurn,
      queueNumber: queueNumber ?? this.queueNumber,
      peopleAhead: peopleAhead ?? this.peopleAhead,
      estimatedWaitMin: estimatedWaitMin ?? this.estimatedWaitMin,
      errorMessage: clearError ? null : (errorMessage ?? this.errorMessage),
    );
  }
}
