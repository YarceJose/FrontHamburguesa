import { HttpErrorResponse } from '@angular/common/http';
import { toApiError } from './api-error';

describe('toApiError', () => {
  it('translates a known API code', () => {
    const error = new HttpErrorResponse({ status: 409, error: { code: 'user.email_taken' } });
    expect(toApiError(error)).toEqual({
      status: 409,
      code: 'user.email_taken',
      message: 'Ya existe un usuario con ese correo.',
    });
  });

  it('falls back to the HTTP status when the code is unknown', () => {
    const error = new HttpErrorResponse({ status: 429 });
    expect(toApiError(error).message).toContain('Demasiados intentos');
  });

  it('handles a lost connection', () => {
    expect(toApiError(new HttpErrorResponse({ status: 0 })).message).toContain('No hay conexión');
  });
});
