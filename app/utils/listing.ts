/**
 * Утиліти для роботи зі станами та життєвим циклом оголошень BudStock
 */

/**
 * Перевіряє, чи закінчився термін дії оголошення (25 днів)
 */
export const isListingExpired = (product?: any | null): boolean => {
  if (!product?.expires_at) return false;
  return new Date(product.expires_at).getTime() <= Date.now();
};

/**
 * Перевіряє, чи є оголошення/товар неактивним
 * (продано, деактивовано, видалено, на модерації, відхилено, або термін розміщення вичерпано)
 */
export const isListingInactive = (product?: any | null): boolean => {
  if (!product) return true;
  const state = product.listing_state;
  if (state === 'sold' || state === 'deactivated' || state === 'deleted' || state === 'moderation' || state === 'rejected') {
    return true;
  }
  return isListingExpired(product);
};
