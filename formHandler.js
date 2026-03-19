/**
 * formHandler.js
 * Comprehensive form handling for Moto Agora
 * - Input masking (CPF, phone)
 * - Real-time validation
 * - Webhook integration
 * - WhatsApp redirect
 */

(function() {
  'use strict';

  // Configuration
  const CONFIG = {
    webhookURL: 'https://motoagora-n8n.ugsmqj.easypanel.host/webhook/cc09ef7f-0ee1-446b-b4c4-bb835c4ab621',
    whatsappNumber: '5584996248216',
    timeout: 5000 // 5 seconds
  };

  // =======================
  // 1. INPUT MASKING
  // =======================

  function maskCPF(value) {
    // Remove non-digits
    value = value.replace(/\D/g, '');
    // Apply mask: 000.000.000-00
    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    return value;
  }

  function maskPhone(value) {
    // Remove non-digits
    value = value.replace(/\D/g, '');
    // Apply mask: (84) 9 0000-0000
    value = value.replace(/^(\d{2})(\d)/, '($1) $2');
    value = value.replace(/(\d{1})(\d{4})(\d)/, '$1 $2-$3');
    return value;
  }

  // =======================
  // 2. VALIDATION FUNCTIONS
  // =======================

  function validateCPF(cpf) {
    // Remove formatting
    cpf = cpf.replace(/\D/g, '');

    // Check length
    if (cpf.length !== 11) return false;

    // Check for repeated digits (111.111.111-11, etc.)
    if (/^(\d)\1{10}$/.test(cpf)) return false;

    // Validate check digits
    let sum = 0;
    let remainder;

    // First check digit
    for (let i = 1; i <= 9; i++) {
      sum += parseInt(cpf.substring(i - 1, i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.substring(9, 10))) return false;

    // Second check digit
    sum = 0;
    for (let i = 1; i <= 10; i++) {
      sum += parseInt(cpf.substring(i - 1, i)) * (12 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.substring(10, 11))) return false;

    return true;
  }

  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  function validatePhone(phone) {
    const digits = phone.replace(/\D/g, '');
    return digits.length === 11; // (84) 9 0000-0000 = 11 digits
  }

  function validateName(name) {
    return name.trim().length >= 3;
  }

  // =======================
  // 3. FIELD VALIDATION
  // =======================

  function showError(inputElement, message) {
    const formGroup = inputElement.closest('.form-group');
    const errorSpan = formGroup.querySelector('.form-error');

    inputElement.classList.add('input-error');
    errorSpan.textContent = message;
    errorSpan.style.display = 'block';
  }

  function clearError(inputElement) {
    const formGroup = inputElement.closest('.form-group');
    const errorSpan = formGroup.querySelector('.form-error');

    inputElement.classList.remove('input-error');
    errorSpan.textContent = '';
    errorSpan.style.display = 'none';
  }

  function validateField(input) {
    const value = input.value.trim();
    const name = input.name;

    clearError(input);

    switch(name) {
      case 'nome':
        if (!validateName(value)) {
          showError(input, 'Digite seu nome completo (mínimo 3 caracteres)');
          return false;
        }
        break;

      case 'cpf':
        if (!validateCPF(value)) {
          showError(input, 'CPF inválido. Verifique os números digitados.');
          return false;
        }
        break;

      case 'email':
        if (!validateEmail(value)) {
          showError(input, 'E-mail inválido. Use o formato: nome@exemplo.com');
          return false;
        }
        break;

      case 'telefone':
        if (!validatePhone(value)) {
          showError(input, 'Telefone inválido. Use o formato: (84) 9 0000-0000');
          return false;
        }
        break;

      case 'cnh':
        if (!value) {
          showError(input, 'Por favor, informe se possui CNH');
          return false;
        }
        break;

      case 'moto':
        if (!value) {
          showError(input, 'Por favor, selecione uma moto');
          return false;
        }
        break;
    }

    return true;
  }

  // =======================
  // 4. WEBHOOK SUBMISSION
  // =======================

  async function sendToWebhook(formData) {
    try {
      const response = await fetch(CONFIG.webhookURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
        signal: AbortSignal.timeout(CONFIG.timeout)
      });

      if (!response.ok) {
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  // =======================
  // 5. FORM SUBMISSION
  // =======================

  async function handleFormSubmit(form, motoFromPage = null) {
    // Prevent default
    event.preventDefault();

    // Get all inputs
    const inputs = form.querySelectorAll('input, select');
    let isValid = true;

    // Validate all fields
    inputs.forEach(input => {
      if (input.type !== 'hidden' && !validateField(input)) {
        isValid = false;
      }
    });

    if (!isValid) {
      showFormStatus(form, 'Por favor, corrija os erros acima.', 'error');
      return;
    }

    // Collect form data
    const formData = {
      nome: form.nome.value.trim(),
      telefone: form.telefone.value.trim(),
      cpf: form.cpf.value.replace(/\D/g, ''),
      email: form.email.value.trim(),
      cnh: form.cnh.value,
      moto: motoFromPage || form.moto?.value || 'Não especificada',
      plano: form.plano?.value || '',
      timestamp: new Date().toISOString(),
      source: window.location.pathname
    };

    // Show loading state
    const submitBtn = form.querySelector('button[type="submit"]');
    setButtonLoading(submitBtn, true);

    // Send to webhook (fire and forget - don't block user)
    sendToWebhook(formData).catch(err => {
      // Silently ignore webhook errors
    });

    // Small delay to ensure webhook fires
    await new Promise(resolve => setTimeout(resolve, 300));

    // Build WhatsApp message
    const message = buildWhatsAppMessage(formData);

    // Open WhatsApp
    window.open(`https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank');

    // Show success message
    showFormStatus(form, 'Dados enviados! Você será redirecionado para o WhatsApp.', 'success');

    // Reset loading state
    setButtonLoading(submitBtn, false);

    // Reset form after 2 seconds
    setTimeout(() => {
      form.reset();
      clearAllErrors(form);
    }, 2000);
  }

  function buildWhatsAppMessage(data) {
    let msg = `Olá! Meu nome é *${data.nome}*.\n\n`;
    msg += `Tenho interesse em alugar uma moto:\n`;
    msg += `🏍️ *Moto:* ${data.moto}\n`;

    if (data.plano) {
      msg += `📋 *Plano:* ${data.plano}\n`;
    }

    msg += `\nQuero saber mais informações!`;

    return msg;
  }

  function showFormStatus(form, message, type) {
    const statusDiv = form.querySelector('.form-status') || form.querySelector('#formStatus');
    if (!statusDiv) return;

    statusDiv.textContent = message;
    statusDiv.className = `form-status ${type}`;
    statusDiv.style.display = 'block';

    if (type === 'success') {
      setTimeout(() => {
        statusDiv.style.display = 'none';
      }, 5000);
    }
  }

  function setButtonLoading(button, loading) {
    const btnText = button.querySelector('.btn-text');
    const btnLoading = button.querySelector('.btn-loading');

    if (loading) {
      btnText.style.display = 'none';
      btnLoading.style.display = 'inline-block';
      button.disabled = true;
    } else {
      btnText.style.display = 'inline-block';
      btnLoading.style.display = 'none';
      button.disabled = false;
    }
  }

  function clearAllErrors(form) {
    form.querySelectorAll('.input-error').forEach(input => {
      clearError(input);
    });
  }

  // =======================
  // 6. EVENT LISTENERS
  // =======================

  function initFormHandlers() {
    // Homepage form
    const leadForm = document.getElementById('leadForm');
    if (leadForm) {
      leadForm.addEventListener('submit', (e) => {
        e.preventDefault();
        handleFormSubmit(leadForm);
      });

      // Add masking listeners
      const cpfInput = leadForm.querySelector('#cpf');
      if (cpfInput) {
        cpfInput.addEventListener('input', (e) => {
          e.target.value = maskCPF(e.target.value);
        });
        cpfInput.addEventListener('blur', (e) => validateField(e.target));
      }

      const phoneInput = leadForm.querySelector('#telefone');
      if (phoneInput) {
        phoneInput.addEventListener('input', (e) => {
          e.target.value = maskPhone(e.target.value);
        });
        phoneInput.addEventListener('blur', (e) => validateField(e.target));
      }

      // Validate other fields on blur
      leadForm.querySelectorAll('input:not(#cpf):not(#telefone), select').forEach(input => {
        if (input.type !== 'hidden') {
          input.addEventListener('blur', (e) => validateField(e.target));
        }
      });
    }

    // Motorcycle page modal form
    const subscribeForm = document.getElementById('subscribeForm');
    if (subscribeForm) {
      // Get moto from body data attribute
      const motoName = document.body.getAttribute('data-moto') || '';

      subscribeForm.addEventListener('submit', (e) => {
        e.preventDefault();
        handleFormSubmit(subscribeForm, motoName);
      });

      // Add masking listeners for modal form
      const cpfInput = subscribeForm.querySelector('#cpf');
      if (cpfInput) {
        cpfInput.addEventListener('input', (e) => {
          e.target.value = maskCPF(e.target.value);
        });
        cpfInput.addEventListener('blur', (e) => validateField(e.target));
      }

      const phoneInput = subscribeForm.querySelector('#telefone');
      if (phoneInput) {
        phoneInput.addEventListener('input', (e) => {
          e.target.value = maskPhone(e.target.value);
        });
        phoneInput.addEventListener('blur', (e) => validateField(e.target));
      }

      // Validate other fields on blur
      subscribeForm.querySelectorAll('input:not(#cpf):not(#telefone), select').forEach(input => {
        if (input.type !== 'hidden') {
          input.addEventListener('blur', (e) => validateField(e.target));
        }
      });
    }
  }

  // =======================
  // 7. MODAL FUNCTIONS
  // =======================

  window.openSubscribeModal = function(planButton) {
    const modal = document.getElementById('subscribeModal');
    const form = document.getElementById('subscribeForm');

    if (!modal || !form) return;

    // Get plan info if triggered from plan card
    if (planButton && planButton.dataset) {
      const planInput = form.querySelector('#formPlano');
      if (planInput) {
        planInput.value = `${planButton.dataset.plan} - ${planButton.dataset.price}`;
      }

      const subtitle = document.getElementById('modalSubtitle');
      if (subtitle && planButton.dataset.plan) {
        subtitle.textContent = `Plano selecionado: ${planButton.dataset.plan}`;
      }
    }

    // Get moto from page
    const motoName = document.body.getAttribute('data-moto') || '';
    const motoInput = form.querySelector('#formMoto');
    if (motoInput) {
      motoInput.value = motoName;
    }

    // Show modal
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Focus first input
    setTimeout(() => {
      form.querySelector('input[type="text"]')?.focus();
    }, 300);
  };

  window.closeSubscribeModal = function() {
    const modal = document.getElementById('subscribeModal');
    if (!modal) return;

    modal.classList.remove('active');
    document.body.style.overflow = '';

    // Reset form
    const form = document.getElementById('subscribeForm');
    if (form) {
      form.reset();
      clearAllErrors(form);
    }
  };

  // Close on ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const modal = document.getElementById('subscribeModal');
      if (modal && modal.classList.contains('active')) {
        closeSubscribeModal();
      }
    }
  });

  // Close on backdrop click
  document.addEventListener('click', (e) => {
    if (e.target.id === 'subscribeModal') {
      closeSubscribeModal();
    }
  });

  // =======================
  // 8. INITIALIZATION
  // =======================

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFormHandlers);
  } else {
    initFormHandlers();
  }

})();
