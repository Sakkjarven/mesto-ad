function showInputError(formElement, inputElement, settings, errorMessage) {
  const errorElement = formElement.querySelector(`#${inputElement.id}-error`);
  inputElement.classList.add(settings.inputErrorClass);
  errorElement.textContent = errorMessage;
  errorElement.classList.add(settings.errorClass);
}

function hideInputError(formElement, inputElement, settings) {
  const errorElement = formElement.querySelector(`#${inputElement.id}-error`);
  inputElement.classList.remove(settings.inputErrorClass);
  errorElement.textContent = '';
  errorElement.classList.remove(settings.errorClass);
}

function checkInputValidity(formElement, inputElement, settings) {
  if (!inputElement.validity.valid) {
    const errorMessage =
      inputElement.dataset.errorMessage ||
      inputElement.validationMessage;

    showInputError(formElement, inputElement, settings, errorMessage);
    return false;
  }

  hideInputError(formElement, inputElement, settings);
  return true;
}

function hasInvalidInput(formElement, inputList, settings) {
  return inputList.some(input => !checkInputValidity(formElement, input, settings)
  );
}

function enableSubmitButton(formElement, settings) {
  const button = formElement.querySelector(settings.submitButtonSelector);
  button.classList.remove(settings.inactiveButtonClass);
  button.disabled = false;
}

function disableSubmitButton(formElement, settings) {
  const button = formElement.querySelector(settings.submitButtonSelector);
  button.classList.add(settings.inactiveButtonClass);
  button.disabled = true;
}

function toggleButtonState(formElement, inputList, settings) {
  if (hasInvalidInput(formElement, inputList, settings)) {
    disableSubmitButton(formElement, settings);
  } else {
    enableSubmitButton(formElement, settings);
  }
}

function setEventListeners(formElement, settings) {
  const inputList = Array.from(formElement.querySelectorAll(settings.inputSelector));
  const button = formElement.querySelector(settings.submitButtonSelector);

  toggleButtonState(formElement, inputList, settings);

  inputList.forEach(inputElement => {
    inputElement.addEventListener('input', function () {
      checkInputValidity(formElement, inputElement, settings);
      toggleButtonState(formElement, inputList, settings);
    });
  });
}

export function clearValidation(formElement, settings) {
  const inputList = Array.from(formElement.querySelectorAll(settings.inputSelector));
  inputList.forEach(inputElement => {
    hideInputError(formElement, inputElement, settings);
  });
  disableSubmitButton(formElement, settings);
}

export function enableValidation(settings) {
  const formList = Array.from(document.querySelectorAll(settings.formSelector));
  formList.forEach(el => {
    el.addEventListener('submit', function (evt) {
      evt.preventDefault();
    });
    setEventListeners(el, settings);
  });
}
