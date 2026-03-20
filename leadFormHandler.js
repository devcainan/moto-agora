/**
 * leadFormHandler.js
 * Unified form handler for all Moto Agora lead forms
 * Supports: validation, masking, file uploads, webhook submission, toast notifications
 */

(function() {
  'use strict';

  const WEBHOOK_URL = 'https://motoagora-n8n.ugsmqj.easypanel.host/webhook/cc09ef7f-0ee1-446b-b4c4-bb835c4ab621';

  /**
   * Initialize lead form with validation and submission
   * @param {string} formId - ID of the form element
   * @param {object} options - Configuration options
   * @param {string} options.toastId - ID of toast element (default: 'toast')
   * @param {array} options.fileInputs - Array of {input: 'inputId', label: 'labelId'}
   */
  window.initLeadForm = function(formId, options = {}) {
    const form = document.getElementById(formId);
    if (!form) {
      console.error(`Form with ID "${formId}" not found`);
      return;
    }

    const config = {
      toastId: options.toastId || 'toast',
      fileInputs: options.fileInputs || [
        { input: 'cnh_file', label: 'cnh_name' },
        { input: 'comp_file', label: 'comp_name' }
      ]
    };

    // Apply CPF mask
    const cpfInput = form.querySelector('[name="cpf"]');
    if (cpfInput) {
      cpfInput.addEventListener('input', function(e) {
        let v = e.target.value.replace(/\D/g,'');
        v = v.replace(/(\d{3})(\d)/,'$1.$2').replace(/(\d{3})(\d)/,'$1.$2').replace(/(\d{3})(\d{1,2})$/,'$1-$2');
        e.target.value = v;
      });
    }

    // Apply WhatsApp mask
    const whatsappInput = form.querySelector('[name="whatsapp"]');
    if (whatsappInput) {
      whatsappInput.addEventListener('input', function(e) {
        let v = e.target.value.replace(/\D/g,'');
        if(v.length<=10) v=v.replace(/(\d{2})(\d{4})(\d{0,4})/,'($1) $2-$3');
        else v=v.replace(/(\d{2})(\d{5})(\d{0,4})/,'($1) $2-$3');
        e.target.value = v.trim().replace(/-$/,'');
      });
    }

    // File upload handlers with visual feedback
    config.fileInputs.forEach(fileConfig => {
      const fileInput = document.getElementById(fileConfig.input);
      const nameLabel = document.getElementById(fileConfig.label);

      if (fileInput && nameLabel) {
        fileInput.addEventListener('change', function() {
          const fileName = this.files[0]?.name || 'Nenhum arquivo escolhido';
          nameLabel.textContent = fileName;

          if (this.files[0]) {
            nameLabel.style.color = '#4CAF50';
            nameLabel.style.fontWeight = 'bold';
          } else {
            nameLabel.style.color = '';
            nameLabel.style.fontWeight = '';
          }
        });
      }
    });

    // Toast notification function
    function showToast(msg, type='success') {
      const toast = document.getElementById(config.toastId);
      if (!toast) {
        console.error(`Toast element with ID "${config.toastId}" not found`);
        return;
      }
      toast.textContent = msg;
      toast.className = 'toast-notification ' + type;
      setTimeout(() => toast.classList.add('show'), 10);
      setTimeout(() => toast.classList.remove('show'), 4000);
    }

    // Form submission handler
    form.addEventListener('submit', async function(e) {
      e.preventDefault();

      // Get submit button
      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;
      }

      const formData = new FormData(this);
      const webhookData = new FormData();

      // Add text fields (email is optional now)
      ['nome_completo','whatsapp','cpf','plano_interesse','observacoes','cupom_desconto'].forEach(k => {
        if(formData.get(k)) webhookData.append(k, formData.get(k));
      });

      // Add email only if provided
      if(formData.get('email')) {
        webhookData.append('email', formData.get('email'));
      }

      // Add boolean fields
      const possuiCnh = formData.get('possui_cnh_a');
      if (possuiCnh !== null) {
        webhookData.append('possui_cnh_a', possuiCnh === 'true');
      }

      const aceiteContato = formData.get('aceite_contato');
      if (aceiteContato !== null) {
        webhookData.append('aceite_contato', aceiteContato === 'true');
      }

      // Add hidden fields (moto, plano, origem)
      if(formData.get('moto')) webhookData.append('moto', formData.get('moto'));
      if(formData.get('plano')) webhookData.append('plano', formData.get('plano'));
      if(formData.get('origem')) webhookData.append('origem', formData.get('origem'));

      // Add files (NOW OPTIONAL - only if provided)
      const cnhFile = form.querySelector('[name="cnh_file"]')?.files[0];
      const compFile = form.querySelector('[name="comprovante_residencial_file"]')?.files[0];

      if (cnhFile) {
        webhookData.append('cnh_file', cnhFile);
      }

      if (compFile) {
        webhookData.append('comprovante_residencial_file', compFile);
      }

      try {
        const res = await fetch(WEBHOOK_URL, {
          method: 'POST',
          body: webhookData
        });

        if(res.ok || res.status===200) {
          showToast('✅ Cadastro enviado com sucesso!');

          // Reset form
          this.reset();

          // Reset file upload labels
          config.fileInputs.forEach(fileConfig => {
            const nameLabel = document.getElementById(fileConfig.label);
            if (nameLabel) {
              nameLabel.textContent = 'Nenhum arquivo escolhido';
              nameLabel.style.color = '';
              nameLabel.style.fontWeight = '';
            }
          });
        } else {
          throw new Error('HTTP ' + res.status);
        }
      } catch(err) {
        console.error('Erro ao enviar:', err);
        showToast('❌ Erro ao enviar. Tente novamente.', 'error');
      } finally {
        if (submitBtn) {
          submitBtn.classList.remove('loading');
          submitBtn.disabled = false;
        }
      }
    });
  };

})();
