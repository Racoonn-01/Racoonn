/**
 * Helper to translate raw Appwrite/network errors into friendly, professional custom messages.
 */

export interface FriendlyError {
  title: string;
  message: string;
  type: 'error' | 'warning' | 'info' | 'success';
  primaryText: string;
  secondaryText?: string;
  action?: 'login' | 'retry' | 'support';
}

export function getFriendlyAuthError(
  error: any,
  context: 'register' | 'login' = 'register'
): FriendlyError {
  const code = Number(error?.code) || 0;
  const type = String(error?.type || '').toLowerCase();
  const rawMsg = String(error?.message || '').toLowerCase();

  if (context === 'register') {
    // Duplicate user / email already registered
    if (
      type.includes('user_already_exists') ||
      type.includes('email_already_exists') ||
      code === 409 ||
      rawMsg.includes('already exists') ||
      rawMsg.includes('same email')
    ) {
      return {
        title: 'Account Already Exists',
        message:
          'An account with this email address is already registered on Racoonn. Please sign in instead or use another email.',
        type: 'warning',
        primaryText: 'Log In',
        secondaryText: 'Try Another Email',
        action: 'login',
      };
    }

    // Password requirements
    if (
      rawMsg.includes('password') ||
      type.includes('password') ||
      rawMsg.includes('at least 8')
    ) {
      return {
        title: 'Password Too Short',
        message:
          'Your password must be at least 8 characters long. Please choose a stronger password to protect your account.',
        type: 'error',
        primaryText: 'Update Password',
      };
    }

    // Invalid email format
    if (
      type.includes('param_email_invalid') ||
      rawMsg.includes('valid email') ||
      (rawMsg.includes('email') && rawMsg.includes('invalid'))
    ) {
      return {
        title: 'Invalid Email Address',
        message: 'Please enter a valid email address (e.g. name@example.com).',
        type: 'error',
        primaryText: 'Check Email',
      };
    }

    // Generic bad request / input check
    if (
      code === 400 ||
      rawMsg.includes('check the inputs') ||
      rawMsg.includes('error processing your request')
    ) {
      return {
        title: 'Check Your Details',
        message:
          'Could not complete registration. Please ensure your name is provided, email is valid, and password is at least 8 characters.',
        type: 'error',
        primaryText: 'Review Details',
      };
    }

    // Rate limit
    if (code === 429 || type.includes('rate_limit') || rawMsg.includes('too many')) {
      return {
        title: 'Too Many Attempts',
        message: 'Please wait a minute before trying to register again.',
        type: 'warning',
        primaryText: 'OK',
      };
    }

    // Network / connection issue
    if (
      code === 0 ||
      rawMsg.includes('network') ||
      rawMsg.includes('fetch') ||
      rawMsg.includes('timeout') ||
      rawMsg.includes('offline')
    ) {
      return {
        title: 'Network Issue',
        message: 'Unable to connect to Racoonn servers. Please verify your internet connection and try again.',
        type: 'error',
        primaryText: 'Retry',
        action: 'retry',
      };
    }

    return {
      title: 'Registration Error',
      message:
        error?.message ||
        'There was an unexpected error creating your account. Please check your connection and try again.',
      type: 'error',
      primaryText: 'OK',
    };
  }

  // --- Login Context ---
  if (
    code === 401 ||
    type.includes('credentials') ||
    type.includes('user_invalid_credentials') ||
    rawMsg.includes('invalid credentials') ||
    rawMsg.includes('password')
  ) {
    return {
      title: 'Incorrect Credentials',
      message: 'The email address or password entered does not match our records. Please verify and try again.',
      type: 'error',
      primaryText: 'Try Again',
    };
  }

  if (
    type.includes('user_blocked') ||
    type.includes('user_disabled') ||
    rawMsg.includes('blocked') ||
    rawMsg.includes('disabled')
  ) {
    return {
      title: 'Account Disabled',
      message: 'This account has been deactivated or deleted. Please register a new account or contact support.',
      type: 'warning',
      primaryText: 'OK',
    };
  }

  if (
    code === 0 ||
    rawMsg.includes('network') ||
    rawMsg.includes('fetch') ||
    rawMsg.includes('timeout')
  ) {
    return {
      title: 'Network Issue',
      message: 'Unable to connect to Racoonn servers. Please check your internet connection and try again.',
      type: 'error',
      primaryText: 'Retry',
    };
  }

  return {
    title: 'Sign In Failed',
    message: error?.message || 'Unable to sign in at this moment. Please try again.',
    type: 'error',
    primaryText: 'OK',
  };
}
