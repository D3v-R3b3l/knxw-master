import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "./LoadingStates";
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { cn } from "@/lib/utils";

// Form field wrapper with error handling
export const FormField = ({ 
  label, 
  error, 
  required, 
  children, 
  className = "",
  description 
}) => {
  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label className="text-sm font-medium text-white">
          {label}
          {required && <span className="text-[#ef4444] ml-1">*</span>}
        </Label>
      )}
      {children}
      {description && (
        <p className="text-xs text-[#6b7280]">{description}</p>
      )}
      {error && (
        <div className="flex items-center gap-2 text-[#ef4444] text-sm">
          <AlertTriangle className="w-4 h-4" />
          {error}
        </div>
      )}
    </div>
  );
};

// Enhanced input with validation states
export const ValidatedInput = ({ 
  value, 
  onChange, 
  onBlur,
  error, 
  success,
  loading,
  className = "",
  ...props 
}) => {
  return (
    <div className="relative">
      <Input
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        className={cn(
          "bg-[#0a0a0a] border-[#262626] text-white pr-10",
          error && "border-[#ef4444] focus:border-[#ef4444]",
          success && "border-[#10b981] focus:border-[#10b981]",
          className
        )}
        {...props}
      />
      
      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
        {loading && <LoadingSpinner size="sm" />}
        {!loading && error && <AlertTriangle className="w-4 h-4 text-[#ef4444]" />}
        {!loading && success && <CheckCircle className="w-4 h-4 text-[#10b981]" />}
      </div>
    </div>
  );
};

// Form section with collapsible content
export const FormSection = ({ 
  title, 
  description, 
  children, 
  collapsible = false,
  defaultExpanded = true,
  className = ""
}) => {
  const [expanded, setExpanded] = React.useState(defaultExpanded);

  return (
    <div className={cn("space-y-4", className)}>
      <div 
        className={cn(
          "border-b border-[#262626] pb-3",
          collapsible && "cursor-pointer"
        )}
        onClick={() => collapsible && setExpanded(!expanded)}
      >
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        {description && (
          <p className="text-sm text-[#a3a3a3] mt-1">{description}</p>
        )}
      </div>
      
      {(!collapsible || expanded) && (
        <div className="space-y-4">
          {children}
        </div>
      )}
    </div>
  );
};

// Multi-select with tags
export const TagSelect = ({ 
  value = [], 
  onChange, 
  options = [], 
  placeholder = "Select options...",
  error,
  className = ""
}) => {
  const [inputValue, setInputValue] = React.useState('');
  const [isOpen, setIsOpen] = React.useState(false);

  const handleSelect = (option) => {
    if (!value.includes(option.value)) {
      onChange([...value, option.value]);
    }
    setInputValue('');
    setIsOpen(false);
  };

  const handleRemove = (valueToRemove) => {
    onChange(value.filter(v => v !== valueToRemove));
  };

  const filteredOptions = options.filter(option => 
    option.label.toLowerCase().includes(inputValue.toLowerCase()) &&
    !value.includes(option.value)
  );

  return (
    <div className="relative">
      <div className={cn(
        "min-h-[40px] p-2 bg-[#0a0a0a] border border-[#262626] rounded-lg",
        error && "border-[#ef4444]",
        className
      )}>
        <div className="flex flex-wrap gap-1 mb-2">
          {value.map(val => {
            const option = options.find(opt => opt.value === val);
            return option ? (
              <Badge 
                key={val} 
                className="bg-[#00d4ff]/20 text-[#00d4ff] border-[#00d4ff]/30"
              >
                {option.label}
                <button
                  onClick={() => handleRemove(val)}
                  className="ml-2 hover:text-white"
                >
                  ×
                </button>
              </Badge>
            ) : null;
          })}
        </div>
        
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          placeholder={value.length === 0 ? placeholder : ""}
          className="w-full bg-transparent text-white text-sm outline-none"
        />
      </div>

      {isOpen && filteredOptions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-[#111111] border border-[#262626] rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {filteredOptions.map(option => (
            <button
              key={option.value}
              onClick={() => handleSelect(option)}
              className="w-full px-3 py-2 text-left text-white hover:bg-[#262626] transition-colors"
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Form submission with loading and error states
export const FormActions = ({ 
  onSubmit, 
  onCancel, 
  loading = false,
  submitText = "Save",
  cancelText = "Cancel",
  submitDisabled = false,
  className = ""
}) => {
  return (
    <div className={cn("flex justify-end gap-3 pt-6 border-t border-[#262626]", className)}>
      {onCancel && (
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
          className="border-[#262626] text-[#a3a3a3] hover:bg-[#1a1a1a]"
        >
          {cancelText}
        </Button>
      )}
      
      <Button
        type="submit"
        onClick={onSubmit}
        disabled={loading || submitDisabled}
        className="bg-[#00d4ff] hover:bg-[#0ea5e9] text-[#0a0a0a]"
      >
        {loading && <LoadingSpinner size="sm" className="mr-2" />}
        {loading ? "Saving..." : submitText}
      </Button>
    </div>
  );
};

// Hook for form state management
export function useFormState(initialState = {}, validationRules = {}) {
  const [values, setValues] = React.useState(initialState);
  const [errors, setErrors] = React.useState({});
  const [touched, setTouched] = React.useState({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const setValue = (field, value) => {
    setValues(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const setFieldTouched = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const validate = React.useCallback(() => {
    const newErrors = {};
    
    Object.entries(validationRules).forEach(([field, rules]) => {
      const value = values[field];
      
      if (rules.required && (!value || (typeof value === 'string' && !value.trim()))) {
        newErrors[field] = rules.requiredMessage || `${field} is required`;
        return;
      }
      
      if (rules.minLength && value && value.length < rules.minLength) {
        newErrors[field] = `Must be at least ${rules.minLength} characters`;
        return;
      }
      
      if (rules.maxLength && value && value.length > rules.maxLength) {
        newErrors[field] = `Must be no more than ${rules.maxLength} characters`;
        return;
      }
      
      if (rules.pattern && value && !rules.pattern.test(value)) {
        newErrors[field] = rules.patternMessage || 'Invalid format';
        return;
      }
      
      if (rules.custom && value) {
        const customError = rules.custom(value, values);
        if (customError) {
          newErrors[field] = customError;
          return;
        }
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [values, validationRules]);

  const handleSubmit = async (onSubmit) => {
    setIsSubmitting(true);
    
    // Mark all fields as touched
    const allFields = Object.keys(validationRules);
    setTouched(Object.fromEntries(allFields.map(field => [field, true])));
    
    const isValid = validate();
    
    if (isValid) {
      try {
        await onSubmit(values);
      } catch (error) {
        console.error('Form submission error:', error);
      }
    }
    
    setIsSubmitting(false);
  };

  const reset = () => {
    setValues(initialState);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  };

  return {
    values,
    errors,
    touched,
    isSubmitting,
    setValue,
    setFieldTouched,
    validate,
    handleSubmit,
    reset,
    isValid: Object.keys(errors).length === 0
  };
}