window.hasSweetAlert = function hasSweetAlert() {
  return typeof window.Swal !== 'undefined';
};

window.swalConfirm = async function swalConfirm(options = {}) {
  if (!window.hasSweetAlert()) return window.confirm(options.text || options.title || 'Continue?');

  const result = await window.Swal.fire({
    title: options.title || 'Are you sure?',
    text: options.text || '',
    icon: options.icon || 'question',
    showCancelButton: true,
    confirmButtonText: options.confirmButtonText || 'Continue',
    cancelButtonText: options.cancelButtonText || 'Cancel',
    confirmButtonColor: options.confirmButtonColor || '#2f6fed',
    cancelButtonColor: options.cancelButtonColor || '#94a3b8',
    reverseButtons: true,
    focusCancel: true
  });

  return result.isConfirmed;
};

window.swalPromptMatch = async function swalPromptMatch(options = {}) {
  if (!window.hasSweetAlert()) {
    const value = window.prompt(options.text || 'Type to confirm:');
    return { confirmed: value === options.expectedValue, value };
  }

  const result = await window.Swal.fire({
    title: options.title || 'Confirm action',
    text: options.text || '',
    icon: options.icon || 'warning',
    input: 'text',
    inputPlaceholder: options.placeholder || '',
    showCancelButton: true,
    confirmButtonText: options.confirmButtonText || 'Confirm',
    cancelButtonText: options.cancelButtonText || 'Cancel',
    confirmButtonColor: options.confirmButtonColor || '#dc2626',
    cancelButtonColor: '#94a3b8',
    reverseButtons: true,
    inputValidator: value => {
      if (value !== options.expectedValue) return options.validationMessage || 'Value did not match.';
      return undefined;
    }
  });

  return { confirmed: result.isConfirmed, value: result.value };
};

window.swalNotice = async function swalNotice(options = {}) {
  if (!window.hasSweetAlert()) return;

  await window.Swal.fire({
    toast: Boolean(options.toast),
    position: options.position || (options.toast ? 'top-end' : 'center'),
    icon: options.icon || 'success',
    title: options.title || '',
    text: options.text || '',
    showConfirmButton: options.showConfirmButton ?? !options.toast,
    timer: options.timer || (options.toast ? 2200 : undefined),
    timerProgressBar: Boolean(options.timer),
    confirmButtonColor: options.confirmButtonColor || '#2f6fed'
  });
};
