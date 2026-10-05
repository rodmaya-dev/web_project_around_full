import { useState, useCallback } from 'react';

type FormValues = Record<string, string>;
type FormErrors = Record<string, string>;

export function useFormValidation(initialValues: FormValues = {}, initialIsValid = false) {
  const [values, setValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isValid, setIsValid] = useState(initialIsValid);

  const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, validationMessage, form } = event.target;

    setValues((prevValues) => ({ ...prevValues, [name]: value }));
    setErrors((prevErrors) => ({ ...prevErrors, [name]: validationMessage }));
    setIsValid(form?.checkValidity() ?? false);
  }, []);

  return { values, errors, isValid, handleChange };
}