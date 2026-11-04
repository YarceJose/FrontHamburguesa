import { HttpErrorResponse } from '@angular/common/http';

/** Spanish copy for the stable error codes returned by the API (ProblemDetails "code"). */
const MESSAGES: Record<string, string> = {
  'validation.failed': 'Revisa los datos ingresados.',
  'auth.invalid_credentials': 'Usuario o contraseña incorrectos.',
  'auth.forbidden': 'Tu rol no puede hacer esta acción.',
  'auth.wrong_current_password': 'La contraseña actual no es correcta.',
  'user.not_found': 'El usuario no existe.',
  'user.name_required': 'El nombre es obligatorio.',
  'user.email_required': 'El correo es obligatorio.',
  'user.password_required': 'La contraseña es obligatoria.',
  'user.email_taken': 'Ya existe un usuario con ese correo.',
  'user.role_not_staff': 'Ese rol no puede tener credenciales.',
  'user.role_change_not_allowed': 'No se puede cambiar entre cliente y personal.',
  'user.cannot_demote_self': 'No puedes quitarte el rol de administrador.',
  'user.cannot_deactivate_self': 'No puedes desactivar tu propio usuario.',
  'user.last_admin': 'Debe quedar al menos un administrador activo.',
  'customer.not_found': 'El cliente no existe.',
  'customer.phone_required': 'El teléfono es obligatorio.',
  'customer.phone_taken': 'Ya existe un cliente con ese teléfono.',
  'customer.password_not_allowed': 'Los clientes no tienen usuario ni contraseña.',
  'user.username_required': 'El usuario es obligatorio.',
  'user.username_invalid': 'El usuario debe tener de 3 a 30 letras minúsculas, números, punto, guion o guion bajo.',
  'user.username_taken': 'Ya existe alguien con ese usuario.',
  'store.closed': 'En este momento no estamos recibiendo pedidos.',
  'store.at_capacity': 'Tenemos muchos pedidos en este momento. Intenta en unos minutos.',
  'store.settings_invalid': 'Revisa los valores de la configuración.',
  'sector.required': 'Elige tu sector o escríbelo.',
  'sector.not_found': 'Ese sector ya no está disponible.',
  'sector.name_taken': 'Ya existe un sector con ese nombre.',
  'sector.name_required': 'Escribe el nombre del sector.',
  'product.not_found': 'Uno de los productos ya no está disponible.',
  'order.not_found': 'No encontramos ese pedido.',
  'order.empty': 'Agrega al menos un producto.',
  'order.invalid_quantity': 'Cada cantidad debe estar entre 1 y 50.',
  'order.invalid_transition': 'El pedido cambió de estado. Actualiza la vista.',
  'order.cash_too_low': 'El valor con el que pagas es menor que el total.',
  'order.not_transfer': 'Este pedido se paga en efectivo.',
  'order.receipt_invalid': 'Sube una imagen (JPG, PNG o WEBP) o un PDF de máximo 5 MB.',
  'payment_account.none_active': 'Por ahora no recibimos transferencias. Paga en efectivo.',
  'payment_account.not_found': 'La cuenta de pago no existe.',
  'payment_account.invalid': 'Completa banco, titular y número o llave.',
};

export interface ApiError {
  status: number;
  code: string | null;
  message: string;
}

export function toApiError(error: unknown): ApiError {
  if (!(error instanceof HttpErrorResponse)) {
    return { status: 0, code: null, message: 'Ocurrió un error inesperado.' };
  }

  const code: string | null = error.error?.code ?? null;
  const known = code ? MESSAGES[code] : undefined;
  return { status: error.status, code, message: known ?? messageForStatus(error.status) };
}

function messageForStatus(status: number): string {
  switch (status) {
    case 0:
      return 'No hay conexión con el servidor. Intenta de nuevo.';
    case 401:
      return 'Tu sesión no es válida. Inicia sesión de nuevo.';
    case 403:
      return 'No tienes permiso para esta acción.';
    case 429:
      return 'Demasiados intentos. Espera un minuto e inténtalo otra vez.';
    default:
      return status >= 500 ? 'El servidor tuvo un problema. Intenta más tarde.' : 'No se pudo completar la acción.';
  }
}
