import React from 'react';
import toast from 'react-hot-toast';
import { isAxiosError } from 'axios';

import { getZodValidationIssues } from '../../../utils/errorHandlingUtils';
import { logger } from '../../../utils/logger';
import vendorSignupFormZodValidationSchema from '../formZodValidationSchema';
import { isProductionEnv } from '../../../utils/utils';
import { registerVendor } from '../../../api/vendor';
import { UknownObject } from '../../../types/general';

type FormStateFields = {
  fullname: string;
  email: string;
  password: string;
};

type FormState = FormStateFields & {
  touchedFieldList: (keyof FormStateFields)[];
  registerationStatus: 'idle' | 'loading' | 'success' | 'error';
  errors: null | Partial<FormStateFields> | UknownObject;
};

const initialFormState: FormState = {
  registerationStatus: 'idle',
  touchedFieldList: [],
  fullname: '',
  email: '',
  password: '',
  errors: null,
};

const useVendorSignup = () => {
  const [formState, setFormState] = React.useState<FormState>(initialFormState);
  const { fullname, email, password, errors, registerationStatus } = formState;
  const haveErrors = !!errors;
  const _errors = errors ?? {};
  const isFullnameInputError = 'fullname' in _errors;
  const fullnameInputErrorMsg = _errors?.fullname || '';
  const isEmailInputError = 'email' in _errors;
  const emailInputErrorMsg = _errors?.email || '';
  const isPasswordInputError = 'password' in _errors;
  const passwordInputErrorMsg = _errors?.password || '';
  const isRegisterationStatusLoading = registerationStatus === 'loading';
  const isRegisterationStatusSuccess = registerationStatus === 'success';
  const allFormControlsDisabled = isRegisterationStatusLoading;
  const isFormSubmitBtnDisabled = allFormControlsDisabled;
  const isDefaultValuesBtnVisible = false && !isProductionEnv;
  const isVendorConflictError = 'isVendorConflictError' in _errors;

  const updateFormState = (newState: Partial<FormState>) => {
    setFormState((oldVal) => ({
      ...oldVal,
      ...newState,
    }));
  };

  const enterTestValues = () => {
    if (isProductionEnv) return;
    updateFormState({
      fullname: 'aniket bhalla',
      email: 'aniket@gmail.com',
      password: 'aniKet2023$$',
    });
  };

  const updateRegisterationStatus = (status: FormState['registerationStatus']) => {
    updateFormState({
      registerationStatus: status,
    });
  };

  const handleFormValues = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState((oldVal) => ({
      ...oldVal,
      [name]: value,
    }));
  };

  const validateForm = async () => {
    try {
      if (errors) {
        updateFormState({
          errors: null,
        });
      }
      const validatedFormValues = await vendorSignupFormZodValidationSchema.parseAsync(
        formState
      );
      return validatedFormValues;
    } catch (error) {
      toast.error('Unable to create account 🫢');
      const issues = getZodValidationIssues(error);
      if (issues) {
        updateFormState({
          errors: issues,
        });
      }
    }
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const validatedFormValues = await validateForm();
      if (!validatedFormValues) return;
      const { fullname, email, password } = validatedFormValues;
      updateRegisterationStatus('loading');
      await registerVendor({
        fullname,
        email,
        password,
      });
      updateFormState({
        ...initialFormState,
        registerationStatus: 'success',
      });
    } catch (error) {
      updateRegisterationStatus('error');
      toast.error('Unable to create account 🫢');
      logger.error(error);
      if (isAxiosError(error)) {
        const response = error?.response ?? {};
        if ('data' in response) {
          const responseData = response.data as UknownObject;
          logger.log({ responseData });
          if ('isVendorConflictError' in responseData) {
            logger.error('Vendor conflict error');
            updateFormState({
              password: '',
              errors: {
                isVendorConflictError: true,
              },
            });
          }
        }
      }
    }
  };

  return {
    validationState: {
      haveErrors,
      isFullnameInputError,
      fullnameInputErrorMsg,
      isEmailInputError,
      emailInputErrorMsg,
      isPasswordInputError,
      passwordInputErrorMsg,
      isFormSubmitBtnDisabled,
      allFormControlsDisabled,
      isVendorConflictError,
    },
    formState: {
      fullname,
      email,
      password,
      errors,
      enterTestValues,
      isRegisterationStatusLoading,
      isRegisterationStatusSuccess,
    },
    isDefaultValuesBtnVisible,
    handleFormValues,
    handleFormSubmit,
  };
};

export default useVendorSignup;

// NOTE: functionality not required but shouldn't be deleted
//  const handleOnBlurEventOnFormInputFields = (
//   e: React.FocusEvent<HTMLInputElement, Element>
// ) => {
//   e.preventDefault();
//   return;
//   const interactedFieldName = e.target.name.trim() as keyof FormStateFields;
//   const isInteractedFieldNameInTouchedFieldList =
//     touchedFieldList.includes(interactedFieldName);
//   if (isInteractedFieldNameInTouchedFieldList) return;

//   updateFormState({
//     touchedFieldList: [...formState.touchedFieldList, interactedFieldName],
//   });
// };
