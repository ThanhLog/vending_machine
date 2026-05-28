class AuthState {
  final bool isLoading;
  final bool isLoggedIn;
  final String? privateKey;
  final String? walletAddress;
  final String? errorMessage;
  final double balance;

  const AuthState({
    this.isLoading = false,
    this.isLoggedIn = false,
    this.privateKey,
    this.walletAddress,
    this.errorMessage,
    this.balance = 0.0,
  });

  AuthState copyWith({
    bool? isLoading,
    bool? isLoggedIn,
    String? privateKey,
    String? walletAddress,
    String? errorMessage,
    double? balance,
    bool clearError = false,
  }) {
    return AuthState(
      isLoading: isLoading ?? this.isLoading,
      isLoggedIn: isLoggedIn ?? this.isLoggedIn,
      privateKey: privateKey ?? this.privateKey,
      walletAddress: walletAddress ?? this.walletAddress,
      errorMessage: clearError ? null : (errorMessage ?? this.errorMessage),
      balance: balance ?? this.balance,
    );
  }
}
