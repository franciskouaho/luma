"use client";

import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { AlertCircle, CheckCircle, Eye, EyeOff } from "lucide-react";
import * as React from "react";

// Types de validation
export type ValidationRule = {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: string) => string | null;
  email?: boolean;
  url?: boolean;
  phone?: boolean;
  strongPassword?: boolean;
};

export type ValidationResult = {
  isValid: boolean;
  errors: string[];
  warnings: string[];
};

// Variantes du composant
const inputVariants = cva(
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
  {
    variants: {
      variant: {
        default: "border-input",
        error: "border-red-500 focus-visible:ring-red-500",
        success: "border-green-500 focus-visible:ring-green-500",
        warning: "border-yellow-500 focus-visible:ring-yellow-500",
      },
      size: {
        default: "h-10",
        sm: "h-9 text-xs",
        lg: "h-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface SecureInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
    VariantProps<typeof inputVariants> {
  validation?: ValidationRule;
  showValidation?: boolean;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  sanitize?: boolean;
  preventXSS?: boolean;
  maxRetries?: number;
  onValidationChange?: (result: ValidationResult) => void;
  label?: string;
  description?: string;
  errorMessages?: Partial<Record<keyof ValidationRule, string>>;
}

// Expressions régulières prédéfinies
const PATTERNS = {
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  url: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
  phone: /^[\+]?[1-9][\d]{0,15}$/,
  strongPassword:
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
};

// Messages d'erreur par défaut
const DEFAULT_ERROR_MESSAGES = {
  required: "Ce champ est requis",
  minLength: "Trop court",
  maxLength: "Trop long",
  pattern: "Format invalide",
  email: "Adresse email invalide",
  url: "URL invalide",
  phone: "Numéro de téléphone invalide",
  strongPassword:
    "Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial",
};

// Fonctions utilitaires de sécurité
const sanitizeHTML = (input: string): string => {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
};

const preventXSSAttacks = (input: string): string => {
  // Supprimer les scripts et événements potentiellement dangereux
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+\s*=/gi, "")
    .replace(/data:text\/html/gi, "");
};

// Fonction de validation principale
const validateInput = (
  value: string,
  rules: ValidationRule,
  errorMessages: Partial<Record<keyof ValidationRule, string>>,
): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validation required
  if (rules.required && (!value || value.trim().length === 0)) {
    errors.push(errorMessages.required || DEFAULT_ERROR_MESSAGES.required);
  }

  if (value && value.length > 0) {
    // Validation longueur minimale
    if (rules.minLength && value.length < rules.minLength) {
      errors.push(
        errorMessages.minLength ||
          `${DEFAULT_ERROR_MESSAGES.minLength} (minimum ${rules.minLength} caractères)`,
      );
    }

    // Validation longueur maximale
    if (rules.maxLength && value.length > rules.maxLength) {
      errors.push(
        errorMessages.maxLength ||
          `${DEFAULT_ERROR_MESSAGES.maxLength} (maximum ${rules.maxLength} caractères)`,
      );
    }

    // Validation pattern personnalisé
    if (rules.pattern && !rules.pattern.test(value)) {
      errors.push(errorMessages.pattern || DEFAULT_ERROR_MESSAGES.pattern);
    }

    // Validation email
    if (rules.email && !PATTERNS.email.test(value)) {
      errors.push(errorMessages.email || DEFAULT_ERROR_MESSAGES.email);
    }

    // Validation URL
    if (rules.url && !PATTERNS.url.test(value)) {
      errors.push(errorMessages.url || DEFAULT_ERROR_MESSAGES.url);
    }

    // Validation téléphone
    if (rules.phone && !PATTERNS.phone.test(value)) {
      errors.push(errorMessages.phone || DEFAULT_ERROR_MESSAGES.phone);
    }

    // Validation mot de passe fort
    if (rules.strongPassword) {
      if (!PATTERNS.strongPassword.test(value)) {
        errors.push(
          errorMessages.strongPassword || DEFAULT_ERROR_MESSAGES.strongPassword,
        );
      } else {
        // Vérifications supplémentaires pour les avertissements
        if (value.length < 12) {
          warnings.push(
            "Considérez un mot de passe plus long (12+ caractères)",
          );
        }
        if (!/(?=.*[0-9].*[0-9])/.test(value)) {
          warnings.push("Considérez d'ajouter plus de chiffres");
        }
      }
    }

    // Validation personnalisée
    if (rules.custom) {
      const customError = rules.custom(value);
      if (customError) {
        errors.push(customError);
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

const SecureInput = React.forwardRef<HTMLInputElement, SecureInputProps>(
  (
    {
      className,
      type = "text",
      variant,
      size,
      validation,
      showValidation = true,
      validateOnChange = true,
      validateOnBlur = true,
      sanitize = true,
      preventXSS = true,
      maxRetries = 3,
      onValidationChange,
      label,
      description,
      errorMessages = {},
      onChange,
      onBlur,
      value,
      ...props
    },
    ref,
  ) => {
    const [internalValue, setInternalValue] = React.useState(value || "");
    const [validationResult, setValidationResult] =
      React.useState<ValidationResult>({
        isValid: true,
        errors: [],
        warnings: [],
      });
    const [showPassword, setShowPassword] = React.useState(false);
    const [attempts, setAttempts] = React.useState(0);
    const [isLocked, setIsLocked] = React.useState(false);

    const isPasswordType = type === "password";
    const inputType = isPasswordType && showPassword ? "text" : type;

    // Fonction de validation
    const performValidation = React.useCallback(
      (inputValue: string) => {
        if (!validation) return { isValid: true, errors: [], warnings: [] };

        const result = validateInput(inputValue, validation, errorMessages);
        setValidationResult(result);
        onValidationChange?.(result);
        return result;
      },
      [validation, errorMessages, onValidationChange],
    );

    // Gestion du changement de valeur
    const handleChange = React.useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        if (isLocked) return;

        let newValue = e.target.value;

        // Appliquer la sanitisation si activée
        if (sanitize) {
          newValue = sanitizeHTML(newValue);
        }

        // Prévenir les attaques XSS si activé
        if (preventXSS) {
          newValue = preventXSSAttacks(newValue);
        }

        setInternalValue(newValue);

        // Validation en temps réel si activée
        if (validateOnChange) {
          const result = performValidation(newValue);

          // Gestion des tentatives multiples pour les champs sensibles
          if (!result.isValid && validation?.required) {
            setAttempts((prev) => prev + 1);
            if (attempts >= maxRetries - 1) {
              setIsLocked(true);
              setTimeout(() => {
                setIsLocked(false);
                setAttempts(0);
              }, 30000); // Verrouillage de 30 secondes
            }
          }
        }

        // Appeler le onChange parent avec la valeur nettoyée
        if (onChange) {
          const syntheticEvent = {
            ...e,
            target: { ...e.target, value: newValue },
          };
          onChange(syntheticEvent);
        }
      },
      [
        isLocked,
        sanitize,
        preventXSS,
        validateOnChange,
        performValidation,
        validation?.required,
        attempts,
        maxRetries,
        onChange,
      ],
    );

    // Gestion de la perte de focus
    const handleBlur = React.useCallback(
      (e: React.FocusEvent<HTMLInputElement>) => {
        if (validateOnBlur) {
          performValidation(String(internalValue));
        }
        onBlur?.(e);
      },
      [validateOnBlur, performValidation, internalValue, onBlur],
    );

    // Déterminer la variante basée sur la validation
    const getVariant = React.useCallback(() => {
      if (variant) return variant;
      if (!showValidation || !validation) return "default";

      if (validationResult.errors.length > 0) return "error";
      if (validationResult.warnings.length > 0) return "warning";
      if (internalValue && validationResult.isValid) return "success";

      return "default";
    }, [variant, showValidation, validation, validationResult, internalValue]);

    // Synchroniser avec la prop value externe
    React.useEffect(() => {
      if (value !== undefined && value !== internalValue) {
        setInternalValue(String(value));
      }
    }, [value, internalValue]);

    return (
      <div className="space-y-2">
        {label && (
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {label}
            {validation?.required && (
              <span className="text-red-500 ml-1">*</span>
            )}
          </label>
        )}

        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}

        <div className="relative">
          <input
            type={inputType}
            className={cn(
              inputVariants({ variant: getVariant(), size, className }),
            )}
            ref={ref}
            value={internalValue}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={isLocked || props.disabled}
            {...props}
          />

          {/* Bouton pour afficher/masquer le mot de passe */}
          {isPasswordType && (
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-gray-400" />
              ) : (
                <Eye className="h-4 w-4 text-gray-400" />
              )}
            </button>
          )}

          {/* Indicateur de validation */}
          {showValidation && validation && internalValue && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              {isPasswordType ? null : validationResult.isValid ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-500" />
              )}
            </div>
          )}
        </div>

        {/* Messages de validation */}
        {showValidation && (
          <div className="space-y-1">
            {validationResult.errors.map((error, index) => (
              <p
                key={`error-${index}`}
                className="text-sm text-red-600 flex items-center gap-1"
              >
                <AlertCircle className="h-3 w-3" />
                {error}
              </p>
            ))}
            {validationResult.warnings.map((warning, index) => (
              <p
                key={`warning-${index}`}
                className="text-sm text-yellow-600 flex items-center gap-1"
              >
                <AlertCircle className="h-3 w-3" />
                {warning}
              </p>
            ))}
          </div>
        )}

        {/* Indicateur de verrouillage */}
        {isLocked && (
          <p className="text-sm text-red-600">
            Trop de tentatives incorrectes. Verrouillé pendant 30 secondes.
          </p>
        )}

        {/* Indicateur de tentatives */}
        {maxRetries > 1 && attempts > 0 && !isLocked && (
          <p className="text-sm text-yellow-600">
            Tentatives restantes: {maxRetries - attempts}
          </p>
        )}
      </div>
    );
  },
);

SecureInput.displayName = "SecureInput";

export {
  inputVariants,
  preventXSSAttacks,
  sanitizeHTML,
  SecureInput,
  validateInput,
};
