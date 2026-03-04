import { useState, type FormEvent } from 'react';
import { z } from 'zod';
import { useAuth } from '../../../context/AuthContext';
import { loginSchema, type LoginFormValues } from '../schemas/authSchemas';

interface FormErrors {
  email?: string;
  password?: string;
  form?: string;
}

const mapZodErrors = (error: z.ZodError<LoginFormValues>): FormErrors => {
  const errors: FormErrors = {};

  for (const issue of error.issues) {
    const field = issue.path[0] as keyof Omit<FormErrors, 'form'>;
    if (!errors[field]) {
      errors[field] = issue.message;
    }
  }

  return errors;
};

export const LoginForm = () => {
  const { login, isLoading } = useAuth();
  const [values, setValues] = useState<LoginFormValues>({ email: '', password: '' });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrors({});

    const parsed = loginSchema.safeParse(values);
    if (!parsed.success) {
      setErrors(mapZodErrors(parsed.error));
      return;
    }

    setIsSubmitting(true);
    try {
      await login(parsed.data);
    } catch {
      setErrors({ form: 'Invalid credentials. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <h2>Sign In</h2>
      <input
        type="email"
        value={values.email}
        onChange={(event) => setValues((prev) => ({ ...prev, email: event.target.value }))}
        placeholder="Email"
      />
      {errors.email ? <p>{errors.email}</p> : null}

      <input
        type="password"
        value={values.password}
        onChange={(event) => setValues((prev) => ({ ...prev, password: event.target.value }))}
        placeholder="Password"
      />
      {errors.password ? <p>{errors.password}</p> : null}

      {errors.form ? <p>{errors.form}</p> : null}

      <button type="submit" disabled={isSubmitting || isLoading}>
        {isSubmitting ? 'Signing in...' : 'Sign In'}
      </button>
    </form>
  );
};
