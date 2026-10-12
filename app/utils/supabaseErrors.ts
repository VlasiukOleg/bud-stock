/**
 * Утиліта для локалізації помилок Supabase Auth
 */
export const getSupabaseAuthErrorMessage = (error: any, t?: (key: string, fallback?: string) => string): string => {
  if (!error) return ''

  const code = (typeof error === 'object' && error?.code ? String(error.code).toLowerCase() : '')
  const rawMsg = typeof error === 'string' ? error : (error?.message || '')
  const msg = rawMsg.toLowerCase()

  const translate = (key: string, fallback: string) => {
    return t ? t(key, fallback) : fallback
  }

  // 1. Невірні облікові дані (пароль або пошта)
  if (
    code === 'invalid_credentials' ||
    code === 'invalid_grant' ||
    msg.includes('invalid login credentials') ||
    msg.includes('invalid credentials')
  ) {
    return translate('auth.errors.invalid_credentials', 'Невірний email або пароль.')
  }

  // 2. Користувач вже зареєстрований
  if (
    code === 'user_already_exists' ||
    code === 'email_exists' ||
    msg.includes('user already registered') ||
    msg.includes('already registered')
  ) {
    return translate('auth.errors.user_already_exists', 'Користувач із цим email вже зареєстрований.')
  }

  // 3. Email не підтверджено
  if (code === 'email_not_confirmed' || msg.includes('email not confirmed')) {
    return translate('auth.errors.email_not_confirmed', 'Email ще не підтверджено. Будь ласка, перевірте поштову скриньку.')
  }

  // 4. Ліміт запитів (Rate limit)
  if (
    code === 'over_request_rate_limit' ||
    code === 'over_email_send_rate_limit' ||
    msg.includes('rate limit') ||
    msg.includes('security purposes') ||
    msg.includes('too many requests')
  ) {
    return translate('auth.errors.over_request_rate_limit', 'Забагато спроб. Будь ласка, зачекайте хвилину і спробуйте знову.')
  }

  // 5. Слабкий або короткий пароль
  if (
    code === 'weak_password' ||
    msg.includes('password should be at least') ||
    msg.includes('weak password')
  ) {
    return translate('auth.errors.weak_password', 'Пароль занадто простий. Він повинен містити щонайменше 8 символів.')
  }

  // 6. Застаріле посилання або OTP токен
  if (
    code === 'otp_expired' ||
    code === 'flow_state_expired' ||
    code === 'flow_state_not_found' ||
    msg.includes('token has expired') ||
    msg.includes('otp expired') ||
    msg.includes('invalid or expired')
  ) {
    return translate('auth.errors.otp_expired', 'Посилання застаріло або недійсне. Будь ласка, запросіть нове.')
  }

  // 7. Користувача не знайдено
  if (code === 'user_not_found' || msg.includes('user not found')) {
    return translate('auth.errors.user_not_found', 'Користувача з таким email не знайдено.')
  }

  // 8. Невірний формат email
  if (
    code === 'email_address_invalid' ||
    code === 'validation_failed' ||
    msg.includes('invalid email') ||
    msg.includes('unable to validate email')
  ) {
    return translate('auth.errors.email_address_invalid', 'Введіть коректну адресу електронної пошти.')
  }

  // 9. Новий пароль такий самий як старий
  if (code === 'same_password' || msg.includes('should be different from the old password')) {
    return translate('auth.errors.same_password', 'Новий пароль повинен відрізнятися від старого.')
  }

  // 10. Помилка мережі
  if (msg.includes('failed to fetch') || msg.includes('network') || msg.includes('fetch failed')) {
    return translate('auth.errors.network_error', "Помилка мережі. Перевірте з'єднання з інтернетом.")
  }

  return rawMsg || translate('auth.errors.general', 'Сталася помилка під час авторизації.')
}

