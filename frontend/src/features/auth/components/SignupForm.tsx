import { useState, type FormEvent } from 'react';
import { z } from 'zod';
import { useAuth } from '../../../context/AuthContext';
import { signupSchema, type SignupFormValues } from '../schemas/authSchemas';

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  form?: string;
}

const mapZodErrors = (error: z.ZodError<SignupFormValues>): FormErrors => {
  const errors: FormErrors = {};

  for (const issue of error.issues) {
    const field = issue.path[0] as keyof Omit<FormErrors, 'form'>;
    if (!errors[field]) {
      errors[field] = issue.message;
    }
  }

  return errors;
};

export const SignupForm = () => {
  const { register, isLoading } = useAuth();
  const [values, setValues] = useState<SignupFormValues>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrors({});

    const parsed = signupSchema.safeParse(values);
    if (!parsed.success) {
      setErrors(mapZodErrors(parsed.error));
      return;
    }

    setIsSubmitting(true);
    try {
      await register({
        name: parsed.data.name,
        email: parsed.data.email,
        password: parsed.data.password,
      });
      setIsSuccess(true);
      setValues({ name: '', email: '', password: '', confirmPassword: '' });
    } catch {
      setErrors({ form: 'Registration failed. Please try again.' });
      setIsSuccess(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <h2>Create Account</h2>

      <input
        type="text"
        value={values.name}
        onChange={(event) => setValues((prev) => ({ ...prev, name: event.target.value }))}
        placeholder="Name"
      />
      {errors.name ? <p>{errors.name}</p> : null}

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

      <input
        type="password"
        value={values.confirmPassword}
        onChange={(event) =>
          setValues((prev) => ({ ...prev, confirmPassword: event.target.value }))
        }
        placeholder="Confirm Password"
      />
      {errors.confirmPassword ? <p>{errors.confirmPassword}</p> : null}

      {errors.form ? <p>{errors.form}</p> : null}
      {isSuccess ? <p>Registration successful. You can now sign in.</p> : null}

      <button type="submit" disabled={isSubmitting || isLoading}>
        {isSubmitting ? 'Creating account...' : 'Sign Up'}
      </button>
    </form>
  );
};
