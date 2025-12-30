import Swal from 'sweetalert2';

export const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
});

export const confirmDelete = (title, text) => {
  return Swal.fire({
    title: title || 'Tem certeza?',
    text: text || "Você não poderá reverter isso!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#9ca3af',
    confirmButtonText: 'Sim, excluir!',
    cancelButtonText: 'Cancelar'
  });
};
