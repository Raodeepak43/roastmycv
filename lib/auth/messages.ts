/** Safe auth copy — never reveal account existence, lockout, or field-level failures */

export const AUTH_SIGNIN_INVALID = 'Incorrect email or password'

export const AUTH_SIGNUP_SUCCESS =
  'If that email is registered, check your inbox to continue setting up your account.'

export const AUTH_SIGNUP_INVALID = 'Unable to create account. Please check your details and try again.'

export const AUTH_BODY_INVALID = 'Invalid request. Please try again.'

export const AUTH_RESET_SUCCESS =
  "If that email is registered, you'll receive a reset link"

export const AUTH_RESET_EXPIRED =
  'That reset link has expired or was already used. Request a new one below.'

export const AUTH_PASSWORD_UPDATED = 'Password updated. You can sign in with your new password.'

export const AUTH_PASSWORD_UPDATE_INVALID =
  'Could not update password. Open the link from your email again or request a new reset.'

export const AUTH_GOOGLE_INVALID = 'Sign-in failed. Please try again.'

export const AUTH_SERVER_ERROR = 'Something went wrong. Please try again.'
