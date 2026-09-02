import { ElapsedTimePipe } from './elapsed-time.pipe';
import { PercentValuePipe } from './percent.pipe';
import { StatusLabelPipe } from './status-label.pipe';

const DAY_MS = 24 * 60 * 60 * 1000;
const daysFromNow = (days: number) => new Date(Date.now() + days * DAY_MS).toISOString();

describe('ElapsedTimePipe', () => {
  const pipe = new ElapsedTimePipe();

  it('describe fechas pasadas en días', () => {
    expect(pipe.transform(daysFromNow(0))).toBe('Today');
    expect(pipe.transform(daysFromNow(-1))).toBe('Yesterday');
    expect(pipe.transform(daysFromNow(-5))).toBe('5 days ago');
  });

  it('agrupa en meses a partir de 30 días', () => {
    expect(pipe.transform(daysFromNow(-31))).toBe('1 month ago');
    expect(pipe.transform(daysFromNow(-65))).toBe('2 months ago');
  });

  it('describe fechas futuras', () => {
    expect(pipe.transform(daysFromNow(2))).toBe('In 2 days');
  });
});

describe('PercentValuePipe', () => {
  const pipe = new PercentValuePipe();

  it('formatea sin decimales por defecto', () => {
    expect(pipe.transform(65)).toBe('65%');
  });

  it('respeta los decimales pedidos', () => {
    expect(pipe.transform(65.456, 1)).toBe('65.5%');
  });
});

describe('StatusLabelPipe', () => {
  const pipe = new StatusLabelPipe();

  it('traduce estados conocidos a etiquetas legibles', () => {
    expect(pipe.transform('in-progress')).toBe('In Progress');
    expect(pipe.transform('on-hold')).toBe('On Hold');
    expect(pipe.transform('critical')).toBe('Critical');
  });

  it('devuelve el valor tal cual si no lo conoce', () => {
    expect(pipe.transform('unknown-status')).toBe('unknown-status');
  });
});
