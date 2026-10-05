export const URL_REGEX = /^https?:\/\/(www\.)?[\w\-._~:/?%#[\]@!$&'()*+,;=]+#?$/i;

export const validateUrl = (value: string): boolean => URL_REGEX.test(value);